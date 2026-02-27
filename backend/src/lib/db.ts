import Database, { type Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || '/data';
const DB_PATH = path.join(DATA_DIR, 'gioia.db');

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(DATA_DIR, 'files'), { recursive: true });

const db: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    title TEXT,
    summary TEXT,
    tags TEXT DEFAULT '[]',
    content_text TEXT,
    status TEXT NOT NULL DEFAULT 'processing',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
    title,
    summary,
    tags,
    content_text,
    content='documents',
    content_rowid='id'
  );

  -- Triggers to keep FTS in sync
  CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
    INSERT INTO documents_fts(rowid, title, summary, tags, content_text)
    VALUES (new.id, new.title, new.summary, new.tags, new.content_text);
  END;

  CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
    INSERT INTO documents_fts(documents_fts, rowid, title, summary, tags, content_text)
    VALUES ('delete', old.id, old.title, old.summary, old.tags, old.content_text);
  END;

  CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
    INSERT INTO documents_fts(documents_fts, rowid, title, summary, tags, content_text)
    VALUES ('delete', old.id, old.title, old.summary, old.tags, old.content_text);
    INSERT INTO documents_fts(rowid, title, summary, tags, content_text)
    VALUES (new.id, new.title, new.summary, new.tags, new.content_text);
  END;

  -- Chat sessions + messages
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Chunks table for long documents
  CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
    content,
    content='chunks',
    content_rowid='id'
  );

  CREATE TRIGGER IF NOT EXISTS chunks_ai AFTER INSERT ON chunks BEGIN
    INSERT INTO chunks_fts(rowid, content) VALUES (new.id, new.content);
  END;

  CREATE TRIGGER IF NOT EXISTS chunks_ad AFTER DELETE ON chunks BEGIN
    INSERT INTO chunks_fts(chunks_fts, rowid, content) VALUES ('delete', old.id, old.content);
  END;
`);

// Add columns for formatted doc pages (idempotent)
try { db.exec('ALTER TABLE documents ADD COLUMN formatted_html TEXT'); } catch {}
try { db.exec('ALTER TABLE documents ADD COLUMN slug TEXT'); } catch {}

export interface DocumentRow {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  title: string | null;
  summary: string | null;
  tags: string;
  content_text: string | null;
  formatted_html: string | null;
  slug: string | null;
  status: string;
  created_at: string;
}

export function insertDocument(filename: string, originalName: string, mimeType: string): number {
  const stmt = db.prepare(
    'INSERT INTO documents (filename, original_name, mime_type) VALUES (?, ?, ?)'
  );
  const result = stmt.run(filename, originalName, mimeType);
  return result.lastInsertRowid as number;
}

export function updateDocumentContent(id: number, contentText: string): void {
  db.prepare('UPDATE documents SET content_text = ? WHERE id = ?').run(contentText, id);
}

export function updateDocumentEnrichment(
  id: number,
  title: string,
  summary: string,
  tags: string[],
  formattedHtml?: string,
  slug?: string
): void {
  db.prepare(
    'UPDATE documents SET title = ?, summary = ?, tags = ?, formatted_html = ?, slug = ?, status = ? WHERE id = ?'
  ).run(title, summary, JSON.stringify(tags), formattedHtml ?? null, slug ?? null, 'ready', id);
}

export function updateDocumentError(id: number, error: string): void {
  db.prepare('UPDATE documents SET status = ?, summary = ? WHERE id = ?').run(
    'error',
    `Error: ${error}`,
    id
  );
}

export function getDocument(id: number): DocumentRow | undefined {
  return db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as DocumentRow | undefined;
}

export function getAllDocuments(): DocumentRow[] {
  return db.prepare(
    'SELECT id, filename, original_name, mime_type, title, summary, tags, slug, status, created_at FROM documents ORDER BY created_at DESC'
  ).all() as DocumentRow[];
}

export function getDocumentBySlug(slug: string): DocumentRow | undefined {
  return db.prepare('SELECT * FROM documents WHERE slug = ?').get(slug) as DocumentRow | undefined;
}

export function deleteDocument(id: number): boolean {
  const result = db.prepare('DELETE FROM documents WHERE id = ?').run(id);
  return result.changes > 0;
}

export function searchDocuments(query: string): DocumentRow[] {
  // FTS5 search — escape double quotes in query
  const safeQuery = query.replace(/"/g, '""');
  try {
    return db.prepare(`
      SELECT d.id, d.title, d.summary, d.tags, d.status, d.created_at,
             snippet(documents_fts, 3, '<b>', '</b>', '…', 40) as snippet
      FROM documents_fts fts
      JOIN documents d ON d.id = fts.rowid
      WHERE documents_fts MATCH ?
      ORDER BY rank
      LIMIT 10
    `).all(`"${safeQuery}"`) as DocumentRow[];
  } catch {
    // Fallback: simple LIKE search if FTS query syntax fails
    return db.prepare(`
      SELECT id, title, summary, tags, status, created_at
      FROM documents
      WHERE content_text LIKE ? OR title LIKE ? OR summary LIKE ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(`%${query}%`, `%${query}%`, `%${query}%`) as DocumentRow[];
  }
}

