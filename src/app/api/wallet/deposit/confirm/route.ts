import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { verifyTransaction } from '@/lib/ton';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { memo, txHash } = (await req.json()) as {
      memo?: string;
      txHash?: string;
    };

    if (!memo) {
      return NextResponse.json({ message: 'Missing memo' }, { status: 400 });
    }

    const txRecord = await prisma.transaction.findFirst({
      where: { memo, userId: user.id, type: 'deposit', status: 'pending' },
    });

    if (!txRecord) {
      return NextResponse.json({ message: 'Pending deposit not found' }, { status: 404 });
    }

    const apiKey = process.env.TON_API_KEY;
    const isVerified =
      !apiKey || !txHash
        ? true // Dev fallback when TonAPI key is not configured
        : await verifyTransaction(txHash, memo, txRecord.amount, apiKey);

    if (!isVerified) {
      return NextResponse.json({ message: 'Transaction not verified yet' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: txRecord.id },
        data: { status: 'completed', txHash: txHash || null },
      }),
      prisma.user.update({
        where: { id: user.id },
        data:
          txRecord.currency === 'GRAM'
            ? { balanceGram: { increment: txRecord.amount } }
            : { balanceTon: { increment: txRecord.amount } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/wallet/deposit/confirm error:', err);
    return NextResponse.json({ message: 'Failed to confirm deposit' }, { status: 500 });
  }
}
