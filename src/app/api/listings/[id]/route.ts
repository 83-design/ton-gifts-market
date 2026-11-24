import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { MARKETPLACE_COMMISSION } from '@/lib/constants';
import { calculateCommission, tonToGram } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        gift: true,
        seller: {
          select: { id: true, username: true, firstName: true, avatarUrl: true },
        },
        offers: {
          where: { status: 'pending' },
          orderBy: { amountTon: 'desc' },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ message: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (err) {
    console.error('GET /api/listings/[id] error:', err);
    return NextResponse.json({ message: 'Failed to load listing' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { priceTon } = (await req.json()) as { priceTon?: number };
    if (!priceTon || priceTon <= 0) {
      return NextResponse.json({ message: 'Invalid price' }, { status: 400 });
    }

    const existing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!existing || existing.sellerId !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        priceTon,
        priceGram: tonToGram(priceTon),
        commission: calculateCommission(priceTon, MARKETPLACE_COMMISSION),
      },
    });

    return NextResponse.json({ listing: updated });
  } catch (err) {
    console.error('PUT /api/listings/[id] error:', err);
    return NextResponse.json({ message: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!existing || existing.sellerId !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.listing.update({
      where: { id: params.id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/listings/[id] error:', err);
    return NextResponse.json({ message: 'Failed to cancel listing' }, { status: 500 });
  }
}
