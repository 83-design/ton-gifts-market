import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createTonDepositTx } from '@/lib/ton';
import { generateMemo } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { amount, currency = 'TON', memo: clientMemo } = (await req.json()) as {
      amount?: number;
      currency?: 'TON' | 'GRAM';
      memo?: string;
    };

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    const memo = clientMemo || generateMemo();
    const escrowAddress =
      process.env.ESCROW_WALLET_ADDRESS ||
      'UQDemoEscrowAddress1234567890abcdefghijklmnop';

    await prisma.transaction.create({
      data: {
        type: 'deposit',
        userId: user.id,
        amount,
        currency,
        status: 'pending',
        memo,
      },
    });

    const tx = createTonDepositTx(escrowAddress, amount, memo);

    return NextResponse.json({
      memo,
      transaction: tx.messages[0],
    });
  } catch (err) {
    console.error('POST /api/wallet/deposit error:', err);
    return NextResponse.json({ message: 'Failed to initiate deposit' }, { status: 500 });
  }
}
