import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

/* ── GET /api/user/verify — get current KYC status ── */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { kycStatus: true, kycSubmittedAt: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ kycStatus: user.kycStatus, kycSubmittedAt: user.kycSubmittedAt });
}

/* ── POST /api/user/verify — submit KYC documents ── */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, kycStatus: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.kycStatus === "VERIFIED")
    return NextResponse.json({ error: "Your account is already verified." }, { status: 400 });

  if (user.kycStatus === "PENDING")
    return NextResponse.json({ error: "Your verification is already under review." }, { status: 400 });

  const formData = await req.formData();
  const docFrontFile = formData.get("docFront") as File | null;
  const docBackFile  = formData.get("docBack")  as File | null;
  const selfieFile   = formData.get("selfie")   as File | null;

  if (!docFrontFile || !selfieFile)
    return NextResponse.json({ error: "Front ID and selfie are required." }, { status: 400 });

  const kycDir = join(process.cwd(), "public", "kyc");
  await mkdir(kycDir, { recursive: true });

  async function saveFile(file: File, prefix: string): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const fname = `${prefix}-${user!.id}-${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(kycDir, fname), buffer);
    return `/kyc/${fname}`;
  }

  const docFrontPath = await saveFile(docFrontFile, "front");
  const docBackPath  = docBackFile ? await saveFile(docBackFile, "back") : null;
  const selfiePath   = await saveFile(selfieFile, "selfie");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      kycStatus:      "PENDING",
      kycDocFront:    docFrontPath,
      kycDocBack:     docBackPath,
      kycSelfie:      selfiePath,
      kycSubmittedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, kycStatus: "PENDING" });
}
