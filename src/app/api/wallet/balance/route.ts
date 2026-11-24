import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({
      balanceTon: user.balanceTon,
      balanceGram: user.balanceGram,
      walletAddress: user.walletAddress,
    });
  } catch (err) {
    console.error('GET /api/wallet/balance error:', err);
    return NextResponse.json({ message: 'Failed to load balance' }, { status: 500 });
  }
}
