import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { validatePaymentProof } from "@/lib/ocr";

/* ── POST /api/deposits/upload-proof ──────────────────
   User uploads payment proof (screenshot of transaction).
   
   Body: FormData with:
   - transactionId: string (from pending deposit)
   - proofImage: File (screenshot)
   - walletAddress: string (user's wallet for potential refund)
──────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const transactionId = formData.get("transactionId") as string;
  const proofFile = formData.get("proofImage") as File | null;
  const walletAddress = formData.get("walletAddress") as string;

  if (!transactionId || !proofFile || !walletAddress) {
    return NextResponse.json(
      { error: "Transaction ID, proof image, and wallet address required" },
      { status: 400 }
    );
  }

  // Validate wallet address format - support multiple cryptos
  const walletValidation = {
    // Ethereum/ERC20 (ETH, USDT-ETH, BNB on BSC)
    ethereum: /^0x[a-fA-F0-9]{40}$/,
    // Bitcoin Legacy
    btcLegacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    // Bitcoin SegWit (bech32)
    btcSegWit: /^bc1[a-z0-9]{39,59}$/,
    // Solana
    solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    // Tron (USDT-TRX)
    tron: /^T[A-Za-z1-9]{33}$/
  };

  const isValidWallet = 
    walletValidation.ethereum.test(walletAddress) ||
    walletValidation.btcLegacy.test(walletAddress) ||
    walletValidation.btcSegWit.test(walletAddress) ||
    walletValidation.solana.test(walletAddress) ||
    walletValidation.tron.test(walletAddress);
  
  if (!isValidWallet) {
    return NextResponse.json(
      { error: "Invalid wallet address format. Please enter a valid cryptocurrency wallet address (Ethereum, Bitcoin, Solana, Tron, or BNB)." },
      { status: 400 }
    );
  }

  // Verify transaction belongs to user
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  if (transaction.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (transaction.type !== "DEPOSIT") {
    return NextResponse.json(
      { error: "Only deposit transactions can have proofs" },
      { status: 400 }
    );
  }

  // Validate file is an image
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

  try {
    // Save proof image
    const proofDir = join(process.cwd(), "public", "proofs");
    await mkdir(proofDir, { recursive: true });

    const ext = proofFile.name.split(".").pop() || "jpg";
    const filename = `proof-${transactionId}-${randomUUID()}.${ext}`;
    const filepath = join(proofDir, filename);

    const buffer = Buffer.from(await proofFile.arrayBuffer());

    // Validate screenshot credentials using Tesseract OCR
    const ocrResult = await validatePaymentProof(buffer);
    if (!ocrResult.isValid) {
      return NextResponse.json({ error: ocrResult.reason }, { status: 400 });
    }

    await writeFile(filepath, buffer);

    const proofUrl = `/proofs/${filename}`;

    // Update transaction with proof
    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        proofImageUrl: proofUrl,
        proofStatus: "PENDING",
        userWalletAddress: walletAddress,
      },
    });

    // Notify all admins about new proof submission
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        type: "PAYMENT_PROOF_SUBMITTED",
        title: "New Payment Proof Submitted",
        message: `User ${transaction.user.name} submitted a ${transaction.method} payment proof for $${transaction.amount}. Please review in Payment Proofs section.`,
        read: false,
      })),
    });

    return NextResponse.json({
      success: true,
      message: "Proof uploaded successfully. Admin will review shortly.",
      transaction: updated,
    });
  } catch (error) {
    console.error("Error uploading proof:", error);
    return NextResponse.json(
      { error: "Failed to upload proof" },
      { status: 500 }
    );
  }
}
