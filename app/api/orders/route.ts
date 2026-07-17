import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    carId, carName, price,
    paymentMethod, walletAddress, proofUrl,
    fullName, email, phone, company,
    street, city, state, postalCode, country,
  } = body;

  const isBalancePayment = paymentMethod === "BALANCE";

  // Required fields for all payment types
  if (!carId || !paymentMethod || !fullName || !email || !street || !city || !country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Crypto payments need proof + wallet
  if (!isBalancePayment && (!proofUrl || !walletAddress)) {
    return NextResponse.json(
      { error: "Payment proof and wallet address are required for crypto payments" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // ── Balance check ────────────────────────────────────────────────────────
  if (isBalancePayment) {
    if (user.balance < price) {
      const shortfall = (price - user.balance).toFixed(2);
      return NextResponse.json(
        {
          error: "Insufficient balance",
          message: `You need $${Number(price).toLocaleString()} but your balance is $${user.balance.toFixed(2)}. Please deposit $${shortfall} more.`,
          insufficientBalance: true,
          currentBalance: user.balance,
          requiredAmount: price,
          shortfall: Number(shortfall),
        },
        { status: 400 }
      );
    }
  }

  // ── Create order (+ deduct balance if paying via balance) ────────────────
  let order;

  if (isBalancePayment) {
    const [newOrder] = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId: user.id,
          carId,
          carName,
          price,
          fullName,
          email,
          phone:       phone       ?? "",
          company:     company     ?? "",
          street,
          city,
          state:       state       ?? "",
          postalCode:  postalCode  ?? "",
          country,
          paymentMethod,
          walletAddress: "",
          proofUrl:      "",
          status: "CONFIRMED",
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: price } },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type:   "CAR_PURCHASE",
          amount: price,
          method: "BALANCE",
          address: `Car Order: ${carName}`,
          status: "COMPLETED",
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type:    "CAR_ORDER_CONFIRMED",
          title:   "🚗 Car Order Confirmed!",
          message: `Your order for ${carName} has been confirmed and $${Number(price).toLocaleString()} has been deducted from your balance. Admin will contact you with delivery details.`,
          read: false,
        },
      }),
    ]);
    order = newOrder;
  } else {
    order = await prisma.order.create({
      data: {
        userId: user.id,
        carId,
        carName,
        price,
        fullName,
        email,
        phone:       phone       ?? "",
        company:     company     ?? "",
        street,
        city,
        state:       state       ?? "",
        postalCode:  postalCode  ?? "",
        country,
        paymentMethod,
        walletAddress: walletAddress ?? "",
        proofUrl:      proofUrl      ?? "",
        status: "PENDING",
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type:    "CAR_ORDER_SUBMITTED",
        title:   "Car Order Submitted",
        message: `Your order for ${carName} has been submitted. Admin will review your payment proof and contact you within 24–48 hours.`,
        read: false,
      },
    });
  }

  console.log(`[CAR ORDER] ${user.name} ordered ${carName} $${price} via ${paymentMethod} (${isBalancePayment ? "INSTANT" : "PENDING"})`);

  return NextResponse.json({ success: true, order, instant: isBalancePayment }, { status: 201 });
}
