'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDoc } from '@/lib/docs-config';
import { docsContent } from '@/content/docs';
import { getDocumentPage, aiEditDocument, type DocumentPage } from '@/lib/archive-api';

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
  const [editInput, setEditInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [editConfirm, setEditConfirm] = useState(false);

  useEffect(() => {
    getDocumentPage(archiveSlug)
      .then(setPage)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [archiveSlug]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInput.trim() || !page || editing) return;

    setEditing(true);
    try {
      const result = await aiEditDocument(page.id, editInput.trim());
      setPage({ ...page, formatted_html: result.formatted_html });
      setEditInput('');
      setEditConfirm(true);
      setTimeout(() => setEditConfirm(false), 2500);
    } catch {
      // silently fail — user can retry
    } finally {
      setEditing(false);
    }
  };

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
      <article className="docs-article" style={{ paddingBottom: '8rem' }}>
        <Link href="/docs" className="docs-article-back">
          &larr; Back
        </Link>

        <p className="docs-article-cat">Archive</p>
        <h1 className="docs-article-title">{page.title}</h1>
        {dateStr && <p className="docs-article-date">{dateStr}</p>}

        <div
          className={`docs-article-body${editing ? ' docs-edit-shimmer' : ''}`}
          dangerouslySetInnerHTML={{ __html: page.formatted_html }}
        />
      </article>

      {editConfirm && (
        <div className="docs-edit-toast">
          <span className="docs-edit-toast-icon">&#10003;</span>
          Done! Your edit has been applied.
        </div>
      )}

      <div className="docs-edit-bar">
        <form onSubmit={handleEdit} className="docs-edit-form">
          <input
            type="text"
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            placeholder="Edit this document…"
            className="docs-edit-input"
            disabled={editing}
          />
        </form>
      </div>

      <style jsx>{`
        .docs-edit-toast {
          position: fixed;
          top: 5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.05rem;
          font-style: italic;
          color: #3a3530;
          background: #faf9f6;
          border: 1px solid #e0dbd5;
          border-radius: 100px;
          padding: 0.7rem 1.6rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
          pointer-events: none;
          animation: docs-toast-life 2.8s ease forwards;
          white-space: nowrap;
        }
        .docs-edit-toast-icon {
          color: #c17c5f;
          margin-right: 0.5rem;
          font-style: normal;
        }
        @keyframes docs-toast-life {
          0% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          10% { opacity: 1; transform: translateX(-50%) translateY(0); }
          75% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
        }
        .docs-edit-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
          pointer-events: none;
          z-index: 50;
        }
        .docs-edit-form {
          max-width: 600px;
          width: 100%;
          pointer-events: auto;
        }
        .docs-edit-input {
          width: 100%;
          padding: 0.85rem 1.5rem;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.05rem;
          color: #1a1a1a;
          background: #faf9f6;
          border: 1px solid #ddd8d2;
          border-radius: 100px;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }
        .docs-edit-input::placeholder {
          color: #c0bbb5;
          font-style: italic;
        }
        .docs-edit-input:focus {
          border-color: #c17c5f;
          box-shadow: 0 2px 16px rgba(193, 124, 95, 0.1);
        }
        .docs-edit-input:disabled {
          opacity: 0.6;
        }
      `}</style>

      <style jsx global>{`
        @keyframes docs-shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .docs-edit-shimmer {
          animation: docs-shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
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
