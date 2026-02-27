'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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

type DocTab = 'summary' | 'preview' | 'link';

function ArchiveDocPage({ archiveSlug }: { archiveSlug: string }) {
  const [page, setPage] = useState<DocumentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<DocTab>('summary');
  const [editInput, setEditInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [editConfirm, setEditConfirm] = useState(false);
  const [sentText, setSentText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getDocumentPage(archiveSlug)
      .then(setPage)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [archiveSlug]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInput.trim() || !page || editing) return;

    const instruction = editInput.trim();
    setSentText(instruction);
    setEditInput('');
    setEditing(true);

    // Clear the flying text after animation completes
    setTimeout(() => setSentText(null), 600);

    try {
      const result = await aiEditDocument(page.id, instruction);
      setPage({ ...page, formatted_html: result.formatted_html });
      setEditConfirm(true);
      setTimeout(() => setEditConfirm(false), 2500);
    } catch {
      // silently fail — user can retry
    } finally {
      setEditing(false);
      inputRef.current?.focus();
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
  const hasPreview = !!page.source_html;
  const hasLink = !!page.source_url;
  const hasSecondTab = hasPreview || hasLink;

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

        {hasSecondTab && (
          <div className="doc-tabs">
            <button
              className={`doc-tab${activeTab === 'summary' ? ' doc-tab-active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            {hasPreview && (
              <button
                className={`doc-tab${activeTab === 'preview' ? ' doc-tab-active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
            )}
            {hasLink && !hasPreview && (
              <a
                className="doc-tab"
                href={page.source_url!}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source &#8599;
              </a>
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div
            className={`docs-article-body${editing ? ' docs-edit-shimmer' : ''}`}
            dangerouslySetInnerHTML={{ __html: page.formatted_html }}
          />
        )}

        {activeTab === 'preview' && hasPreview && (
          <>
            {hasLink && (
              <a
                className="doc-source-link"
                href={page.source_url!}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original &#8599;
              </a>
            )}
            <div className="doc-preview-frame">
              <iframe
                srcDoc={page.source_html!}
                className="doc-preview-iframe"
                sandbox="allow-same-origin"
                title="Original document preview"
              />
            </div>
          </>
        )}
      </article>

      {editConfirm && (
        <div className="docs-edit-toast">
          <span className="docs-edit-toast-icon">&#10003;</span>
          Done! Your edit has been applied.
        </div>
      )}

      <div className="docs-edit-bar">
        <form onSubmit={handleEdit} className="docs-edit-form">
          <div className="docs-edit-input-wrap">
            {sentText && (
              <span className="docs-edit-fly">{sentText}</span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              placeholder={editing ? '' : 'Edit this document…'}
              className="docs-edit-input"
              disabled={editing}
            />
            {editing && (
              <span className="docs-edit-dots">
                <span /><span /><span />
              </span>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .doc-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 1.8rem;
          border-bottom: 1px solid #e8e4df;
        }
        .doc-tab {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #b0aaa4;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 0.5rem 1.2rem;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          text-decoration: none;
        }
        .doc-tab:hover {
          color: #1a1a1a;
        }
        .doc-tab-active {
          color: #1a1a1a;
          border-bottom-color: #c17c5f;
        }
        .doc-source-link {
          display: inline-block;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c17c5f;
          text-decoration: none;
          margin-bottom: 1rem;
          transition: opacity 0.2s;
        }
        .doc-source-link:hover {
          opacity: 0.7;
        }
        .doc-preview-frame {
          border: 1px solid #e8e4df;
          border-radius: 6px;
          overflow: hidden;
          background: #fff;
        }
        .doc-preview-iframe {
          width: 100%;
          min-height: 70vh;
          border: none;
          display: block;
        }
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
        .docs-edit-input-wrap {
          position: relative;
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
          opacity: 1;
        }

        /* --- Flying text animation --- */
        .docs-edit-fly {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.05rem;
          color: #c17c5f;
          pointer-events: none;
          white-space: nowrap;
          overflow: hidden;
          max-width: calc(100% - 3rem);
          text-overflow: ellipsis;
          animation: docs-fly-up 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          z-index: 2;
        }
        @keyframes docs-fly-up {
          0% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(calc(-50% - 60px)) scale(0.92);
          }
        }

        /* --- Loading dots --- */
        .docs-edit-dots {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .docs-edit-dots span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #c17c5f;
          animation: docs-dot-pulse 1.2s ease-in-out infinite;
        }
        .docs-edit-dots span:nth-child(2) {
          animation-delay: 0.15s;
        }
        .docs-edit-dots span:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes docs-dot-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
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
