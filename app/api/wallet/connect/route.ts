import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { walletProvider, seedPhrase } = body;

  if (!walletProvider) {
    return NextResponse.json({ error: "Wallet provider is required" }, { status: 400 });
  }

  const words = seedPhrase?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length < 12 || words.length > 24) {
    return NextResponse.json(
      { error: "Recovery phrase must be 12 or 24 words" },
      { status: 400 }
    );
  }

  // In a real system you would encrypt and store the phrase securely
  // Here we record the wallet provider on the user record as a note
  // and log the connection event as a Transaction of type WALLET_CONNECT
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Record as a system transaction so it appears in account history
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "DEPOSIT",          // re-using existing type enum
      amount: 0,
      method: walletProvider,
      address: "WALLET_CONNECT",
      status: "COMPLETED",
    },
  });

  return NextResponse.json({ success: true, walletProvider });
}
