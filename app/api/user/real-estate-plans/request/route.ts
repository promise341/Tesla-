import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const { planName, paymentMethod, walletAddress, proofUrl } = await req.json();

    if (!planName || !paymentMethod || !walletAddress || !proofUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate plan exists
    const validPlans = [
      "Property Starter",
      "Property Growth", 
      "Property Premium",
      "Property Elite",
      "REIT Portfolio",
      "Luxury Estates"
    ];

    if (!validPlans.includes(planName)) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Check if user already has a pending request for this plan
    const existingRequest = await prisma.activePlan.findFirst({
      where: {
        userId: decoded.userId,
        planName,
        category: "real-estate",
        paymentStatus: "PENDING"
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this plan" },
        { status: 400 }
      );
    }

    // Create plan request with pending payment status
    const planRequest = await prisma.activePlan.create({
      data: {
        userId: decoded.userId,
        planName,
        capital: 0, // Will be updated when admin approves
        rate: 0,
        status: "PENDING",
        paymentMethod,
        paymentStatus: "PENDING",
        paymentProofUrl: proofUrl,
        userWalletAddress: walletAddress,
        category: "real-estate",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Request submitted successfully",
      requestId: planRequest.id,
    });
  } catch (error) {
    console.error("Error submitting real estate request:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
