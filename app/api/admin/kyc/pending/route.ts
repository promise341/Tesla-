import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get users with KYC documents submitted
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { kycDocFront: { not: null } },
          { kycDocBack: { not: null } },
          { kycSelfie: { not: null } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        kycStatus: true,
        kycSubmittedAt: true,
        kycDocFront: true,
        kycDocBack: true,
        kycSelfie: true,
      },
      orderBy: { kycSubmittedAt: 'desc' }
    });

    // Convert to document format for the admin UI
    const documents = users.flatMap(user => {
      const docs = [];
      
      if (user.kycDocFront) {
        docs.push({
          id: `${user.id}-front`,
          userId: user.id,
          documentType: 'id',
          documentUrl: user.kycDocFront,
          status: user.kycStatus?.toLowerCase() || 'pending',
          submittedAt: user.kycSubmittedAt || user.kycSubmittedAt || new Date().toISOString(),
          user: {
            email: user.email,
            name: user.name
          }
        });
      }

      if (user.kycDocBack) {
        docs.push({
          id: `${user.id}-back`,
          userId: user.id,
          documentType: 'id',
          documentUrl: user.kycDocBack,
          status: user.kycStatus?.toLowerCase() || 'pending',
          submittedAt: user.kycSubmittedAt || new Date().toISOString(),
          user: {
            email: user.email,
            name: user.name
          }
        });
      }

      if (user.kycSelfie) {
        docs.push({
          id: `${user.id}-selfie`,
          userId: user.id,
          documentType: 'proof_of_address',
          documentUrl: user.kycSelfie,
          status: user.kycStatus?.toLowerCase() || 'pending',
          submittedAt: user.kycSubmittedAt || new Date().toISOString(),
          user: {
            email: user.email,
            name: user.name
          }
        });
      }

      return docs;
    });

    return NextResponse.json({
      success: true,
      documents: documents,
      count: documents.length
    });

  } catch (error) {
    console.error("Error fetching KYC documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC documents" }, 
      { status: 500 }
    );
  }
}


