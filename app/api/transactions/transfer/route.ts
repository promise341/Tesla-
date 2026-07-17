import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

/* ── POST /api/transactions/transfer ───────────────────────
   Transfers funds between two platform users.

   Body: { recipient: string (email OR username), amount: number, note?: string }

   Rules:
   - Minimum transfer: $50
   - Cannot transfer to yourself
   - Must have sufficient balance
   - Fee: 0%
   - Atomic: debit sender + credit recipient in one DB transaction
   - Creates two Transaction records: WITHDRAWAL for sender, DEPOSIT for recipient
──────────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { recipient, amount, note } = body;

  // ── Validate inputs ──
  if (!recipient || typeof recipient !== "string" || recipient.trim() === "")
    return NextResponse.json({ error: "Recipient email or username is required." }, { status: 400 });

  const parsedAmount = Number(amount);
  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0)
    return NextResponse.json({ error: "Enter a valid transfer amount." }, { status: 400 });

  if (parsedAmount < 50)
    return NextResponse.json({ error: "Minimum transfer amount is $50.00." }, { status: 400 });

  // ── Find sender ──
  const sender = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, username: true, email: true, balance: true },
  });
  if (!sender)
    return NextResponse.json({ error: "Sender account not found." }, { status: 404 });

  // ── Find recipient by email OR username ──
  const recipientUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email:    recipient.trim().toLowerCase() },
        { username: recipient.trim() },
      ],
    },
    select: { id: true, name: true, username: true, email: true },
  });

  if (!recipientUser)
    return NextResponse.json(
      { error: `No user found with email or username "${recipient.trim()}". Please check and try again.` },
      { status: 404 }
    );

  // ── Cannot transfer to yourself ──
  if (recipientUser.id === sender.id)
    return NextResponse.json({ error: "You cannot transfer funds to yourself." }, { status: 400 });

  // ── Check balance ──
  if (sender.balance < parsedAmount)
    return NextResponse.json(
      { error: `Insufficient balance. Your available balance is $${sender.balance.toFixed(2)}.` },
      { status: 400 }
    );

  // ── Atomic transfer ──
  const reference = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const transferNote = note?.trim() || "";
  const addressNote  = `To: ${recipientUser.name} (@${recipientUser.username}) | Ref: ${reference}${transferNote ? ` | Note: ${transferNote}` : ""}`;
  const receiveNote  = `From: ${sender.name} (@${sender.username}) | Ref: ${reference}${transferNote ? ` | Note: ${transferNote}` : ""}`;

  try {
    const [senderTx, recipientTx] = await prisma.$transaction([
      // Debit sender
      prisma.user.update({
        where: { id: sender.id },
        data:  { balance: { decrement: parsedAmount } },
      }),
      // Credit recipient
      prisma.user.update({
        where: { id: recipientUser.id },
        data:  { balance: { increment: parsedAmount } },
      }),
      // Record sender withdrawal
      prisma.transaction.create({
        data: {
          userId:  sender.id,
          type:    "WITHDRAWAL",
          amount:  parsedAmount,
          method:  "INTERNAL_TRANSFER",
          address: addressNote,
          status:  "COMPLETED",
        },
      }),
      // Record recipient deposit
      prisma.transaction.create({
        data: {
          userId:  recipientUser.id,
          type:    "DEPOSIT",
          amount:  parsedAmount,
          method:  "INTERNAL_TRANSFER",
          address: receiveNote,
          status:  "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      success:   true,
      reference,
      amount:    parsedAmount,
      recipient: { name: recipientUser.name, username: recipientUser.username },
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: "Transfer failed. Please try again." }, { status: 500 });
  }
}

/* ── GET /api/transactions/transfer ─────────────────────────
   Returns the logged-in user's internal transfer history
   (both sent and received), newest first.
──────────────────────────────────────────────────────────── */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const transfers = await prisma.transaction.findMany({
    where: { userId: user.id, method: "INTERNAL_TRANSFER" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(transfers);
}
