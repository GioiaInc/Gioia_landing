'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { docs, type DocEntry } from '@/lib/docs-config';
import { getDocuments, deleteDocument, type ArchiveDocument } from '@/lib/archive-api';
import QuoteColumns from './QuoteColumns';

export default function DocsHub() {
  const [dynamicDocs, setDynamicDocs] = useState<DocEntry[]>([]);
  const [archiveIdMap, setArchiveIdMap] = useState<Record<string, number>>({});

  useEffect(() => {
    getDocuments()
      .then((archiveDocs) => {
        const idMap: Record<string, number> = {};
        const staticSlugs = new Set(docs.map((d) => d.slug));
        const converted: DocEntry[] = archiveDocs
          .filter((d: ArchiveDocument) => d.status === 'ready' && d.slug && !staticSlugs.has(d.slug!))
          .map((d: ArchiveDocument) => {
            const slug = `archive-${d.slug}`;
            idMap[slug] = d.id;
            return {
              slug,
              title: d.title || d.original_name,
              subtitle: d.summary || undefined,
              date: d.created_at?.split('T')[0]?.split(' ')[0],
              category: 'Archive',
            };
          });
        setArchiveIdMap(idMap);
        setDynamicDocs(converted);
      })
      .catch(() => {});
  }, []);

  async function handleDelete(slug: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const id = archiveIdMap[slug];
    if (!id) return;
    const pw = prompt('Enter delete password:');
    if (!pw) return;
    try {
      await deleteDocument(id, pw);
      setDynamicDocs((prev) => prev.filter((d) => d.slug !== slug));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // Merge static + dynamic, sort by date descending
  const allDocs = [...docs, ...dynamicDocs];
  const sorted = allDocs.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return b.date.localeCompare(a.date);
  });

  // Group by month-year
  const grouped: Record<string, DocEntry[]> = {};
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
          <Link href="/docs/archive" className="docs-topbar-link">
            Archive
          </Link>
          <Link href="/docs/archive/upload" className="docs-topbar-link">
            Upload
          </Link>
          <Link href="/" className="docs-topbar-link">
            Home
          </Link>
        </div>
      </nav>

      <div className="docs-hub-with-quotes">
        <QuoteColumns />
        <div className="docs-hub-list">
          <h1 className="docs-hub-title">Documents</h1>

          {Object.entries(grouped).map(([month, entries]) => (
            <div key={month} className="docs-month-group">
              <p className="docs-month-label">{month}</p>

              <div className="docs-entries">
                {entries.map((doc) => (
                  <div key={doc.slug} style={{ position: 'relative' }}>
                    <Link
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
                    {archiveIdMap[doc.slug] && (
                      <button
                        onClick={(e) => handleDelete(doc.slug, e)}
                        title="Delete document"
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#888',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '4px 6px',
                          lineHeight: 1,
                          borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#e55')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="docs-footer">
        <p className="docs-footer-text">&copy; 2026 GIOIA</p>
      </footer>
    </>
  );
}
