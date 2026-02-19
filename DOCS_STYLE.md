# GIOIA Internal Docs Style Guide

For AI agents and contributors creating docs in `/docs`.

## File Structure

1. Add entry to `src/lib/docs-config.ts` (slug, title, subtitle, date, category)
2. Create `src/content/docs/[slug].tsx` — default-export React component
3. Register in `src/content/docs/index.ts`

## Config Rules

- **Titles:** Short, clear. No em dashes. Use colons if needed.
- **Subtitles:** One line, comma-separated phrases. No em dashes.
- **Categories:** `Meetings`, `Strategy`, `Internal`
- **Date:** `YYYY-MM-DD` format

## Meeting Summary Structure

```
1. Opening paragraph — who attended, meeting type, 1-sentence scope
2. Sections by topic (use <h2>), ordered by importance not chronology
3. Action Items — bulleted, bolded names, specific deliverables + deadlines
4. Standout Quotes — 3 quotes, italic, attributed (— Name)
```

## Writing Style

- **Concise.** Distill, don't transcribe. Cut filler.
- **Specific.** Names, dates, deadlines, numbers. No vague summaries.
- **Decisions over discussion.** Lead with what was decided, then context.
- **Bold key terms** on first mention in each section.
- **Use sub-headings** (`h2` with smaller fontSize style) for subsections within a topic.
- Em dashes OK in body text. Not in titles/subtitles.
- Use `&apos;` and `&quot;` for quotes in JSX, not raw characters.

## Tone

Professional but not corporate. Direct. These are internal working docs — write like you're briefing a smart teammate who missed the meeting.

## Team Names

- **Saeed** — CEO, strategy, branding, investor relations
- **Roman** — CTO, engineering, AI implementation, web/app
- **Enis** — Design (spelled E-N-I-S, not Ennis/Anis)
- **Kambar** — Research, infrastructure, server analysis

## Technical Notes

- Content is JSX (React component). Use `<h2>`, `<p>`, `<ul>`, `<ol>`, `<strong>`, `<em>`.
- For sub-headings within a section: `<h2 style={{ fontSize: '1.2rem' }}>`.
- Escape apostrophes: `&apos;`. Escape quotes: `&quot;`.
- No imports needed in content files besides the default export.
