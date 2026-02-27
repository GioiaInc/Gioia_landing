import { Hono } from 'hono';
import fs from 'fs';
import path from 'path';
import { getAllDocuments, getDocument, getDocumentBySlug, deleteDocument, insertDocument, updateDocumentContent, updateDocumentEnrichment, updateFormattedHtml, storeChunks } from '../lib/db.js';
import { editDocument } from '../lib/enrichment.js';

const documents = new Hono();

documents.get('/', (c) => {
  const docs = getAllDocuments();
  return c.json(
    docs.map((d) => ({
      id: d.id,
      title: d.title,
      summary: d.summary,
      tags: JSON.parse(d.tags || '[]'),
      slug: d.slug,
      status: d.status,
      original_name: d.original_name,
      created_at: d.created_at,
    }))
  );
});

documents.post('/seed', async (c) => {
  const { title, slug, content, summary, tags, date, force } = await c.req.json<{
    title: string; slug: string; content: string; summary?: string; tags?: string[]; date?: string; force?: boolean;
  }>();

  if (!title || !slug || !content) {
    return c.json({ error: 'title, slug, and content are required' }, 400);
  }

  const existing = getDocumentBySlug(slug);
  if (existing && !force) {
    return c.json({ id: existing.id, skipped: true });
  }
  if (existing && force) {
    deleteDocument(existing.id);
  }

  const id = insertDocument('seeded', title, 'text/plain');
  updateDocumentContent(id, content);
  storeChunks(id, content);
  updateDocumentEnrichment(id, title, summary || '', tags || [], undefined, slug);

  // Set created_at to the original doc date if provided
  if (date) {
    const db = (await import('../lib/db.js')).default;
    db.prepare('UPDATE documents SET created_at = ? WHERE id = ?').run(date, id);
  }

  return c.json({ id, seeded: true }, 201);
});

documents.get('/:id/status', (c) => {
  const id = Number(c.req.param('id'));
  const doc = getDocument(id);

  if (!doc) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({
    id: doc.id,
    status: doc.status,
    title: doc.title,
    summary: doc.summary,
    tags: JSON.parse(doc.tags || '[]'),
  });
});

documents.get('/:slug/page', (c) => {
  const slug = c.req.param('slug');
  const doc = getDocumentBySlug(slug);

  if (!doc || !doc.formatted_html) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({
    id: doc.id,
    formatted_html: doc.formatted_html,
    title: doc.title,
    summary: doc.summary,
    tags: JSON.parse(doc.tags || '[]'),
    slug: doc.slug,
    created_at: doc.created_at,
  });
});

const DATA_DIR = process.env.DATA_DIR || '/data';

documents.post('/:id/delete', async (c) => {
  const { password } = await c.req.json<{ password: string }>();
  if (password !== '12355') {
    return c.json({ error: 'Wrong password' }, 403);
  }

  const id = Number(c.req.param('id'));
  const doc = getDocument(id);
  if (!doc) {
    return c.json({ error: 'Not found' }, 404);
  }

  // Delete file from disk
  const filePath = path.join(DATA_DIR, 'files', doc.filename);
  try { fs.unlinkSync(filePath); } catch {}

  deleteDocument(id);
  return c.json({ ok: true });
});

documents.post('/:id/ai-edit', async (c) => {
  const id = Number(c.req.param('id'));
  const { instruction } = await c.req.json<{ instruction: string }>();

  if (!instruction) {
    return c.json({ error: 'instruction is required' }, 400);
  }

  const doc = getDocument(id);
  if (!doc || !doc.formatted_html) {
    return c.json({ error: 'Not found' }, 404);
  }

  const newHtml = await editDocument(doc.formatted_html, instruction);
  updateFormattedHtml(id, newHtml);

  return c.json({ formatted_html: newHtml });
});

export default documents;
