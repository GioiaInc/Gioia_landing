import { Hono } from 'hono';
import path from 'path';
import fs from 'fs';
import { insertDocument, updateDocumentContent, updateDocumentEnrichment, updateDocumentError, storeChunks } from '../lib/db.js';
import { extractText, sanitizeFilename, getMimeType } from '../lib/extract.js';
import { enrichDocument } from '../lib/enrichment.js';

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
  const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
  if (!allowedTypes.includes(mimeType)) {
    return c.json({ error: 'Unsupported file type. Allowed: .txt, .md, .pdf' }, 400);
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
    // Extract text and store chunks
    const text = await extractText(filePath, mimeType);
    updateDocumentContent(id, text);
    storeChunks(id, text);

    // Enrich with Claude
    const enrichment = await enrichDocument(text, originalName);
    updateDocumentEnrichment(id, enrichment.title, enrichment.summary, enrichment.tags);

    console.log(`Document ${id} enriched: "${enrichment.title}"`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Processing failed for doc ${id}:`, message);
    updateDocumentError(id, message);
  }
}

export default upload;
