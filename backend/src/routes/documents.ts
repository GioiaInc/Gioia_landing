import { Hono } from 'hono';
import { getAllDocuments, getDocument, getDocumentBySlug } from '../lib/db.js';

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

export default documents;
