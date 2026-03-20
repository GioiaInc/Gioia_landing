import { Hono } from 'hono';
import db from '../lib/db.js';

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS action_items (
    id TEXT PRIMARY KEY,
    checked INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const actions = new Hono();

// GET /api/actions — return all checked states
actions.get('/', (c) => {
  const rows = db.prepare('SELECT id, checked FROM action_items WHERE checked = 1').all() as { id: string; checked: number }[];
  const state: Record<string, boolean> = {};
  for (const row of rows) {
    state[row.id] = true;
  }
  return c.json(state);
});

// POST /api/actions — toggle an item
actions.post('/', async (c) => {
  const { id, checked } = await c.req.json<{ id: string; checked: boolean }>();

  if (!id || typeof checked !== 'boolean') {
    return c.json({ error: 'id and checked required' }, 400);
  }

  db.prepare(`
    INSERT INTO action_items (id, checked, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET checked = ?, updated_at = datetime('now')
  `).run(id, checked ? 1 : 0, checked ? 1 : 0);

  return c.json({ ok: true });
});

// POST /api/actions/bulk — set multiple items at once
actions.post('/bulk', async (c) => {
  const { items } = await c.req.json<{ items: Record<string, boolean> }>();

  if (!items || typeof items !== 'object') {
    return c.json({ error: 'items object required' }, 400);
  }

  const stmt = db.prepare(`
    INSERT INTO action_items (id, checked, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET checked = ?, updated_at = datetime('now')
  `);

  const upsertAll = db.transaction(() => {
    for (const [id, checked] of Object.entries(items)) {
      stmt.run(id, checked ? 1 : 0, checked ? 1 : 0);
    }
  });

  upsertAll();
  return c.json({ ok: true });
});

export default actions;
