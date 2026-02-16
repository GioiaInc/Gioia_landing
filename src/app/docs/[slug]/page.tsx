'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDoc } from '@/lib/docs-config';
import { docsContent } from '@/content/docs';

export default function DocPage() {
  const { slug } = useParams<{ slug: string }>();
  const doc = getDoc(slug);
  const Content = slug ? docsContent[slug] : undefined;

  if (!doc || !Content) {
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
