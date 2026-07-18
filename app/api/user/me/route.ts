import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      country: true,
      balance: true,
      totalProfit: true,
      totalWithdraw: true,
      avatar: true,
      role: true,
      kycStatus: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if user is suspended - if so, force logout
  if (user.role === 'SUSPENDED') {
    return NextResponse.json({ 
      error: "Account suspended", 
      suspended: true,
      message: "Your account has been suspended. Please contact support." 
    }, { status: 403 });
  }

  // Retrieve the latest connected wallet if it exists
  const walletTx = await prisma.transaction.findFirst({
    where: {
      userId: user.id,
      address: "WALLET_CONNECT",
      status: "COMPLETED",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      method: true,
      userWalletAddress: true,
    },
  });

  const connectedWallet = walletTx ? {
    provider: walletTx.method,
    address: walletTx.userWalletAddress,
  } : null;

  return NextResponse.json({
    ...user,
    connectedWallet,
  });
}

/* ── PATCH /api/user/me ──────────────────────────────────────
   Updates editable profile fields: name, phone, country.
   Email and username are read-only (cannot be changed).
   Optional password change: requires currentPassword + newPassword.
──────────────────────────────────────────────────────────── */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, country, currentPassword, newPassword } = body;

  // Validate required editable fields
  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2))
    return NextResponse.json({ error: "Full name must be at least 2 characters." }, { status: 400 });

  if (phone !== undefined && (typeof phone !== "string" || phone.trim().length < 5))
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });

  if (country !== undefined && (typeof country !== "string" || country.trim().length < 2))
    return NextResponse.json({ error: "Please select a valid country." }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, passwordHash: true },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Build update data
  const updateData: Record<string, string> = {};
  if (name    !== undefined) updateData.name    = name.trim();
  if (phone   !== undefined) updateData.phone   = phone.trim();
  if (country !== undefined) updateData.country = country.trim();

  // Password change
  if (newPassword !== undefined) {
    if (!currentPassword)
      return NextResponse.json({ error: "Current password is required to set a new password." }, { status: 400 });
    if (typeof newPassword !== "string" || newPassword.length < 8)
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid)
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });

    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updateData).length === 0)
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: { id: true, name: true, username: true, email: true, phone: true, country: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
