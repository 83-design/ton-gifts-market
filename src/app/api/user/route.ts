import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const [transactions, referralCount] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.user.count({
        where: { referredById: user.id },
      }),
    ]);

    const boughtTxs = transactions.filter((t) => t.type === 'purchase');
    const soldTxs = transactions.filter((t) => t.type === 'sale');
    const referralTxs = transactions.filter((t) => t.type === 'referral');

    const totalVolumeTon = [...boughtTxs, ...soldTxs]
      .filter((t) => t.currency === 'TON')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalVolumeGram = [...boughtTxs, ...soldTxs]
      .filter((t) => t.currency === 'GRAM')
      .reduce((acc, t) => acc + t.amount, 0);

    const referralEarnings = referralTxs.reduce((acc, t) => acc + t.amount, 0);

    return NextResponse.json({
      stats: {
        totalBought: boughtTxs.length,
        totalSold: soldTxs.length,
        totalVolumeTon,
        totalVolumeGram,
        referralCount,
        referralEarnings,
        referralCode: user.referralCode,
      },
      transactions,
    });
  } catch (err) {
    console.error('GET /api/user error:', err);
    return NextResponse.json({ message: 'Failed to load user profile' }, { status: 500 });
  }
}
