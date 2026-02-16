export interface DocEntry {
  slug: string;
  title: string;
  subtitle?: string;
  date?: string;
  category?: string;
}

// ============================================
// ADD NEW DOCS HERE
// Then create a matching content file in
// src/content/docs/[slug].tsx and register it
// in src/content/docs/index.ts
// ============================================

export const docs: DocEntry[] = [
  {
    slug: 'balo-ambient-ai-plan',
    title: 'Balo Ambient AI Plan',
    subtitle: 'On-device intelligence for the April prototype',
    date: '2026-02-15',
    category: 'Strategy',
  },
  {
    slug: 'executive-meeting-feb-15',
    title: 'Executive Meeting Summary',
    subtitle: 'AI strategy session — Roman & Kambar',
    date: '2026-02-15',
    category: 'Meetings',
  },
  {
    slug: 'test-document',
    title: 'Test Document',
    subtitle: 'Verifying the docs system',
    date: '2026-02-15',
    category: 'Internal',
  },
];

export function getDoc(slug: string): DocEntry | undefined {
  return docs.find((d) => d.slug === slug);
}
