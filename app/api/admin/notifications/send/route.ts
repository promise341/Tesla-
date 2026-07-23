import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { target, userId, title, message, type } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    let recipientIds: string[] = [];

    if (target === "single") {
      if (!userId) {
        return NextResponse.json({ error: "User ID is required for single notification" }, { status: 400 });
      }
      recipientIds = [userId];
    } else {
      // Send to all users
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      });
      recipientIds = allUsers.map((u) => u.id);
    }

    const notificationType = type || "SYSTEM";

    const notificationsData = recipientIds.map((id) => ({
      userId: id,
      type: notificationType,
      title: title.trim(),
      message: message.trim(),
      read: false,
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });

    return NextResponse.json({
      success: true,
      message: `Notification successfully sent to ${recipientIds.length} user(s).`,
      count: recipientIds.length,
    });
  } catch (error) {
    console.error("[ADMIN SEND NOTIFICATION ERROR]:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
