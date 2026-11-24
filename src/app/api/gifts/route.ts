import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const listedParam = req.nextUrl.searchParams.get('listed');

    const gifts = await prisma.gift.findMany({
      where: {
        ownerId: user.id,
        ...(listedParam === 'true'
          ? { listing: { status: 'active' } }
          : listedParam === 'false'
            ? { OR: [{ listing: null }, { listing: { status: { not: 'active' } } }] }
            : {}),
      },
      include: {
        listing: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ gifts });
  } catch (err) {
    console.error('GET /api/gifts error:', err);
    return NextResponse.json({ message: 'Failed to load gifts' }, { status: 500 });
  }
}
