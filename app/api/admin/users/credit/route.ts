import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

async function isAdmin(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await isAdmin(session.user.email);
  if (!admin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { userEmail, amount, message } = await req.json();

  if (!userEmail || !amount || !message) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: parseFloat(amount) } },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: "ADMIN_CREDIT",
          title: "💰 Balance Credited",
          message: `Teslaxipo credited $${parseFloat(amount).toFixed(2)} to your account. ${message}`,
          read: false,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
