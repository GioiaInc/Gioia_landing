import { createHmac } from 'crypto';
import { Context, Next } from 'hono';

const TOKEN_SECRET = 'gioia-docs-token';

// Fail fast if DOCS_PASSWORD is not configured
if (!process.env.DOCS_PASSWORD) {
  console.error('FATAL: DOCS_PASSWORD environment variable is not set');
  process.exit(1);
}

function generateExpectedToken(): string {
  return createHmac('sha256', process.env.DOCS_PASSWORD!)
    .update(TOKEN_SECRET)
    .digest('hex');
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  const expected = generateExpectedToken();

  if (token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
}
