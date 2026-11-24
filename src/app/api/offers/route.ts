import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const listingId = req.nextUrl.searchParams.get('listingId');
    const user = await getAuthUser(req);

    const offers = await prisma.offer.findMany({
      where: {
        ...(listingId ? { listingId } : user ? { buyerId: user.id } : {}),
      },
      include: {
        buyer: {
          select: { id: true, username: true, firstName: true, avatarUrl: true },
        },
        listing: {
          include: { gift: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ offers });
  } catch (err) {
    console.error('GET /api/offers error:', err);
    return NextResponse.json({ message: 'Failed to load offers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { listingId, amountTon, message } = (await req.json()) as {
      listingId?: string;
      amountTon?: number;
      message?: string;
    };

    if (!listingId || !amountTon || amountTon <= 0) {
      return NextResponse.json({ message: 'Invalid offer parameters' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { gift: true },
    });

    if (!listing || listing.status !== 'active') {
      return NextResponse.json({ message: 'Listing not available' }, { status: 404 });
    }

    const offer = await prisma.offer.create({
      data: {
        listingId,
        buyerId: user.id,
        amountTon,
        message: message || null,
        status: 'pending',
        expiresAt: new Date(Date.now() + 3 * 86400 * 1000),
      },
    });

    await prisma.transaction.create({
      data: {
        type: 'offer',
        userId: user.id,
        amount: amountTon,
        currency: 'TON',
        status: 'completed',
        metadata: JSON.stringify({
          giftId: listing.gift.id,
          giftName: listing.gift.name,
          giftNumber: listing.gift.number,
          collection: listing.gift.collection,
          imageUrl: listing.gift.imageUrl,
          rarity: listing.gift.rarity,
        }),
      },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (err) {
    console.error('POST /api/offers error:', err);
    return NextResponse.json({ message: 'Failed to create offer' }, { status: 500 });
  }
}
