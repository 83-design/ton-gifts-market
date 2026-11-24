import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { amount, currency = 'TON', address } = (await req.json()) as {
      amount?: number;
      currency?: 'TON' | 'GRAM';
      address?: string;
    };

    if (!amount || amount <= 0 || !address) {
      return NextResponse.json({ message: 'Invalid withdrawal request' }, { status: 400 });
    }

    const currentBalance = currency === 'GRAM' ? user.balanceGram : user.balanceTon;
    if (currentBalance < amount) {
      return NextResponse.json({ message: 'Недостаточно средств на балансе' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data:
          currency === 'GRAM'
            ? { balanceGram: { decrement: amount } }
            : { balanceTon: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          type: 'withdrawal',
          userId: user.id,
          amount,
          currency,
          status: 'pending',
          metadata: JSON.stringify({ destinationAddress: address }),
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/wallet/withdraw error:', err);
    return NextResponse.json({ message: 'Withdrawal failed' }, { status: 500 });
  }
}
