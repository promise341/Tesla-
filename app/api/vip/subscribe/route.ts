import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { cardName, price, duration } = body;

  if (!cardName || !price || !duration)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate a short readable order ID like VIP-ABCD1234
  const shortId = "VIP-" + Math.random().toString(36).slice(2, 10).toUpperCase();

  // Calculate expiry date from duration string e.g. "1 Month", "3 Months"
  const months = parseInt(duration.split(" ")[0]) || 1;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + months);

  const membership = await prisma.vipMembership.create({
    data: {
      id: shortId,
      userId: user.id,
      cardName,
      price: Number(price),
      duration,
      status: "PENDING",
      payStatus: "PAYMENT_PENDING",
      expiresAt,
    },
  });

  return NextResponse.json({ success: true, membership }, { status: 201 });
}
