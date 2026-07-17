import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Public — browse giveaways and see winners
export async function GET() {
  const giveaways = await prisma.giveaway.findMany({
    orderBy: { endsAt: "asc" },
    include: {
      _count: { select: { entries: true } },
      entries: {
        where: { status: "WON" },
        select: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });
  return NextResponse.json(giveaways);
}
