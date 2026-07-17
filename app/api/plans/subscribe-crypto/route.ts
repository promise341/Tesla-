import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { validatePaymentProof } from "@/lib/ocr";

/* ── POST /api/plans/subscribe-crypto ──────────────────
   User subscribes to investment plan with crypto payment.
   Creates PENDING plan that requires admin approval.
   
   Body: FormData with:
   - planName: string
   - amount: string (number)
   - paymentMethod: string (BTC, ETH, BNB, SOLANA, USDT)
   - proofImage: File (screenshot)
   - userWalletAddress: string (user's crypto wallet for refunds)
──────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, balance: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const formData = await req.formData();
    const planName = formData.get("planName") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const paymentMethod = formData.get("paymentMethod") as string;
    const proofFile = formData.get("proofImage") as File | null;
    const userWalletAddress = formData.get("userWalletAddress") as string;

    // Validate inputs
    if (!planName || !amount || !paymentMethod || !proofFile || !userWalletAddress) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!["BTC", "ETH", "BNB", "SOLANA", "USDT", "USDT-ETH", "USDT-TRX"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Validate wallet address format
    const isValidEthereum = userWalletAddress.startsWith("0x") && userWalletAddress.length === 42;
    const isValidBitcoin = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(userWalletAddress) || /^bc1[a-z0-9]{39,59}$/.test(userWalletAddress);
    const isValidSolana = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userWalletAddress);
    
    if (!isValidEthereum && !isValidBitcoin && !isValidSolana) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Validate proof file
    if (!proofFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Proof must be an image file" },
        { status: 400 }
      );
    }

    if (proofFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be smaller than 5MB" },
        { status: 400 }
      );
    }

    // Get plan details (you might want to validate against a plan list)
    // For now, we'll use the provided planName and infer rate from it
    // In production, you should validate against your PLANS array
    
    // Map plan names to rates (this should match your PLANS array in buy-plan page)
    const planRates: Record<string, number> = {
      // General plans
      "Test": 156,
      "Beginner Plan": 100,
      "Standard plan": 2.5,
      "Business plan": 3.1,
      "Basic Plan": 25,
      // Stock plans
      "Stock Starter Plan": 1.5,
      "Stock Growth Plan": 2.5,
      "Stock Premium Plan": 4.0,
      "Stock Elite Plan": 6.0,
      // Crypto plans
      "Crypto Starter": 2.5,
      "Crypto Growth": 5.0,
      "Crypto Premium": 10.0,
      // Real Estate plans
      "Property Starter": 1.5,
      "Property Growth": 2.5,
      "Property Premium": 4.0,
      "Property Elite": 6.0,
      "REIT Portfolio": 8.0,
      "Luxury Estates": 12.0,
    };

    const rate = planRates[planName];
    if (!rate) {
      return NextResponse.json(
        { error: "Invalid plan name" },
        { status: 400 }
      );
    }

    // Save proof image
    const proofDir = join(process.cwd(), "public", "proofs", "investments");
    await mkdir(proofDir, { recursive: true });

    const ext = proofFile.name.split(".").pop() || "jpg";
    const filename = `investment-proof-${randomUUID()}.${ext}`;
    const filepath = join(proofDir, filename);

    const buffer = Buffer.from(await proofFile.arrayBuffer());

    // Validate screenshot credentials using Tesseract OCR
    const ocrResult = await validatePaymentProof(buffer);
    if (!ocrResult.isValid) {
      return NextResponse.json({ error: ocrResult.reason }, { status: 400 });
    }

    await writeFile(filepath, buffer);

    const proofUrl = `/proofs/investments/${filename}`;

    // Create PENDING investment plan
    const activePlan = await prisma.activePlan.create({
      data: {
        userId: user.id,
        planName,
        capital: amount,
        rate,
        status: "PENDING_PAYMENT", // Special status for pending crypto payments
        paymentMethod,
        paymentStatus: "PENDING",
        paymentProofUrl: proofUrl,
        userWalletAddress,
      },
    });

    // Create transaction record for tracking
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "INVESTMENT",
        amount,
        method: paymentMethod,
        status: "PENDING",
        address: userWalletAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment proof uploaded. Awaiting admin approval.",
      plan: {
        id: activePlan.id,
        planName: activePlan.planName,
        amount: activePlan.capital,
        status: activePlan.status,
        paymentMethod: activePlan.paymentMethod,
      },
    });

  } catch (error) {
    console.error("[INVESTMENT CRYPTO PAYMENT ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to process crypto payment" },
      { status: 500 }
    );
  }
}
