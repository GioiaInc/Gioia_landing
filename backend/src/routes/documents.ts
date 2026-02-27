import { Hono } from 'hono';
import fs from 'fs';
import path from 'path';
import { getAllDocuments, getDocument, getDocumentBySlug, deleteDocument } from '../lib/db.js';

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

export default documents;
