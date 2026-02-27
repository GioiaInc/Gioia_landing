import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { streamChat } from '../lib/agent.js';
import { getOrCreateSession, appendMessage, getSessionHistory } from '../lib/db.js';
import { checkRateLimit } from '../lib/rate-limit.js';

const MAX_MESSAGE_LENGTH = 10_000; // 10k chars
const RATE_LIMIT_PER_IP = 20;      // 20 requests per minute per IP
const RATE_LIMIT_PER_SESSION = 10;  // 10 requests per minute per session
const RATE_WINDOW_MS = 60_000;      // 1 minute

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header('fly-client-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

const chat = new Hono();

chat.post('/', async (c) => {
  const body = await c.req.json<{
    message: string;
    session_id: string;
  }>();

  if (!body.message?.trim()) {
    return c.json({ error: 'Message is required' }, 400);
  }

  if (body.message.length > MAX_MESSAGE_LENGTH) {
    return c.json({ error: 'Message too long' }, 400);
  }

  if (!body.session_id?.trim()) {
    return c.json({ error: 'session_id is required' }, 400);
  }

  // Rate limit by IP
  const ip = getClientIp(c);
  const ipCheck = checkRateLimit(`ip:${ip}`, RATE_LIMIT_PER_IP, RATE_WINDOW_MS);
  if (!ipCheck.allowed) {
    const retryAfter = Math.ceil(ipCheck.retryAfterMs / 1000);
    return c.json(
      { error: `Too many requests. Try again in ${retryAfter}s.` },
      429
    );
  }

  // Rate limit by session
  const sessionId = body.session_id;
  const sessionCheck = checkRateLimit(`session:${sessionId}`, RATE_LIMIT_PER_SESSION, RATE_WINDOW_MS);
  if (!sessionCheck.allowed) {
    const retryAfter = Math.ceil(sessionCheck.retryAfterMs / 1000);
    return c.json(
      { error: `Slow down. Try again in ${retryAfter}s.` },
      429
    );
  }

  // Ensure session exists and load history
  getOrCreateSession(sessionId);
  const history = getSessionHistory(sessionId);

  // Save user message
  appendMessage(sessionId, 'user', body.message);

  return streamSSE(c, async (stream) => {
    let fullResponse = '';

    try {
      for await (const chunk of streamChat(body.message, history)) {
        fullResponse += chunk;
        await stream.writeSSE({ data: JSON.stringify({ text: chunk }) });
      }

      // Save assistant response
      if (fullResponse) {
        appendMessage(sessionId, 'assistant', fullResponse);
      }

      await stream.writeSSE({ data: '[DONE]' });
    } catch (err) {
      console.error('Chat error:', err instanceof Error ? err.message : err);
      await stream.writeSSE({
        data: JSON.stringify({ error: 'Something went wrong. Please try again.' }),
        event: 'error',
      });
    }
  });
});

// Get chat history for a session
chat.get('/history/:sessionId', (c) => {
  const sessionId = c.req.param('sessionId');
  const history = getSessionHistory(sessionId);
  return c.json(history);
});

export default chat;
