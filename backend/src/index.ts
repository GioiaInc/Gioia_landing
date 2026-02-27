import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { authMiddleware } from './lib/auth.js';
import upload from './routes/upload.js';
import documents from './routes/documents.js';
import chat from './routes/chat.js';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

const app = new Hono();

// CORS — restrict to known frontend origins
app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      if (!origin) return ALLOWED_ORIGINS[0];
      return ALLOWED_ORIGINS.includes(origin) ? origin : '';
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check (no auth — intentional, returns no sensitive data)
app.get('/health', (c) => c.json({ status: 'ok' }));

// Auth middleware for all /api routes
app.use('/api/*', authMiddleware);

// Mount routes
app.route('/api/upload', upload);
app.route('/api/documents', documents);
app.route('/api/chat', chat);

const port = Number(process.env.PORT) || 3001;

console.log(`GIOIA Archive backend starting on port ${port}`);

serve({ fetch: app.fetch, port });
