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

  // Deterministically generate a realistic mock wallet address based on email + provider
  let hash = 0;
  const seed = (session.user.email || "") + walletProvider;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = Math.abs(hash).toString(16).padEnd(8, "f") + 
              Math.abs(hash * 31).toString(16).padEnd(8, "a") +
              Math.abs(hash * 17).toString(16).padEnd(8, "b") +
              Math.abs(hash * 3).toString(16).padEnd(8, "c") +
              Math.abs(hash * 7).toString(16).padEnd(8, "d");

  let mockAddress = "0x" + hex.slice(0, 40);
  const prov = walletProvider.toLowerCase();
  if (prov.includes("solana") || prov.includes("phantom") || prov.includes("solflare")) {
    mockAddress = "Cp" + hex.slice(0, 42);
  } else if (prov.includes("bitcoin") || prov.includes("ledger") || prov.includes("trezor")) {
    mockAddress = "bc1q" + hex.slice(0, 38);
  }

  // Record as a system transaction so it appears in account history
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "DEPOSIT",          // re-using existing type enum
      amount: 0,
      method: walletProvider,
      address: "WALLET_CONNECT",
      userWalletAddress: mockAddress,
      status: "COMPLETED",
    },
  });

  return NextResponse.json({ success: true, walletProvider, walletAddress: mockAddress });
}
