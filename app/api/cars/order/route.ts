import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { createInsufficientBalanceError } from "@/app/lib/balanceUtils";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let user = null;

    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, balance: true, email: true, name: true }
      });
    } else {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      if (token) {
        try {
          const decoded = verify(token, JWT_SECRET) as { userId: string };
          user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, balance: true, email: true, name: true }
          });
        } catch {}
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      carId,
      carName,
      price,
      fullName,
      email,
      phone,
      company,
      street,
      city,
      state,
      postalCode,
      country,
      paymentMethod,
      walletAddress,
      proofUrl,
    } = await req.json();

    // Validate required fields
    if (!carId || !carName || !price || !fullName || !email || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isBalancePayment = paymentMethod === "BALANCE";

    // For crypto payments, require proof and wallet address
    if (!isBalancePayment && (!proofUrl || !walletAddress)) {
      return NextResponse.json(
        { error: "Payment proof and wallet address are required for crypto payments" },
        { status: 400 }
      );
    }

    // ── Balance validation for BALANCE payment method ──
    if (isBalancePayment) {
      if (user.balance < price) {
        const errorResponse = createInsufficientBalanceError(
          user.balance,
          price,
          'car purchase'
        );
        return NextResponse.json(errorResponse, { status: 400 });
      }
    }

    // Create order with all details
    if (isBalancePayment) {
      // Balance payment: deduct balance and mark as approved atomically
      const [order] = await prisma.$transaction([
        prisma.order.create({
          data: {
            userId: user.id,
            carId,
            carName,
            price,
            fullName,
            email,
            phone: phone || "",
            company: company || "",
            street,
            city,
            state: state || "",
            postalCode: postalCode || "",
            country,
            paymentMethod: "BALANCE",
            walletAddress: "N/A",
            proofUrl: "N/A",
            status: "APPROVED", // Instant approval for balance payments
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { balance: { decrement: price } },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "CAR_PURCHASE",
            amount: price,
            method: "BALANCE",
            address: `${carName} - ${carId}`,
            status: "COMPLETED",
          },
        }),
        prisma.notification.create({
          data: {
            userId: user.id,
            type: "ORDER_APPROVED",
            title: "🚗 Car Order Approved!",
            message: `Your order for ${carName} has been approved and will be processed soon.`,
            read: false,
          },
        }),
      ]);

      console.log(`[CAR ORDER] ${user.name || user.email} — ${carName} $${price} via BALANCE (INSTANT APPROVAL)`);

      return NextResponse.json({
        success: true,
        message: "Order submitted and approved successfully",
        orderId: order.id,
        instant: true,
      });
    } else {
      // Crypto payment: create pending order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          carId,
          carName,
          price,
          fullName,
          email,
          phone: phone || "",
          company: company || "",
          street,
          city,
          state: state || "",
          postalCode: postalCode || "",
          country,
          paymentMethod,
          walletAddress,
          proofUrl,
          status: "PENDING",
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "ORDER_SUBMITTED",
          title: "🚗 Car Order Submitted",
          message: `Your order for ${carName} has been submitted. Admin will review your payment proof within 24–48 hours.`,
          read: false,
        },
      });

      console.log(`[CAR ORDER] ${user.name || user.email} — ${carName} $${price} via ${paymentMethod} (PENDING)`);

      return NextResponse.json({
        success: true,
        message: "Order submitted successfully",
        orderId: order.id,
        instant: false,
      });
    }
  } catch (error) {
    console.error("Error creating car order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