export function getDocumentFullText(id: number): string | null {
  const row = db.prepare('SELECT content_text FROM documents WHERE id = ?').get(id) as
    | { content_text: string | null }
    | undefined;
  return row?.content_text ?? null;
}

// --- Chunking ---

const CHUNK_SIZE = 3000; // ~3k chars per chunk, with overlap
const CHUNK_OVERLAP = 300;

/**
 * Split text into overlapping chunks by paragraph boundaries.
 * Each chunk is ~3000 chars with 300 char overlap.
 */
function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];

  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    // If adding this paragraph would exceed chunk size, finalize current chunk
    if (current.length > 0 && current.length + para.length + 2 > CHUNK_SIZE) {
      chunks.push(current.trim());
      // Start next chunk with overlap from end of previous
      const overlap = current.slice(-CHUNK_OVERLAP);
      current = overlap + '\n\n' + para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Store chunks for a document. Called after text extraction.
 */
export function storeChunks(documentId: number, text: string): void {
  // Clear any existing chunks
  db.prepare('DELETE FROM chunks WHERE document_id = ?').run(documentId);

  const chunks = splitIntoChunks(text);
  const stmt = db.prepare(
    'INSERT INTO chunks (document_id, chunk_index, content) VALUES (?, ?, ?)'
  );

  const insertAll = db.transaction(() => {
    for (let i = 0; i < chunks.length; i++) {
      stmt.run(documentId, i, chunks[i]);
    }
  });

  insertAll();
}

export function getDocumentChunkCount(id: number): number {
  const row = db.prepare('SELECT COUNT(*) as cnt FROM chunks WHERE document_id = ?').get(id) as { cnt: number };
  return row.cnt;
}

export interface ChunkResult {
  chunk_index: number;
  content: string;
  snippet?: string;
}

/**
 * Search within a specific document's chunks using FTS5.
 * Returns the most relevant chunks.
 */
export function searchInDocument(documentId: number, query: string): ChunkResult[] {
  const safeQuery = query.replace(/"/g, '""');
  try {
    return db.prepare(`
      SELECT c.chunk_index, c.content,
             snippet(chunks_fts, 0, '<b>', '</b>', '…', 40) as snippet
      FROM chunks_fts fts
      JOIN chunks c ON c.id = fts.rowid
      WHERE chunks_fts MATCH ? AND c.document_id = ?
      ORDER BY rank
      LIMIT 5
    `).all(`"${safeQuery}"`, documentId) as ChunkResult[];
  } catch {
    // Fallback: LIKE search
    return db.prepare(`
      SELECT chunk_index, content
      FROM chunks
      WHERE document_id = ? AND content LIKE ?
      ORDER BY chunk_index
      LIMIT 5
    `).all(documentId, `%${query}%`) as ChunkResult[];
  }
}

// --- Chat sessions ---

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function getOrCreateSession(sessionId: string): void {
  db.prepare(`
    INSERT INTO chat_sessions (id) VALUES (?)
    ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')
  `).run(sessionId);
}

export function appendMessage(sessionId: string, role: string, content: string): void {
  db.prepare(
    'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)'
  ).run(sessionId, role, content);
}

export function getSessionHistory(sessionId: string): ChatMessage[] {
  return db.prepare(
    'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id ASC'
  ).all(sessionId) as ChatMessage[];
}

export default db;
