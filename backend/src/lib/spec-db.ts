import db from './db.js';

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS spec (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT NOT NULL DEFAULT 'belo Product Specification',
    markdown TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS spec_edits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    source_label TEXT,
    action TEXT NOT NULL,
    instruction TEXT,
    section TEXT,
    diff_summary TEXT,
    previous_md TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// --- Types ---
export interface SpecRow {
  id: number;
  title: string;
  markdown: string;
  updated_at: string;
}

export interface SpecEdit {
  id: number;
  source: string;
  source_label: string | null;
  action: string;
  instruction: string | null;
  section: string | null;
  diff_summary: string | null;
  previous_md: string | null;
  created_at: string;
}

// --- Queries ---

export function getSpec(): SpecRow | undefined {
  return db.prepare('SELECT * FROM spec WHERE id = 1').get() as SpecRow | undefined;
}

export function upsertSpec(markdown: string, title?: string): void {
  const existing = getSpec();
  if (existing) {
    if (title) {
      db.prepare('UPDATE spec SET markdown = ?, title = ?, updated_at = datetime(\'now\') WHERE id = 1').run(markdown, title);
    } else {
      db.prepare('UPDATE spec SET markdown = ?, updated_at = datetime(\'now\') WHERE id = 1').run(markdown);
    }
  } else {
    db.prepare('INSERT INTO spec (id, markdown, title) VALUES (1, ?, ?)').run(markdown, title || 'belo Product Specification');
  }
}

export function logSpecEdit(
  source: 'web' | 'api' | 'ai' | 'seed',
  action: string,
  opts: {
    sourceLabel?: string;
    instruction?: string;
    section?: string;
    diffSummary?: string;
    previousMd?: string;
  } = {}
): number {
  const result = db.prepare(`
    INSERT INTO spec_edits (source, source_label, action, instruction, section, diff_summary, previous_md)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    source,
    opts.sourceLabel || null,
    action,
    opts.instruction || null,
    opts.section || null,
    opts.diffSummary || null,
    opts.previousMd || null
  );
  return result.lastInsertRowid as number;
}

export function getSpecEdits(limit = 50, offset = 0): SpecEdit[] {
  return db.prepare(
    'SELECT id, source, source_label, action, instruction, section, diff_summary, created_at FROM spec_edits ORDER BY id DESC LIMIT ? OFFSET ?'
  ).all(limit, offset) as SpecEdit[];
}

export function getSpecEditById(id: number): SpecEdit | undefined {
  return db.prepare('SELECT * FROM spec_edits WHERE id = ?').get(id) as SpecEdit | undefined;
}

export function getSpecEditCount(): number {
  const row = db.prepare('SELECT COUNT(*) as cnt FROM spec_edits').get() as { cnt: number };
  return row.cnt;
}

/** Extract a section by heading text. Returns the section markdown or null. */
export function extractSection(markdown: string, heading: string): string | null {
  const lines = markdown.split('\n');
  const normalizedHeading = heading.toLowerCase().trim();
  let start = -1;
  let startLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim().toLowerCase();
      if (start === -1) {
        if (title.includes(normalizedHeading) || normalizedHeading.includes(title)) {
          start = i;
          startLevel = level;
        }
      } else if (level <= startLevel) {
        return lines.slice(start, i).join('\n').trim();
      }
    }
  }

  if (start !== -1) {
    return lines.slice(start).join('\n').trim();
  }

  return null;
}

/** List all section headings with their levels */
export function listSections(markdown: string): { level: number; title: string }[] {
  const sections: { level: number; title: string }[] = [];
  for (const line of markdown.split('\n')) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      sections.push({ level: match[1].length, title: match[2].trim() });
    }
  }
  return sections;
}
