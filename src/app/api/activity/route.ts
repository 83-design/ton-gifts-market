import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ActivityEvent, Currency } from '@/types';

export async function GET() {
  try {
    const txs = await prisma.transaction.findMany({
      where: {
        type: { in: ['purchase', 'sale', 'listing', 'offer'] },
        status: 'completed',
      },
      include: {
        user: {
          select: { id: true, username: true, firstName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const activities: ActivityEvent[] = [];

    for (const tx of txs) {
      if (!tx.metadata) continue;
      try {
        const meta = JSON.parse(tx.metadata) as {
          giftId: string;
          giftName: string;
          giftNumber: number;
          collection: string;
          imageUrl: string;
          rarity: string;
        };

        activities.push({
          id: tx.id,
          type: tx.type as ActivityEvent['type'],
          gift: {
            id: meta.giftId,
            name: meta.giftName,
            collection: meta.collection,
            number: meta.giftNumber,
            imageUrl: meta.imageUrl,
            rarity: meta.rarity,
          },
          user: tx.user,
          price: tx.amount,
          currency: tx.currency as Currency,
          createdAt: tx.createdAt.toISOString(),
        });
      } catch {
        // Ignore malformed metadata
      }
    }

    return NextResponse.json({ activities });
  } catch (err) {
    console.error('GET /api/activity error:', err);
    return NextResponse.json({ message: 'Failed to load activity' }, { status: 500 });
  }
}
