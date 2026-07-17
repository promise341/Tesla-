import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// Per-expert daily rates (matched by expert name)
const EXPERT_RATES: Record<string, number> = {
  "Isabella Foster": 2.5,
  "Alex Thompson":   1.8,
  "Stacy R. Hall":   1.5,
  "Jarvis B. Buckley": 3.0,
  "Mara Dao":        1.2,
  "James Whitfield": 2.0,
  "Sofia Reyes":     2.8,
  "Marcus Chen":     3.2,
  "Priya Patel":     1.4,
  "David Laurent":   1.1,
  "Amara Osei":      1.7,
  "Lucas Hoffmann":  2.1,
  "Yuna Kim":        2.4,
  "Omar Khalil":     1.6,
  "Rachel Stone":    2.7,
  "Tomás Vidal":     1.3,
  "Aisha Mensah":    1.5,
  "Chen Wei":        3.5,
  "Nadia Volkov":    2.3,
  "Kevin O'Brien":   1.2,
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { expertName, amount } = body;

  if (!expertName || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: "Invalid expert or amount" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, balance: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (Number(amount) > user.balance) {
    return NextResponse.json(
      { error: `Insufficient balance. Your available balance is $${Number(user.balance).toFixed(2)}` },
      { status: 400 }
    );
  }

  const rate = EXPERT_RATES[expertName] ?? 2.0;

  // Deduct balance + create active plan + log transaction
  const [activePlan] = await prisma.$transaction([
    prisma.activePlan.create({
      data: {
        userId:   user.id,
        planName: `COPY: ${expertName}`,
        capital:  Number(amount),
        rate,
        status:   "ACTIVE",
        category: "copy-trade",
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data:  { balance: { decrement: Number(amount) } },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type:   "COPY_TRADE",
        amount: Number(amount),
        method: "BALANCE",
        address: `Copy Trading: ${expertName}`,
        status: "COMPLETED",
      },
    }),
  ]);

  return NextResponse.json({ success: true, activePlan, rate }, { status: 201 });
}
