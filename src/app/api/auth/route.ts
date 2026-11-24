import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateInitData, createSessionToken } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initData, devUser } = body as {
      initData?: string;
      devUser?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        photo_url?: string;
      };
    };

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    let tgUser = devUser;

    if (initData && botToken) {
      const validated = validateInitData(initData, botToken);
      if (!validated?.user) {
        return NextResponse.json({ message: 'Invalid Telegram initData' }, { status: 401 });
      }
      tgUser = validated.user;
    } else if (initData && !botToken) {
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      if (userStr) tgUser = JSON.parse(userStr);
    }

    if (!tgUser?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      update: {
        username: tgUser.username || null,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name || null,
        avatarUrl: tgUser.photo_url || null,
      },
      create: {
        telegramId: BigInt(tgUser.id),
        username: tgUser.username || null,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name || null,
        avatarUrl: tgUser.photo_url || null,
        balanceTon: 10.0, // Welcome demo balance for local testing
        balanceGram: 5000,
      },
    });

    const token = createSessionToken(tgUser.id);

    return NextResponse.json({
      token,
      userId: user.id,
      telegramUser: tgUser,
      balanceTon: user.balanceTon,
      balanceGram: user.balanceGram,
      walletAddress: user.walletAddress,
    });
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }
}
