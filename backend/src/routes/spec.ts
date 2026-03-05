import { Hono } from 'hono';
import {
  getSpec,
  upsertSpec,
  logSpecEdit,
  getSpecEdits,
  getSpecEditById,
  getSpecEditCount,
  extractSection,
  listSections,
} from '../lib/spec-db.js';
import { editSpec, askSpec } from '../lib/spec-ai.js';

const spec = new Hono();

// --- GET /api/spec — full spec (markdown + metadata) ---
spec.get('/', (c) => {
  const row = getSpec();
  if (!row) return c.json({ error: 'Spec not initialized' }, 404);

  const format = c.req.query('format') || 'markdown';

  if (format === 'json') {
    return c.json({
      title: row.title,
      markdown: row.markdown,
      sections: listSections(row.markdown),
      updated_at: row.updated_at,
    });
  }

  // Default: return raw markdown
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(row.markdown);
});

// --- GET /api/spec/sections — list all headings ---
spec.get('/sections', (c) => {
  const row = getSpec();
  if (!row) return c.json({ error: 'Spec not initialized' }, 404);
  return c.json(listSections(row.markdown));
});

// --- GET /api/spec/section/:heading — get a specific section ---
spec.get('/section/:heading', (c) => {
  const row = getSpec();
  if (!row) return c.json({ error: 'Spec not initialized' }, 404);

  const heading = decodeURIComponent(c.req.param('heading'));
  const section = extractSection(row.markdown, heading);

  if (!section) {
    return c.json({ error: `Section "${heading}" not found` }, 404);
  }

  const format = c.req.query('format') || 'markdown';
  if (format === 'json') {
    return c.json({ heading, content: section });
  }

  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(section);
});

// --- POST /api/spec/edit — edit the spec ---
spec.post('/edit', async (c) => {
  const body = await c.req.json<{
    instruction?: string;
    markdown?: string;
    section?: string;
    source_label?: string;
  }>();

  const row = getSpec();
  if (!row) return c.json({ error: 'Spec not initialized' }, 404);

  const sourceLabel = body.source_label || c.req.header('X-Source-Label') || null;
  // Determine source: if X-Api-Key header present, it's an API call
  const source = c.req.header('X-Api-Key') ? 'api' : 'web';

  // Direct markdown replacement
  if (body.markdown) {
    const previousMd = row.markdown;
    upsertSpec(body.markdown);
    logSpecEdit(source as 'web' | 'api', 'replace', {
      sourceLabel: sourceLabel || undefined,
      instruction: body.instruction || 'Direct markdown replacement',
      diffSummary: body.instruction || 'Full document replaced',
      previousMd,
    });

    return c.json({ ok: true, updated_at: new Date().toISOString() });
  }

  // AI-powered edit
  if (body.instruction) {
    const previousMd = row.markdown;
    const result = await editSpec(row.markdown, body.instruction, body.section);

    upsertSpec(result.markdown);
    logSpecEdit('ai', 'ai-edit', {
      sourceLabel: sourceLabel || undefined,
      instruction: body.instruction,
      section: body.section || undefined,
      diffSummary: result.diffSummary,
      previousMd,
    });

    return c.json({
      ok: true,
      diff_summary: result.diffSummary,
      updated_at: new Date().toISOString(),
    });
  }

  return c.json({ error: 'Provide either "instruction" for AI edit or "markdown" for direct replacement' }, 400);
});

// --- POST /api/spec/ask — ask a question about the spec ---
spec.post('/ask', async (c) => {
  const { question } = await c.req.json<{ question: string }>();
  if (!question) return c.json({ error: 'question is required' }, 400);

  const row = getSpec();
  if (!row) return c.json({ error: 'Spec not initialized' }, 404);

  const answer = await askSpec(row.markdown, question);
  return c.json({ answer });
});

// --- GET /api/spec/history — audit log ---
spec.get('/history', (c) => {
  const limit = Math.min(Number(c.req.query('limit')) || 50, 200);
  const offset = Number(c.req.query('offset')) || 0;
  const edits = getSpecEdits(limit, offset);
  const total = getSpecEditCount();
  return c.json({ edits, total, limit, offset });
});

// --- GET /api/spec/history/:id — single edit with previous markdown ---
spec.get('/history/:id', (c) => {
  const id = Number(c.req.param('id'));
  const edit = getSpecEditById(id);
  if (!edit) return c.json({ error: 'Edit not found' }, 404);
  return c.json(edit);
});

// --- POST /api/spec/seed — initialize the spec from markdown ---
spec.post('/seed', async (c) => {
  const { markdown, title, force } = await c.req.json<{
    markdown: string;
    title?: string;
    force?: boolean;
  }>();

  if (!markdown) return c.json({ error: 'markdown is required' }, 400);

  const existing = getSpec();
  if (existing && !force) {
    return c.json({ ok: true, skipped: true, message: 'Spec already exists. Use force: true to overwrite.' });
  }

  upsertSpec(markdown, title);
  logSpecEdit('seed', 'seed', {
    diffSummary: existing ? 'Spec re-seeded (force overwrite)' : 'Initial spec seeded',
    previousMd: existing?.markdown,
  });

  return c.json({ ok: true, seeded: true });
});

// --- POST /api/spec/revert/:id — revert to a previous version ---
spec.post('/revert/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const edit = getSpecEditById(id);
  if (!edit || !edit.previous_md) {
    return c.json({ error: 'Edit not found or has no previous version' }, 404);
  }

  const currentSpec = getSpec();
  const previousMd = currentSpec?.markdown;

  upsertSpec(edit.previous_md);
  logSpecEdit('web', 'revert', {
    instruction: `Reverted to version before edit #${id}`,
    diffSummary: `Reverted to version before: ${edit.diff_summary || edit.action}`,
    previousMd,
  });

  return c.json({ ok: true, reverted_to_edit: id });
});

export default spec;
