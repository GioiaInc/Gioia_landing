'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSpec, editSpecAI, askSpecAI, type SpecData } from '@/lib/spec-api';

type Mode = 'edit' | 'ask';

function renderMarkdown(text: string): string {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="spec-code"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="spec-inline-code">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="spec-h3" id="$1">$1</h3>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="spec-h2" id="$1">$1</h2>')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="spec-h1">$1</h1>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="spec-bq">$1</blockquote>');

  // Unordered lists
  html = html.replace(/(^|\n)(- .+(?:\n- .+)*)/g, (_, pre, block) => {
    const items = block
      .split('\n')
      .map((line: string) => `<li>${line.replace(/^- /, '')}</li>`)
      .join('');
    return `${pre}<ul class="spec-ul">${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/(^|\n)(\d+\. .+(?:\n\d+\. .+)*)/g, (_, pre, block) => {
    const items = block
      .split('\n')
      .map((line: string) => `<li>${line.replace(/^\d+\. /, '')}</li>`)
      .join('');
    return `${pre}<ol class="spec-ol">${items}</ol>`;
  });

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="spec-p">');
  html = html.replace(/\n/g, '<br>');
  html = '<p class="spec-p">' + html + '</p>';
  // Clean empty paragraphs
  html = html.replace(/<p class="spec-p"><\/p>/g, '');
  html = html.replace(/<p class="spec-p">(<h[1-3])/g, '$1');
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
  html = html.replace(/<p class="spec-p">(<ul|<ol|<blockquote|<pre)/g, '$1');
  html = html.replace(/(<\/ul>|<\/ol>|<\/blockquote>|<\/pre>)<\/p>/g, '$1');

  return html;
}

export default function SpecPage() {
  const [spec, setSpec] = useState<SpecData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('edit');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentText, setSentText] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSpec()
      .then(setSpec)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy || !spec) return;

    const text = input.trim();
    setSentText(text);
    setInput('');
    setBusy(true);
    setAnswer(null);
    setTimeout(() => setSentText(null), 600);

    try {
      if (mode === 'edit') {
        const result = await editSpecAI(text);
        // Refresh spec
        const updated = await getSpec();
        setSpec(updated);
        showToast(result.diff_summary || 'Edit applied');
      } else {
        const result = await askSpecAI(text);
        setAnswer(result.answer);
      }
    } catch {
      showToast('Something went wrong');
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const scrollToSection = (title: string) => {
    setTocOpen(false);
    const el = bodyRef.current?.querySelector(`[id="${title.replace(/"/g, '\\"')}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <>
        <Topbar />
        <div className="docs-article">
          <div className="docs-loading" style={{ minHeight: '50vh' }}>
            <div className="docs-loading-dot" />
          </div>
        </div>
      </>
    );
  }

  if (!spec) {
    return (
      <>
        <Topbar />
        <div className="docs-article">
          <Link href="/docs" className="docs-article-back">&larr; Back</Link>
          <h1 className="docs-article-title">Spec Not Found</h1>
          <p style={{ color: '#8a8580', fontStyle: 'italic', fontSize: '1.1rem' }}>
            The product specification has not been initialized yet.
          </p>
        </div>
      </>
    );
  }

  const toc = spec.sections.filter((s) => s.level <= 3);
  const h2Sections = spec.sections.filter((s) => s.level === 2);

  return (
    <>
      <Topbar />
      <article className="docs-article" style={{ paddingBottom: '10rem' }}>
        <Link href="/docs" className="docs-article-back">&larr; Back</Link>

        <p className="docs-article-cat">Product Specification</p>
        <h1 className="docs-article-title">{spec.title}</h1>
        <p className="docs-article-date">
          Last updated {new Date(spec.updated_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        <div className="spec-toolbar">
          <button className="spec-toolbar-btn" onClick={() => setTocOpen(!tocOpen)}>
            {tocOpen ? 'Close' : 'Contents'}
          </button>
          <Link href="/docs/spec/history" className="spec-toolbar-btn">
            History
          </Link>
        </div>

        {tocOpen && (
          <nav className="spec-toc">
            {toc.map((s, i) => (
              <button
                key={i}
                className="spec-toc-item"
                style={{ paddingLeft: `${(s.level - 1) * 1.2}rem` }}
                onClick={() => scrollToSection(s.title)}
              >
                {s.title}
              </button>
            ))}
          </nav>
        )}

        <div
          ref={bodyRef}
          className={`docs-article-body spec-body${busy && mode === 'edit' ? ' docs-edit-shimmer' : ''}`}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(spec.markdown) }}
        />
      </article>

      {answer && (
        <div className="spec-answer-overlay" onClick={() => setAnswer(null)}>
          <div className="spec-answer-card" onClick={(e) => e.stopPropagation()}>
            <button className="spec-answer-close" onClick={() => setAnswer(null)}>&times;</button>
            <div
              className="docs-article-body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }}
            />
          </div>
        </div>
      )}

      {toast && (
        <div className="docs-edit-toast">
          <span className="docs-edit-toast-icon">&#10003;</span>
          {toast}
        </div>
      )}

      <div className="spec-bottom-bar">
        <div className="spec-mode-toggle">
          <button
            className={`spec-mode-btn${mode === 'edit' ? ' spec-mode-active' : ''}`}
            onClick={() => { setMode('edit'); setAnswer(null); }}
          >
            Edit
          </button>
          <button
            className={`spec-mode-btn${mode === 'ask' ? ' spec-mode-active' : ''}`}
            onClick={() => setMode('ask')}
          >
            Ask
          </button>
        </div>
        <form onSubmit={handleSubmit} className="docs-edit-form">
          <div className="docs-edit-input-wrap">
            {sentText && <span className="docs-edit-fly">{sentText}</span>}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                busy
                  ? ''
                  : mode === 'edit'
                    ? 'Edit the spec... e.g. "Add a section about data encryption"'
                    : 'Ask about the spec... e.g. "How does mood scoring work?"'
              }
              className="docs-edit-input"
              disabled={busy}
            />
            {busy && (
              <span className="docs-edit-dots">
                <span /><span /><span />
              </span>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .spec-toolbar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .spec-toolbar-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #a09890;
          background: none;
          border: 1px solid #e0dbd5;
          border-radius: 100px;
          padding: 0.45rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }
        .spec-toolbar-btn:hover {
          color: #1a1a1a;
          border-color: #c17c5f;
        }

        .spec-toc {
          display: flex;
          flex-direction: column;
          margin-bottom: 2.5rem;
          border: 1px solid #e8e4df;
          border-radius: 8px;
          padding: 1.5rem;
          background: rgba(250, 249, 246, 0.5);
        }
        .spec-toc-item {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.95rem;
          color: #5a5550;
          background: none;
          border: none;
          text-align: left;
          padding: 0.3rem 0;
          cursor: pointer;
          transition: color 0.2s;
        }
        .spec-toc-item:hover {
          color: #c17c5f;
        }

        .spec-answer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 2rem;
        }
        .spec-answer-card {
          background: #faf9f6;
          border-radius: 12px;
          max-width: 640px;
          width: 100%;
          max-height: 70vh;
          overflow-y: auto;
          padding: 2.5rem;
          position: relative;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
        }
        .spec-answer-close {
          position: absolute;
          top: 1rem;
          right: 1.2rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #a09890;
          cursor: pointer;
          line-height: 1;
        }
        .spec-answer-close:hover {
          color: #1a1a1a;
        }

        .spec-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
          pointer-events: none;
          z-index: 50;
        }
        .spec-mode-toggle {
          display: flex;
          gap: 0;
          margin-bottom: 0.5rem;
          pointer-events: auto;
          background: #faf9f6;
          border: 1px solid #e0dbd5;
          border-radius: 100px;
          overflow: hidden;
        }
        .spec-mode-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b0aaa4;
          background: none;
          border: none;
          padding: 0.35rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .spec-mode-active {
          color: #1a1a1a;
          background: #f0ece7;
        }
        .spec-mode-btn:hover {
          color: #1a1a1a;
        }
      `}</style>

      <style jsx global>{`
        .spec-body {
          scroll-behavior: smooth;
        }
        .spec-h1 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 2rem;
          color: #1a1a1a;
          margin: 2rem 0 1rem;
        }
        .spec-h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.5rem;
          color: #1a1a1a;
          margin: 3rem 0 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e8e4df;
        }
        .spec-h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.15rem;
          color: #3a3530;
          margin: 2rem 0 0.75rem;
        }
        .spec-p {
          margin: 0 0 1.25rem;
        }
        .spec-ul, .spec-ol {
          margin: 0 0 1.25rem;
          padding-left: 1.5rem;
        }
        .spec-ul li, .spec-ol li {
          margin-bottom: 0.5rem;
        }
        .spec-bq {
          border-left: 3px solid #c17c5f;
          padding: 0.5rem 1rem;
          margin: 0 0 1.25rem;
          color: #6a6560;
          font-style: italic;
        }
        .spec-code {
          background: #f0ece7;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.85em;
          margin: 0 0 1.25rem;
        }
        .spec-inline-code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.85em;
          background: #f0ece7;
          padding: 0.15em 0.4em;
          border-radius: 2px;
          color: #5a5550;
        }

        /* Edit bar styles (shared) */
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
          max-width: 90vw;
          overflow: hidden;
          text-overflow: ellipsis;
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
          0% { opacity: 1; transform: translateY(-50%) scale(1); }
          100% { opacity: 0; transform: translateY(calc(-50% - 60px)) scale(0.92); }
        }
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
        .docs-edit-dots span:nth-child(2) { animation-delay: 0.15s; }
        .docs-edit-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes docs-dot-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
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

function Topbar() {
  return (
    <nav className="docs-topbar">
      <Link href="/docs" className="docs-topbar-brand">
        GIOIA Docs
      </Link>
      <div className="docs-topbar-nav">
        <Link href="/docs/spec" className="docs-topbar-link" style={{ color: '#c17c5f' }}>
          Spec
        </Link>
        <Link href="/docs/spec/history" className="docs-topbar-link">
          History
        </Link>
        <Link href="/docs" className="docs-topbar-link">
          Docs
        </Link>
        <Link href="/" className="docs-topbar-link">
          Home
        </Link>
      </div>
    </nav>
  );
}
