import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let base64Url: string;

  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
      }

      const mimeType = file.type.toLowerCase();
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(mimeType)) {
        return NextResponse.json(
          { error: "Invalid format. Use JPEG, PNG, WebP or GIF." },
          { status: 400 }
        );
      }

      // Vercel serverless has a payload limit of 4.5MB. Keep size check strict.
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image too large. Maximum size is 4 MB." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      base64Url = `data:${mimeType};base64,${base64}`;

    } else {
      // JSON base64 upload
      const body = await req.json();
      const { dataUrl } = body;
      if (!dataUrl) {
        return NextResponse.json({ error: "No image data provided." }, { status: 400 });
      }

      const matches = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/i);
      if (!matches) {
        return NextResponse.json({ error: "Invalid image format." }, { status: 400 });
      }

      const mimeType = `image/${matches[1].toLowerCase() === "jpg" ? "jpeg" : matches[1].toLowerCase()}`;
      const base64Content = matches[2];
      const buffer = Buffer.from(base64Content, "base64");

      if (buffer.length > 4 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image too large. Maximum size is 4 MB." },
          { status: 400 }
        );
      }

      base64Url = `data:${mimeType};base64,${base64Content}`;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Save directly to user record in DB (works perfectly on Vercel/serverless)
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: base64Url },
    });

    return NextResponse.json({ success: true, avatar: base64Url });

  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to process image upload. Please try a smaller image." },
      { status: 500 }
    );
  }
}
