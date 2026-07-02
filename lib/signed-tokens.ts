import { createHmac } from 'crypto';

/**
 * Generate a signed token for unsubscribe links.
 * Token format: base64(userId|type|timestamp|signature)
 */
export function generateUnsubscribeToken(userId: string, type: string): string {
  const secret = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-secret';
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `${userId}|${type}|${timestamp}`;
  const signature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  const token = Buffer.from(`${payload}|${signature}`).toString('base64');
  return token;
}

/**
 * Verify and parse an unsubscribe token.
 * Returns { userId, type, timestamp } on success or null on failure.
 * Token expires after 7 days.
 */
export function verifyUnsubscribeToken(token: string): { userId: string; type: string; timestamp: number } | null {
  try {
    const secret = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-secret';
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, type, timestamp, signature] = decoded.split('|');

    if (!userId || !type || !timestamp || !signature) {
      return null;
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(`${userId}|${type}|${timestamp}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    const tokenAge = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
    const maxAge = 7 * 24 * 60 * 60; // 7 days

    if (tokenAge > maxAge) {
      return null;
    }

    return { userId, type, timestamp: parseInt(timestamp, 10) };
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
}
