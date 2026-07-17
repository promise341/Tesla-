import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json({ exists: false });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: q.toLowerCase() },
        { username: q },
      ],
    },
    select: { id: true, name: true, username: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ exists: false });
  }

  // Prevent sending to self
  if (user.email === session.user.email) {
    return NextResponse.json({ exists: false, isSelf: true });
  }

  return NextResponse.json({
    exists: true,
    name: user.name,
    username: user.username,
  });
}
