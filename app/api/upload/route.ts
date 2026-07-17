import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { validatePaymentProof } from "@/lib/ocr";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate image file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File is too large (maximum 5MB)" }, { status: 400 });
    }

    // Determine target directory
    let subfolder = "general";
    if (type === "vip-payment-proof") {
      subfolder = "vip";
    } else if (type === "payment-proof" || type === "real-estate") {
      subfolder = "real-estate";
    } else if (type === "car-order" || type === "car-payment-proof") {
      subfolder = "cars";
    }

    const uploadDir = join(process.cwd(), "public", "proofs", subfolder);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${type}-${randomUUID()}.${ext}`;
    const filepath = join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate screenshot credentials using Tesseract OCR if it is a payment proof/order
    if (type.includes("proof") || type.includes("order") || type === "real-estate") {
      const ocrResult = await validatePaymentProof(buffer);
      if (!ocrResult.isValid) {
        return NextResponse.json({ error: ocrResult.reason }, { status: 400 });
      }
    }

    await writeFile(filepath, buffer);

    const url = `/proofs/${subfolder}/${filename}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("[UPLOAD API ERROR]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
