'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSpecHistory, revertSpec, type SpecEdit } from '@/lib/spec-api';

const SOURCE_LABELS: Record<string, string> = {
  web: 'Web',
  api: 'API',
  ai: 'AI',
  seed: 'System',
};

const ACTION_LABELS: Record<string, string> = {
  'ai-edit': 'AI Edit',
  replace: 'Direct Edit',
  revert: 'Revert',
  seed: 'Initialized',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SpecHistoryPage() {
  const [edits, setEdits] = useState<SpecEdit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reverting, setReverting] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getSpecHistory(100)
      .then((res) => {
        setEdits(res.edits);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRevert = async (editId: number) => {
    if (!confirm('Revert the spec to the version before this edit?')) return;
    setReverting(editId);
    try {
      await revertSpec(editId);
      setToast('Reverted successfully');
      setTimeout(() => setToast(null), 3000);
      // Refresh
      const res = await getSpecHistory(100);
      setEdits(res.edits);
      setTotal(res.total);
    } catch {
      setToast('Revert failed');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setReverting(null);
    }
  };

  return (
    <>
      <nav className="docs-topbar">
        <Link href="/docs" className="docs-topbar-brand">GIOIA Docs</Link>
        <div className="docs-topbar-nav">
          <Link href="/docs/spec" className="docs-topbar-link">Spec</Link>
          <Link href="/docs/spec/history" className="docs-topbar-link" style={{ color: '#c17c5f' }}>
            History
          </Link>
          <Link href="/docs" className="docs-topbar-link">Docs</Link>
          <Link href="/" className="docs-topbar-link">Home</Link>
        </div>
      </nav>

      <div className="docs-article" style={{ paddingBottom: '4rem' }}>
        <Link href="/docs/spec" className="docs-article-back">&larr; Back to Spec</Link>

        <p className="docs-article-cat">Audit Log</p>
        <h1 className="docs-article-title">Spec History</h1>
        <p className="docs-article-date">{total} edit{total !== 1 ? 's' : ''} recorded</p>

        {loading ? (
          <div className="docs-loading" style={{ minHeight: '30vh' }}>
            <div className="docs-loading-dot" />
          </div>
        ) : edits.length === 0 ? (
          <p style={{ color: '#8a8580', fontStyle: 'italic', fontSize: '1.1rem', marginTop: '2rem' }}>
            No edits yet.
          </p>
        ) : (
          <div className="hist-list">
            {edits.map((edit) => (
              <div key={edit.id} className="hist-entry">
                <div className="hist-entry-header">
                  <span className={`hist-badge hist-badge-${edit.source}`}>
                    {SOURCE_LABELS[edit.source] || edit.source}
                  </span>
                  <span className="hist-action">
                    {ACTION_LABELS[edit.action] || edit.action}
                  </span>
                  {edit.source_label && (
                    <span className="hist-label">{edit.source_label}</span>
                  )}
                  <span className="hist-date">{formatDate(edit.created_at)}</span>
                </div>
                {edit.diff_summary && (
                  <p className="hist-summary">{edit.diff_summary}</p>
                )}
                {edit.instruction && edit.action !== 'seed' && (
                  <p className="hist-instruction">&ldquo;{edit.instruction}&rdquo;</p>
                )}
                {edit.section && (
                  <p className="hist-section">Section: {edit.section}</p>
                )}
                <button
                  className="hist-revert-btn"
                  onClick={() => handleRevert(edit.id)}
                  disabled={reverting === edit.id}
                >
                  {reverting === edit.id ? 'Reverting...' : 'Revert to before this'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1.05rem',
            fontStyle: 'italic',
            color: '#3a3530',
            background: '#faf9f6',
            border: '1px solid #e0dbd5',
            borderRadius: '100px',
            padding: '0.7rem 1.6rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            pointerEvents: 'none',
          }}
        >
          {toast}
        </div>
      )}

      <style jsx>{`
        .hist-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 2rem;
        }
        .hist-entry {
          padding: 1.25rem 0;
          border-bottom: 1px solid #f0ece7;
        }
        .hist-entry:last-child {
          border-bottom: none;
        }
        .hist-entry-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.4rem;
        }
        .hist-badge {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.5rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          border-radius: 100px;
          font-weight: 600;
        }
        .hist-badge-ai {
          background: #f0e6df;
          color: #c17c5f;
        }
        .hist-badge-web {
          background: #e0ece7;
          color: #5a8a6a;
        }
        .hist-badge-api {
          background: #e0e4ec;
          color: #5a6a8a;
        }
        .hist-badge-seed {
          background: #f0ece7;
          color: #8a8580;
        }
        .hist-action {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8a8580;
        }
        .hist-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.55rem;
          color: #a09890;
          font-style: italic;
        }
        .hist-date {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.55rem;
          color: #b0aaa4;
          margin-left: auto;
        }
        .hist-summary {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.05rem;
          color: #2a2a2a;
          margin: 0.3rem 0 0;
          line-height: 1.5;
        }
        .hist-instruction {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.95rem;
          color: #8a8580;
          font-style: italic;
          margin: 0.2rem 0 0;
        }
        .hist-section {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c17c5f;
          margin: 0.3rem 0 0;
        }
        .hist-revert-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #b0aaa4;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.3rem 0;
          margin-top: 0.4rem;
          transition: color 0.2s;
        }
        .hist-revert-btn:hover {
          color: #c17c5f;
        }
        .hist-revert-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }
      `}</style>
    </>
  );
}
