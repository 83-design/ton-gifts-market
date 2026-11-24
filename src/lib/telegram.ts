import crypto from 'crypto';

interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
    is_premium?: boolean;
  };
  auth_date: number;
  hash: string;
}

export function validateInitData(initData: string, botToken: string): TelegramInitData | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    params.delete('hash');
    const dataCheckArr = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`);
    const dataCheckString = dataCheckArr.join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) return null;

    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) return null;

    const userStr = params.get('user');
    const user = userStr ? JSON.parse(userStr) : undefined;

    return {
      query_id: params.get('query_id') || undefined,
      user,
      auth_date: authDate,
      hash,
    };
  } catch {
    return null;
  }
}

export function createSessionToken(telegramId: number): string {
  const secret = process.env.AUTH_SECRET || 'dev-secret-change-me';
  const payload = `${telegramId}:${Date.now()}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifySessionToken(token: string): number | null {
  try {
    const secret = process.env.AUTH_SECRET || 'dev-secret-change-me';
    const decoded = Buffer.from(token, 'base64').toString();
    const [telegramIdStr, timestampStr, signature] = decoded.split(':');

    if (!telegramIdStr || !timestampStr || !signature) return null;

    const payload = `${telegramIdStr}:${timestampStr}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) return null;

    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 7 * 86400 * 1000) return null;

    return parseInt(telegramIdStr, 10);
  } catch {
    return null;
  }
}
