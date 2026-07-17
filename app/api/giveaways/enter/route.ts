import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { giveawayId } = await req.json();
  if (!giveawayId)
    return NextResponse.json({ error: "Giveaway ID required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const giveaway = await prisma.giveaway.findUnique({ where: { id: giveawayId } });
  if (!giveaway) return NextResponse.json({ error: "Giveaway not found" }, { status: 404 });
  if (giveaway.status !== "ACTIVE")
    return NextResponse.json({ error: "This giveaway is no longer active" }, { status: 400 });
  if (new Date() > giveaway.endsAt)
    return NextResponse.json({ error: "This giveaway has ended" }, { status: 400 });

  // Check max entries limit
  if (giveaway.maxEntries > 0) {
    const count = await prisma.giveawayEntry.count({ where: { giveawayId } });
    if (count >= giveaway.maxEntries)
      return NextResponse.json({ error: "This giveaway is full" }, { status: 400 });
  }

  // Unique constraint handles duplicate entry gracefully
  try {
    const entry = await prisma.giveawayEntry.create({
      data: { userId: user.id, giveawayId, status: "ENTERED" },
    });
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "You have already entered this giveaway" }, { status: 409 });
  }
}
