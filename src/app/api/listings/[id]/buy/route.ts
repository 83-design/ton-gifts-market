import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createTonDepositTx } from '@/lib/ton';
import { generateMemo } from '@/lib/utils';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { paymentMethod } = (await req.json()) as {
      paymentMethod?: 'balance' | 'direct';
    };

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { gift: true, seller: true },
    });

    if (!listing || listing.status !== 'active') {
      return NextResponse.json({ message: 'Listing is not active' }, { status: 404 });
    }

    if (listing.sellerId === user.id) {
      return NextResponse.json({ message: 'Cannot buy your own gift' }, { status: 400 });
    }

    if (paymentMethod === 'direct') {
      const escrow =
        process.env.ESCROW_WALLET_ADDRESS ||
        'UQDemoEscrowAddress1234567890abcdefghijklmnop';
      const memo = `buy_${listing.id}_${generateMemo()}`;
      const txParams = createTonDepositTx(escrow, listing.priceTon, memo);
      return NextResponse.json({
        transaction: txParams.messages[0],
        memo,
      });
    }

    // Internal balance purchase
    if (user.balanceTon < listing.priceTon) {
      return NextResponse.json({ message: 'Недостаточно TON на балансе' }, { status: 400 });
    }

    const sellerReceives = Math.max(0, listing.priceTon - listing.commission);
    const giftMeta = JSON.stringify({
      giftId: listing.gift.id,
      giftName: listing.gift.name,
      giftNumber: listing.gift.number,
      collection: listing.gift.collection,
      imageUrl: listing.gift.imageUrl,
      rarity: listing.gift.rarity,
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balanceTon: { decrement: listing.priceTon } },
      }),
      prisma.user.update({
        where: { id: listing.sellerId },
        data: { balanceTon: { increment: sellerReceives } },
      }),
      prisma.gift.update({
        where: { id: listing.giftId },
        data: { ownerId: user.id },
      }),
      prisma.listing.update({
        where: { id: listing.id },
        data: { status: 'sold', buyerId: user.id },
      }),
      prisma.transaction.create({
        data: {
          type: 'purchase',
          userId: user.id,
          amount: listing.priceTon,
          currency: 'TON',
          status: 'completed',
          relatedUserId: listing.sellerId,
          metadata: giftMeta,
        },
      }),
      prisma.transaction.create({
        data: {
          type: 'sale',
          userId: listing.sellerId,
          amount: sellerReceives,
          currency: 'TON',
          status: 'completed',
          relatedUserId: user.id,
          metadata: giftMeta,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/listings/[id]/buy error:', err);
    return NextResponse.json({ message: 'Purchase failed' }, { status: 500 });
  }
}
