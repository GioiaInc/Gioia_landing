'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDoc } from '@/lib/docs-config';
import { docsContent } from '@/content/docs';
import { getDocumentPage, type DocumentPage } from '@/lib/archive-api';

function Topbar() {
  return (
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
  );
}

function NotFound() {
  return (
    <>
      <Topbar />
      <div className="docs-article">
        <Link href="/docs" className="docs-article-back">
          &larr; Back
        </Link>
        <h1 className="docs-article-title">Not Found</h1>
        <p style={{ color: '#8a8580', fontStyle: 'italic', fontSize: '1.1rem' }}>
          This document does not exist.
        </p>
      </div>
    </>
  );
}

function ArchiveDocPage({ archiveSlug }: { archiveSlug: string }) {
  const [page, setPage] = useState<DocumentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getDocumentPage(archiveSlug)
      .then(setPage)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [archiveSlug]);

  if (loading) {
    return (
      <>
        <Topbar />
        <article className="docs-article">
          <Link href="/docs" className="docs-article-back">
            &larr; Back
          </Link>
          <p style={{ color: '#8a8580', fontStyle: 'italic', fontSize: '1.1rem' }}>
            Loading...
          </p>
        </article>
      </>
    );
  }

  if (error || !page) return <NotFound />;

  const dateStr = page.created_at?.split('T')[0]?.split(' ')[0];

  return (
    <>
      <Topbar />
      <article className="docs-article">
        <Link href="/docs" className="docs-article-back">
          &larr; Back
        </Link>

        <p className="docs-article-cat">Archive</p>
        <h1 className="docs-article-title">{page.title}</h1>
        {dateStr && <p className="docs-article-date">{dateStr}</p>}

        <div
          className="docs-article-body"
          dangerouslySetInnerHTML={{ __html: page.formatted_html }}
        />
      </article>

      <footer className="docs-footer">
        <p className="docs-footer-text">&copy; 2026 GIOIA</p>
      </footer>
    </>
  );
}

export default function DocPage() {
  const { slug } = useParams<{ slug: string }>();

  // Dynamic archive docs
  if (slug?.startsWith('archive-')) {
    const archiveSlug = slug.replace(/^archive-/, '');
    return <ArchiveDocPage archiveSlug={archiveSlug} />;
  }

  // Static docs
  const doc = getDoc(slug);
  const Content = slug ? docsContent[slug] : undefined;

  if (!doc || !Content) return <NotFound />;

  return (
    <>
      <Topbar />

      <article className="docs-article">
        <Link href="/docs" className="docs-article-back">
          &larr; Back
        </Link>

        {doc.category && <p className="docs-article-cat">{doc.category}</p>}
        <h1 className="docs-article-title">{doc.title}</h1>
        {doc.date && <p className="docs-article-date">{doc.date}</p>}

        <div className="docs-article-body">
          <Content />
        </div>
      </article>

      <footer className="docs-footer">
        <p className="docs-footer-text">&copy; 2026 GIOIA</p>
      </footer>
    </>
  );
}
