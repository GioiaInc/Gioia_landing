'use client';

import Link from 'next/link';
import { docs } from '@/lib/docs-config';

export default function DocsHub() {
  // Sort by date descending (newest first)
  const sorted = [...docs].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return b.date.localeCompare(a.date);
  });

  // Group by month-year
  const grouped: Record<string, typeof docs> = {};
  for (const doc of sorted) {
    const key = doc.date
      ? new Date(doc.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      : 'Undated';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(doc);
  }

  function formatDay(dateStr?: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <>
      <nav className="docs-topbar">
        <Link href="/docs" className="docs-topbar-brand">
          GIOIA Docs
        </Link>
        <div className="docs-topbar-nav">
          <Link href="/" className="docs-topbar-link">
            Home
          </Link>
        </div>
      </nav>

      <div className="docs-hub-list">
        <h1 className="docs-hub-title">Documents</h1>

        {Object.entries(grouped).map(([month, entries]) => (
          <div key={month} className="docs-month-group">
            <p className="docs-month-label">{month}</p>

            <div className="docs-entries">
              {entries.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="docs-entry"
                >
                  <div className="docs-entry-date">{formatDay(doc.date)}</div>
                  <div className="docs-entry-body">
                    <span className="docs-entry-title">{doc.title}</span>
                    {doc.subtitle && (
                      <span className="docs-entry-sub">{doc.subtitle}</span>
                    )}
                  </div>
                  {doc.category && (
                    <span className="docs-entry-cat">{doc.category}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="docs-footer">
        <p className="docs-footer-text">&copy; 2026 GIOIA</p>
      </footer>
    </>
  );
}
