#!/usr/bin/env node

/**
 * Seed static docs (TSX meeting notes) into the archive backend
 * so the AI chat can search them.
 *
 * Usage:
 *   DOCS_PASSWORD=xxx node backend/scripts/seed-static-docs.mjs
 *   DOCS_PASSWORD=xxx node backend/scripts/seed-static-docs.mjs --force   # re-seed (deletes + reinserts)
 *   DOCS_PASSWORD=xxx API_BASE=http://localhost:3001 node backend/scripts/seed-static-docs.mjs
 */

import { createHmac } from 'crypto';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.API_BASE || 'https://gioia-archive-v2.fly.dev';
const DOCS_PASSWORD = process.env.DOCS_PASSWORD;
const force = process.argv.includes('--force');

if (!DOCS_PASSWORD) {
  console.error('Set DOCS_PASSWORD env var');
  process.exit(1);
}

const token = createHmac('sha256', DOCS_PASSWORD)
  .update('gioia-docs-token')
  .digest('hex');

const DOCS_DIR = resolve(__dirname, '../../src/content/docs');

const staticDocs = [
  { slug: 'team-meeting-feb-26', date: '2026-02-26', title: 'Full Team: Quick Circle, Killer Features, March Roadmap', summary: 'Informal video concept, GIF testing, AI tooling velocity, bots vs. integrated AI', tags: ['meeting', 'team', 'features', 'roadmap'] },
  { slug: 'team-meeting-feb-24', date: '2026-02-24', title: 'Full Team: Communities, Launch Prep, Social Impact', summary: 'Bello Communities, onboarding UX, emotional AI mission, March 31 timeline', tags: ['meeting', 'team', 'communities', 'launch'] },
  { slug: 'executive-meeting-feb-23', date: '2026-02-23', title: 'Saeed & Roman: Demo Polish, Community Pivot', summary: 'Mentor demo prep, landing page copy, Discord-style communities for Central Asia', tags: ['meeting', 'executive', 'demo', 'community'] },
  { slug: 'executive-meeting-feb-20', date: '2026-02-20', title: 'Saeed & Roman: Vision, Strategy, Design', summary: 'Investor debrief, Central Asia strategy, chat UI direction', tags: ['meeting', 'executive', 'strategy', 'design'] },
  { slug: 'executive-meeting-feb-19', date: '2026-02-19', title: 'Team Meeting: Design & Demo', summary: 'Design evolution, investor prep, Tuesday demo', tags: ['meeting', 'team', 'design', 'demo'] },
  { slug: 'executive-meeting-feb-17', date: '2026-02-17', title: 'All-Team Meeting Summary', summary: 'Full team, product, AI, infrastructure, vision', tags: ['meeting', 'team', 'product', 'AI', 'infrastructure'] },
  { slug: 'executive-meeting-feb-15', date: '2026-02-15', title: 'AI Strategy Meeting', summary: 'Roman & Kambar, ambient AI direction', tags: ['meeting', 'AI', 'strategy'] },
  { slug: 'balo-ambient-ai-plan', date: '2026-02-15', title: 'Balo Ambient AI Plan', summary: 'On-device intelligence for the April prototype', tags: ['strategy', 'AI', 'ambient', 'plan'] },
];

function stripJsx(tsx) {
  return tsx
    // Remove export wrapper
    .replace(/^export default function \w+\(\) \{\s*return \(\s*<>/s, '')
    .replace(/<\/>\s*\);\s*\}\s*$/s, '')
    // Remove JSX string expressions like {' '} or {" "}
    .replace(/\{['"][^'"]*['"]\}/g, ' ')
    .replace(/\{`[^`]*`\}/g, ' ')
    // Remove style attributes
    .replace(/style=\{\{[^}]*\}\}/g, '')
    // Remove HTML/JSX tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    // Clean excess whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

console.log(`Seeding static docs to ${API_BASE}...${force ? ' (force mode)' : ''}\n`);

for (const doc of staticDocs) {
  const filePath = resolve(DOCS_DIR, `${doc.slug}.tsx`);
  let tsx;
  try {
    tsx = readFileSync(filePath, 'utf-8');
  } catch {
    console.error(`  x File not found: ${filePath}`);
    continue;
  }

  // Prepend date header so FTS can match date queries
  const rawContent = stripJsx(tsx);
  const content = `Meeting date: ${doc.date}\n\n${rawContent}`;

  const res = await fetch(`${API_BASE}/api/documents/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: doc.title,
      slug: doc.slug,
      content,
      summary: doc.summary,
      tags: doc.tags,
      date: doc.date,
      force,
    }),
  });

  const data = await res.json();
  if (data.skipped) {
    console.log(`  - ${doc.title} (already exists, use --force to re-seed)`);
  } else if (data.seeded) {
    console.log(`  + ${doc.title} (id: ${data.id})`);
  } else {
    console.error(`  x ${doc.title}: ${JSON.stringify(data)}`);
  }
}

console.log('\nDone!');
