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
    slug: 'team-meeting-feb-26',
    title: 'Full Team: Quick Circle, Killer Features, March Roadmap',
    subtitle: 'Informal video concept, GIF testing, AI tooling velocity, bots vs. integrated AI',
    date: '2026-02-26',
    category: 'Meetings',
  },
  {
    slug: 'team-meeting-feb-24',
    title: 'Full Team: Communities, Launch Prep, Social Impact',
    subtitle: 'Bello Communities, onboarding UX, emotional AI mission, March 31 timeline',
    date: '2026-02-24',
    category: 'Meetings',
  },
  {
    slug: 'executive-meeting-feb-23',
    title: 'Saeed & Roman: Demo Polish, Community Pivot',
    subtitle: 'Mentor demo prep, landing page copy, Discord-style communities for Central Asia',
    date: '2026-02-23',
    category: 'Meetings',
  },
  {
    slug: 'executive-meeting-feb-20',
    title: 'Saeed & Roman: Vision, Strategy, Design',
    subtitle: 'Investor debrief, Central Asia strategy, chat UI direction',
    date: '2026-02-20',
    category: 'Meetings',
  },
  {
    slug: 'executive-meeting-feb-19',
    title: 'Team Meeting: Design & Demo',
    subtitle: 'Design evolution, investor prep, Tuesday demo',
    date: '2026-02-19',
    category: 'Meetings',
  },
  {
    slug: 'balo-ambient-ai-plan',
    title: 'Balo Ambient AI Plan',
    subtitle: 'On-device intelligence for the April prototype',
    date: '2026-02-15',
    category: 'Strategy',
  },
  {
    slug: 'executive-meeting-feb-17',
    title: 'All-Team Meeting Summary',
    subtitle: 'Full team, product, AI, infrastructure, vision',
    date: '2026-02-17',
    category: 'Meetings',
  },
  {
    slug: 'executive-meeting-feb-15',
    title: 'AI Strategy Meeting',
    subtitle: 'Roman & Kambar, ambient AI direction',
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
