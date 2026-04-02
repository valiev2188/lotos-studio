import crypto from 'node:crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface ParsedInitData {
  user: TelegramUser;
  authDate: number;
  hash: string;
  queryId?: string;
}

export function verifyTelegramInitData(initData: string, botToken: string): ParsedInitData {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');

  if (!hash) {
    throw new Error('Missing hash in initData');
  }

  params.delete('hash');

  const entries = Array.from(params.entries());
  entries.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([key, value]) => `${key}=${value}`).join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) {
    throw new Error('Invalid initData signature');
  }

  const authDate = Number(params.get('auth_date'));
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 300) {
    throw new Error('initData is expired (>5 minutes)');
  }

  const userStr = params.get('user');
  if (!userStr) {
    throw new Error('Missing user data in initData');
  }

  const user: TelegramUser = JSON.parse(userStr);

  return {
    user,
    authDate,
    hash,
    queryId: params.get('query_id') ?? undefined,
  };
}
