import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const DOCS_PASSWORD = process.env.DOCS_PASSWORD || '';
const TOKEN_SECRET = 'gioia-docs-token';

function generateToken(): string {
  return createHmac('sha256', DOCS_PASSWORD)
    .update(TOKEN_SECRET)
    .digest('hex');
}

// POST: verify password, return token
export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!DOCS_PASSWORD) {
    return NextResponse.json(
      { error: 'Docs password not configured' },
      { status: 500 }
    );
  }

  if (password === DOCS_PASSWORD) {
    return NextResponse.json({ valid: true, token: generateToken() });
  }

  return NextResponse.json({ valid: false }, { status: 401 });
}

// GET: verify existing token
export async function GET(req: NextRequest) {
  const token = req.headers.get('x-docs-token');

  if (!token || !DOCS_PASSWORD) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  if (token === generateToken()) {
    return NextResponse.json({ valid: true });
  }

  return NextResponse.json({ valid: false }, { status: 401 });
}
