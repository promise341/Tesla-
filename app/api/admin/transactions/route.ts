import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
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

  try {
    const { searchParams } = new URL(request.url);
    const export_csv = searchParams.get('export');

    // Fetch all transactions with user data
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Process transaction data
    const processedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      currency: 'USD', // Default since we don't have this field
      status: transaction.status,
      description: transaction.method ? `${transaction.type} via ${transaction.method}` : transaction.type,
      createdAt: transaction.createdAt,
      updatedAt: transaction.createdAt, // Use createdAt since no updatedAt
      user: {
        email: transaction.user.email,
        name: transaction.user.name,
      },
      metadata: {
        cryptoType: transaction.method,
        walletAddress: transaction.address,
        transactionHash: null,
        proofUrl: null,
      }
    }));

    // Handle CSV export
    if (export_csv === 'csv') {
      const csvHeaders = [
        'ID',
        'User Email',
        'User Name',
        'Type',
        'Amount',
        'Currency',
        'Status',
        'Description',
        'Created At',
        'Crypto Type',
        'Wallet Address'
      ];

      const csvRows = processedTransactions.map(tx => [
        tx.id,
        tx.user.email,
        tx.user.name || '',
        tx.type,
        tx.amount,
        tx.currency,
        tx.status,
        tx.description,
        tx.createdAt.toISOString(),
        tx.metadata.cryptoType || '',
        tx.metadata.walletAddress || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      transactions: processedTransactions 
    });

  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" }, 
      { status: 500 }
    );
  }
}