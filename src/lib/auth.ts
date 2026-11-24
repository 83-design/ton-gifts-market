import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySessionToken } from '@/lib/telegram';

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const telegramId = verifySessionToken(token);
    if (telegramId) {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) },
      });
      if (user) return user;
    }
  }

  // Dev fallback when running locally without TMA initData
  if (process.env.NODE_ENV !== 'production') {
    const devUser = await prisma.user.findUnique({
      where: { telegramId: BigInt(123456789) },
    });
    if (devUser) return devUser;
  }

  return null;
}
