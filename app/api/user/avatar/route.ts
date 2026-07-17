import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

// App Router: set max body size via route segment config
export const maxDuration = 30;

/* ── POST /api/user/avatar ──────────────────────────────────
   Accepts multipart/form-data with a "file" field.
   Saves the image to /public/avatars/<uuid>.<ext>
   Updates User.avatar in DB.
   Returns { avatar: "/avatars/<uuid>.<ext>" }
──────────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let buffer: Buffer;
  let ext: string;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    // ── FormData upload (preferred — no size issues) ──
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: "Invalid format. Use JPEG, PNG or WebP." }, { status: 400 });

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "Image too large. Maximum size is 5 MB." }, { status: 400 });

    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
    ext = file.type === "image/jpeg" ? "jpg"
        : file.type === "image/png"  ? "png"
        : file.type === "image/webp" ? "webp"
        : "gif";

  } else {
    // ── Fallback: JSON base64 ──
    const body = await req.json();
    const { dataUrl } = body;
    if (!dataUrl) return NextResponse.json({ error: "No image data provided." }, { status: 400 });

    const matches = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/i);
    if (!matches) return NextResponse.json({ error: "Invalid image format." }, { status: 400 });

    ext    = matches[1].toLowerCase() === "jpeg" ? "jpg" : matches[1].toLowerCase();
    buffer = Buffer.from(matches[2], "base64");

    if (buffer.length > 5 * 1024 * 1024)
      return NextResponse.json({ error: "Image too large. Maximum 5 MB." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Save to public/avatars/
  const filename  = `${randomUUID()}.${ext}`;
  const avatarDir = join(process.cwd(), "public", "avatars");
  await mkdir(avatarDir, { recursive: true });
  await writeFile(join(avatarDir, filename), buffer);

  const avatarPath = `/avatars/${filename}`;

  await prisma.user.update({
    where: { id: user.id },
    data:  { avatar: avatarPath },
  });

  return NextResponse.json({ success: true, avatar: avatarPath });
}
