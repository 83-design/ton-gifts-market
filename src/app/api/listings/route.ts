import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { MARKETPLACE_COMMISSION } from '@/lib/constants';
import { calculateCommission, tonToGram } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const collection = sp.get('collection') || undefined;
    const rarity = sp.get('rarity') || undefined;
    const priceMin = sp.get('priceMin') ? parseFloat(sp.get('priceMin')!) : undefined;
    const priceMax = sp.get('priceMax') ? parseFloat(sp.get('priceMax')!) : undefined;
    const sortBy = sp.get('sortBy') || 'newest';

    const orderBy =
      sortBy === 'price_asc'
        ? { priceTon: 'asc' as const }
        : sortBy === 'price_desc'
          ? { priceTon: 'desc' as const }
          : sortBy === 'rarest'
            ? { gift: { modelRarity: 'asc' as const } }
            : { createdAt: 'desc' as const };

    const listings = await prisma.listing.findMany({
      where: {
        status: 'active',
        ...(priceMin !== undefined || priceMax !== undefined
          ? {
              priceTon: {
                ...(priceMin !== undefined ? { gte: priceMin } : {}),
                ...(priceMax !== undefined ? { lte: priceMax } : {}),
              },
            }
          : {}),
        gift: {
          ...(collection ? { collection } : {}),
          ...(rarity ? { rarity } : {}),
        },
      },
      include: {
        gift: true,
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            avatarUrl: true,
          },
        },
        _count: { select: { offers: true } },
      },
      orderBy,
    });

    return NextResponse.json({ listings });
  } catch (err) {
    console.error('GET /api/listings error:', err);
    return NextResponse.json({ message: 'Failed to load listings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { giftId, priceTon } = (await req.json()) as {
      giftId?: string;
      priceTon?: number;
    };

    if (!giftId || !priceTon || priceTon <= 0) {
      return NextResponse.json({ message: 'Invalid giftId or priceTon' }, { status: 400 });
    }

    const gift = await prisma.gift.findUnique({
      where: { id: giftId },
      include: { listing: true },
    });

    if (!gift || gift.ownerId !== user.id) {
      return NextResponse.json({ message: 'Gift not found or not owned by you' }, { status: 404 });
    }

    if (gift.listing && gift.listing.status === 'active') {
      return NextResponse.json({ message: 'Gift is already listed' }, { status: 409 });
    }

    const commission = calculateCommission(priceTon, MARKETPLACE_COMMISSION);
    const priceGram = tonToGram(priceTon);

    const listing = await prisma.$transaction(async (tx) => {
      if (gift.listing) {
        return tx.listing.update({
          where: { id: gift.listing.id },
          data: {
            sellerId: user.id,
            priceTon,
            priceGram,
            commission,
            status: 'active',
            buyerId: null,
          },
        });
      }
      return tx.listing.create({
        data: {
          giftId: gift.id,
          sellerId: user.id,
          priceTon,
          priceGram,
          commission,
          status: 'active',
        },
      });
    });

    await prisma.transaction.create({
      data: {
        type: 'listing',
        userId: user.id,
        amount: priceTon,
        currency: 'TON',
        status: 'completed',
        metadata: JSON.stringify({
          giftId: gift.id,
          giftName: gift.name,
          giftNumber: gift.number,
          collection: gift.collection,
          imageUrl: gift.imageUrl,
          rarity: gift.rarity,
        }),
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error('POST /api/listings error:', err);
    return NextResponse.json({ message: 'Failed to create listing' }, { status: 500 });
  }
}
