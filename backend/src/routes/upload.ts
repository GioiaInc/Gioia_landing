import { Hono } from 'hono';
import path from 'path';
import fs from 'fs';
import { insertDocument, updateDocumentContent, updateDocumentEnrichment, updateDocumentError, storeChunks } from '../lib/db.js';
import { extractText, sanitizeFilename, getMimeType, extractHtmlBody, htmlToPlainText, fetchUrlContent } from '../lib/extract.js';
import { enrichDocument, formatDocument } from '../lib/enrichment.js';

const DATA_DIR = process.env.DATA_DIR || '/data';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const upload = new Hono();

upload.post('/', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file provided' }, 400);
  }

  // Reject oversized files
  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: 'File too large. Maximum size is 50 MB.' }, 413);
  }

  const originalName = file.name;
  const mimeType = getMimeType(originalName);

  // Validate file type
  const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf', 'text/html'];
  if (!allowedTypes.includes(mimeType)) {
    return c.json({ error: 'Unsupported file type. Allowed: .txt, .md, .pdf, .html' }, 400);
  }

  // Save file
  const id = insertDocument('pending', originalName, mimeType);
  const safeName = sanitizeFilename(originalName);
  const filename = `${id}_${safeName}`;
  const filePath = path.join(DATA_DIR, 'files', filename);

  const arrayBuffer = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

  // Update filename in DB
  const db = (await import('../lib/db.js')).default;
  db.prepare('UPDATE documents SET filename = ? WHERE id = ?').run(filename, id);

  // Fire-and-forget: extract + enrich
  processDocument(id, filePath, mimeType, originalName).catch((err) => {
    console.error(`Enrichment failed for doc ${id}:`, err);
  });

  return c.json({ id, status: 'processing' }, 201);
});

async function processDocument(
  id: number,
  filePath: string,
  mimeType: string,
  originalName: string
): Promise<void> {
  try {
    // HTML files use a separate pipeline — skip formatDocument, use original HTML
    if (mimeType === 'text/html') {
      const rawHtml = fs.readFileSync(filePath, 'utf-8');
      await processHtmlContent(id, rawHtml, originalName);
      return;
    }

    // Extract text and store chunks
    const text = await extractText(filePath, mimeType);
    updateDocumentContent(id, text);
    storeChunks(id, text);

    // Enrich with Claude
    const enrichment = await enrichDocument(text, originalName);

    // Format into HTML article
    let formattedHtml: string | undefined;
    try {
      formattedHtml = await formatDocument(text, originalName);
    } catch (err) {
      console.error(`Formatting failed for doc ${id}, continuing without:`, err);
    }

    // Generate slug from title
    const slug = enrichment.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);

    updateDocumentEnrichment(id, enrichment.title, enrichment.summary, enrichment.tags, formattedHtml, slug);

    console.log(`Document ${id} enriched: "${enrichment.title}" (slug: ${slug})`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Processing failed for doc ${id}:`, message);
    updateDocumentError(id, message);
  }
}

async function processHtmlContent(
  id: number,
  rawHtml: string,
  originalName: string,
  sourceUrl?: string
): Promise<void> {
  const bodyHtml = extractHtmlBody(rawHtml);
  const plainText = htmlToPlainText(bodyHtml);

  updateDocumentContent(id, plainText);
  storeChunks(id, plainText);

  const enrichment = await enrichDocument(plainText, originalName);

  // Generate AI-formatted doc (same as txt/pdf pipeline)
  let formattedHtml: string | undefined;
  try {
    formattedHtml = await formatDocument(plainText, originalName);
  } catch (err) {
    console.error(`Formatting failed for doc ${id}, continuing without:`, err);
  }

  const slug = enrichment.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);

  updateDocumentEnrichment(id, enrichment.title, enrichment.summary, enrichment.tags, formattedHtml, slug);

  // Save the original HTML body for the Preview tab, and source URL for the Link tab
  const db = (await import('../lib/db.js')).default;
  db.prepare('UPDATE documents SET source_html = ?, source_url = ? WHERE id = ?')
    .run(bodyHtml, sourceUrl ?? null, id);

  console.log(`Document ${id} (HTML) enriched: "${enrichment.title}" (slug: ${slug})`);
}

upload.post('/url/check', async (c) => {
  const body = await c.req.json<{ url?: string }>();
  const url = body.url?.trim();

  if (!url) {
    return c.json({ ok: false, error: 'No URL provided' }, 400);
  }

  try {
    new URL(url);
  } catch {
    return c.json({ ok: false, error: 'Invalid URL' }, 400);
  }

  try {
    const rawHtml = await fetchUrlContent(url);
    const bodyHtml = extractHtmlBody(rawHtml);
    const plainText = htmlToPlainText(bodyHtml);

    // Extract <title> if present
    const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // First ~200 chars of plain text as a snippet
    const snippet = plainText.substring(0, 200) + (plainText.length > 200 ? '…' : '');

    return c.json({
      ok: true,
      title: title || null,
      snippet,
      contentLength: rawHtml.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ ok: false, error: message }, 422);
  }
});

upload.post('/url', async (c) => {
  const body = await c.req.json<{ url?: string }>();
  const url = body.url?.trim();

  if (!url) {
    return c.json({ error: 'No URL provided' }, 400);
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return c.json({ error: 'Invalid URL' }, 400);
  }

  // Derive a name from the URL
  const urlPath = new URL(url).pathname;
  const originalName = urlPath.split('/').filter(Boolean).pop() || 'page.html';

  const id = insertDocument('pending', originalName, 'text/html');

  // Fire-and-forget: fetch + process
  (async () => {
    try {
      const rawHtml = await fetchUrlContent(url);
      await processHtmlContent(id, rawHtml, originalName, url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`URL processing failed for doc ${id}:`, message);
      updateDocumentError(id, message);
    }
  })();

  return c.json({ id, status: 'processing' }, 201);
});

export default upload;
