'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getSpec, editSpecAI, askSpecAI, type SpecData } from '@/lib/spec-api';

type Mode = 'ai-edit' | 'ask' | 'edit';

function renderMarkdown(text: string): string {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="spec-code"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="spec-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^### (.+)$/gm, (_m, t) => `<h3 class="spec-h3" id="s-${slugify(t)}">${t}</h3>`)
    .replace(/^## (.+)$/gm, (_m, t) => `<h2 class="spec-h2" id="s-${slugify(t)}">${t}</h2>`)
    .replace(/^# (.+)$/gm, '<h1 class="spec-h1">$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote class="spec-bq">$1</blockquote>');

  html = html.replace(/(^|\n)(- .+(?:\n- .+)*)/g, (_, pre, block) => {
    const items = block.split('\n').map((line: string) => `<li>${line.replace(/^- /, '')}</li>`).join('');
    return `${pre}<ul class="spec-ul">${items}</ul>`;
  });
  html = html.replace(/(^|\n)(\d+\. .+(?:\n\d+\. .+)*)/g, (_, pre, block) => {
    const items = block.split('\n').map((line: string) => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('');
    return `${pre}<ol class="spec-ol">${items}</ol>`;
  });

  html = html.replace(/\n\n/g, '</p><p class="spec-p">');
  html = html.replace(/\n/g, '<br>');
  html = '<p class="spec-p">' + html + '</p>';
  html = html.replace(/<p class="spec-p"><\/p>/g, '');
  html = html.replace(/<p class="spec-p">(<h[1-3])/g, '$1');
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
  html = html.replace(/<p class="spec-p">(<ul|<ol|<blockquote|<pre)/g, '$1');
  html = html.replace(/(<\/ul>|<\/ol>|<\/blockquote>|<\/pre>)<\/p>/g, '$1');

  return html;
}

/** Convert edited HTML back to clean markdown */
function htmlToMarkdown(el: HTMLElement): string {
  const lines: string[] = [];

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      lines.push(node.textContent || '');
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = (node as HTMLElement).tagName.toLowerCase();

    if (tag === 'h1') {
      lines.push('\n# ' + (node as HTMLElement).textContent?.trim() + '\n');
    } else if (tag === 'h2') {
      lines.push('\n## ' + (node as HTMLElement).textContent?.trim() + '\n');
    } else if (tag === 'h3') {
      lines.push('\n### ' + (node as HTMLElement).textContent?.trim() + '\n');
    } else if (tag === 'p') {
      lines.push('\n');
      walkChildren(node);
      lines.push('\n');
    } else if (tag === 'br') {
      lines.push('\n');
    } else if (tag === 'strong' || tag === 'b') {
      lines.push('**');
      walkChildren(node);
      lines.push('**');
    } else if (tag === 'em' || tag === 'i') {
      lines.push('*');
      walkChildren(node);
      lines.push('*');
    } else if (tag === 'code') {
      const parent = (node as HTMLElement).closest('pre');
      if (parent) {
        lines.push('\n```\n' + (node as HTMLElement).textContent + '\n```\n');
      } else {
        lines.push('`' + (node as HTMLElement).textContent + '`');
      }
    } else if (tag === 'pre') {
      // code block — handled by inner <code>
      const code = (node as HTMLElement).querySelector('code');
      if (code) {
        lines.push('\n```\n' + code.textContent + '\n```\n');
      } else {
        lines.push('\n```\n' + (node as HTMLElement).textContent + '\n```\n');
      }
    } else if (tag === 'ul') {
      lines.push('\n');
      const items = (node as HTMLElement).querySelectorAll(':scope > li');
      items.forEach((li) => {
        lines.push('-   ' + li.textContent?.trim() + '\n');
      });
      lines.push('\n');
    } else if (tag === 'ol') {
      lines.push('\n');
      const items = (node as HTMLElement).querySelectorAll(':scope > li');
      items.forEach((li, i) => {
        lines.push((i + 1) + '. ' + li.textContent?.trim() + '\n');
      });
      lines.push('\n');
    } else if (tag === 'blockquote') {
      lines.push('\n> ' + (node as HTMLElement).textContent?.trim() + '\n');
    } else if (tag === 'a') {
      const href = (node as HTMLAnchorElement).getAttribute('href') || '';
      lines.push('[' + (node as HTMLElement).textContent + '](' + href + ')');
    } else if (tag === 'li') {
      // handled by parent ul/ol
    } else {
      walkChildren(node);
    }
  }

  function walkChildren(node: Node) {
    node.childNodes.forEach(walk);
  }

  el.childNodes.forEach(walk);

  // Clean up: collapse 3+ newlines to 2, trim
  return lines.join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function SpecPage() {
  const [spec, setSpec] = useState<SpecData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('ai-edit');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentText, setSentText] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSpec()
      .then(setSpec)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const editing = mode === 'edit';

  useEffect(() => {
    if (!spec || !bodyRef.current || editing) return;
    const headings = bodyRef.current.querySelectorAll('h2[id], h3[id]');
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [spec, editing]);

  // Scroll progress tracker
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) setScrollPct(Math.min(scrollTop / docHeight, 1));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
      if (mode === 'ai-edit') {
        const result = await editSpecAI(text);
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

  const enterEditMode = useCallback(() => {
    setMode('edit');
    setDirty(false);
    requestAnimationFrame(() => {
      if (bodyRef.current) {
        bodyRef.current.contentEditable = 'true';
        bodyRef.current.focus();
      }
    });
  }, []);

  const exitEditMode = useCallback(() => {
    setMode('ai-edit');
    setDirty(false);
    if (bodyRef.current && spec) {
      bodyRef.current.contentEditable = 'false';
      bodyRef.current.innerHTML = renderMarkdown(spec.markdown);
    }
  }, [spec]);

  const saveEditing = async () => {
    if (!bodyRef.current || !spec) return;
    setBusy(true);
    try {
      const newMarkdown = htmlToMarkdown(bodyRef.current);
      const API_BASE = process.env.NEXT_PUBLIC_ARCHIVE_API || 'http://localhost:3001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('gioia-docs-token') || '' : '';
      const res = await fetch(`${API_BASE}/api/spec/edit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: newMarkdown, instruction: 'Manual inline edit' }),
      });
      if (!res.ok) throw new Error('Save failed');
      bodyRef.current.contentEditable = 'false';
      const updated = await getSpec();
      setSpec(updated);
      setMode('ai-edit');
      setDirty(false);
      showToast('Saved');
    } catch {
      showToast('Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleScrollBarDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      const pct = Math.max(0, Math.min(1, (clientY - 65) / (window.innerHeight - 65)));
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: pct * docHeight });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
  }, []);

  const scrollToSection = useCallback((title: string) => {
    const id = 's-' + slugify(title);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setSidebarOpen(false);
  }, []);

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

  const tocItems = spec.sections.filter((s) => s.level === 2 || s.level === 3);

  return (
    <>
      <Topbar />

      <button className="spec-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '\u2715' : '\u2630'}
      </button>
      {sidebarOpen && <div className="spec-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="spec-layout">
        <nav className={`spec-sidebar${sidebarOpen ? ' spec-sidebar-open' : ''}`}>
          <div className="spec-sidebar-inner">
            <p className="spec-sidebar-label">Contents</p>
            {tocItems.map((s, i) => {
              const id = 's-' + slugify(s.title);
              const isActive = activeSection === id;
              return (
                <button
                  key={i}
                  className={`spec-sidebar-item${s.level === 3 ? ' spec-sidebar-sub' : ''}${isActive ? ' spec-sidebar-active' : ''}`}
                  onClick={() => scrollToSection(s.title)}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </nav>

        <article className="spec-main">
          <Link href="/docs" className="docs-article-back">&larr; Back</Link>

          <p className="docs-article-cat">Product Specification</p>
          <h1 className="docs-article-title">{spec.title}</h1>
          <p className="docs-article-date">
            Last updated {new Date(spec.updated_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
            {' \u00b7 '}
            <Link href="/docs/spec/history" style={{ color: '#c17c5f', textDecoration: 'none' }}>
              View history
            </Link>
            {' \u00b7 '}
            <Link href="/docs/spec/api" style={{ color: '#c17c5f', textDecoration: 'none' }}>
              API
            </Link>
          </p>

          {editing && (
            <div className="spec-edit-bar-inline">
              <span className="spec-edit-bar-label">Editing</span>
              <div className="spec-edit-bar-actions">
                <button className="spec-edit-bar-btn spec-edit-bar-cancel" onClick={exitEditMode}>
                  Cancel
                </button>
                <button
                  className="spec-edit-bar-btn spec-edit-bar-save"
                  onClick={saveEditing}
                  disabled={busy}
                >
                  {busy ? 'Saving\u2026' : 'Save'}
                </button>
              </div>
            </div>
          )}

          <div
            ref={bodyRef}
            className={`docs-article-body spec-body${editing ? ' spec-body-editing' : ''}${busy && mode === 'ai-edit' ? ' docs-edit-shimmer' : ''}`}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(spec.markdown) }}
            onInput={() => { if (editing && !dirty) setDirty(true); }}
            suppressContentEditableWarning
          />
        </article>
      </div>

      {answer && (
        <div className="spec-answer-overlay" onClick={() => setAnswer(null)}>
          <div className="spec-answer-card" onClick={(e) => e.stopPropagation()}>
            <button className="spec-answer-close" onClick={() => setAnswer(null)}>&times;</button>
            <div className="docs-article-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }} />
          </div>
        </div>
      )}

      {toast && (
        <div className="docs-edit-toast">
          <span className="docs-edit-toast-icon">&#10003;</span>
          {toast}
        </div>
      )}

      {/* Scroll progress bar */}
      <div
        className="spec-scroll-track"
        onClick={(e) => {
          const pct = Math.max(0, Math.min(1, (e.clientY - 65) / (window.innerHeight - 65)));
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: pct * docHeight, behavior: 'smooth' });
        }}
      >
        <div
          className="spec-scroll-thumb"
          style={{ top: `${scrollPct * 100}%` }}
          onMouseDown={handleScrollBarDrag}
          onTouchStart={handleScrollBarDrag}
        />
      </div>

      <div className="spec-bottom-bar">
        <div className="spec-mode-toggle">
          <button className={`spec-mode-btn${mode === 'ai-edit' ? ' spec-mode-active' : ''}`}
            onClick={() => { if (editing) exitEditMode(); setMode('ai-edit'); setAnswer(null); }}>AI Edit</button>
          <button className={`spec-mode-btn${mode === 'ask' ? ' spec-mode-active' : ''}`}
            onClick={() => { if (editing) exitEditMode(); setMode('ask'); }}>Ask</button>
          <button className={`spec-mode-btn${mode === 'edit' ? ' spec-mode-active' : ''}`}
            onClick={enterEditMode}>Edit</button>
        </div>
        {!editing && (
          <form onSubmit={handleSubmit} className="docs-edit-form">
            <div className="docs-edit-input-wrap">
              {sentText && <span className="docs-edit-fly">{sentText}</span>}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={busy ? ''
                  : mode === 'ai-edit'
                    ? 'AI edit\u2026 e.g. "Add a section about encryption"'
                    : 'Ask\u2026 e.g. "How does mood scoring work?"'}
                className="docs-edit-input"
                disabled={busy}
              />
              {busy && <span className="docs-edit-dots"><span /><span /><span /></span>}
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .spec-layout { display: flex; min-height: calc(100vh - 65px); }

        .spec-sidebar {
          width: 260px; flex-shrink: 0; border-right: 1px solid #e8e4df;
          background: #faf9f6; height: calc(100vh - 65px); position: sticky;
          top: 65px; overflow-y: auto; overflow-x: hidden;
          scrollbar-width: thin; scrollbar-color: #e0dbd5 transparent;
        }
        .spec-sidebar::-webkit-scrollbar { width: 4px; }
        .spec-sidebar::-webkit-scrollbar-track { background: transparent; }
        .spec-sidebar::-webkit-scrollbar-thumb { background: #e0dbd5; border-radius: 4px; }
        .spec-sidebar-inner { padding: 2rem 1.25rem 4rem; }
        .spec-sidebar-label {
          font-family: 'Montserrat', sans-serif; font-size: 0.55rem; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; color: #a09890;
          margin: 0 0 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e8e4df;
        }
        .spec-sidebar-item {
          display: block; width: 100%; text-align: left;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.85rem; line-height: 1.35; color: #8a8580;
          background: none; border: none; border-left: 2px solid transparent;
          padding: 0.35rem 0 0.35rem 0.75rem; margin: 0; cursor: pointer;
          transition: color 0.2s, border-color 0.3s;
        }
        .spec-sidebar-sub { font-size: 0.78rem; padding-left: 1.5rem; color: #b0aaa4; }
        .spec-sidebar-item:hover { color: #1a1a1a; }
        .spec-sidebar-active { color: #c17c5f !important; border-left-color: #c17c5f; }

        .spec-sidebar-toggle {
          display: none; position: fixed; top: 75px; left: 12px; z-index: 150;
          width: 36px; height: 36px; border-radius: 50%; background: #faf9f6;
          border: 1px solid #e0dbd5; color: #8a8580; font-size: 1rem;
          cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s;
        }
        .spec-sidebar-toggle:hover { color: #1a1a1a; border-color: #c17c5f; }
        .spec-sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.2); z-index: 99; }

        @media (max-width: 960px) {
          .spec-sidebar {
            position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
            transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: none;
          }
          .spec-sidebar-open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.08); }
          .spec-sidebar-toggle { display: flex; align-items: center; justify-content: center; }
          .spec-sidebar-overlay { display: block; }
          .spec-layout { flex-direction: column; }
        }

        .spec-main { flex: 1; min-width: 0; max-width: 720px; margin: 0 auto; padding: 4rem 2rem 10rem; }
        @media (max-width: 540px) { .spec-main { padding: 2.5rem 1.5rem 10rem; } }

        .spec-scroll-track {
          position: fixed; right: 4px; top: 75px; bottom: 10px; width: 8px;
          z-index: 40; cursor: pointer;
        }
        .spec-scroll-thumb {
          position: absolute; right: 0; width: 4px; height: 48px;
          background: #c17c5f; border-radius: 4px; opacity: 0.35;
          transform: translateY(-50%); cursor: grab; transition: opacity 0.2s, width 0.15s;
        }
        .spec-scroll-track:hover .spec-scroll-thumb,
        .spec-scroll-thumb:active { opacity: 0.7; width: 6px; }

        .spec-edit-bar-inline {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 1rem; margin-bottom: 1.5rem;
          background: #faf9f6; border: 1px solid #c17c5f; border-radius: 8px;
          position: sticky; top: 65px; z-index: 10;
          box-shadow: 0 2px 12px rgba(193,124,95,0.08);
        }
        .spec-edit-bar-label {
          font-family: 'Montserrat', sans-serif; font-size: 0.55rem; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase; color: #c17c5f;
        }
        .spec-edit-bar-actions { display: flex; gap: 0.5rem; }
        .spec-edit-bar-btn {
          font-family: 'Montserrat', sans-serif; font-size: 0.55rem; letter-spacing: 0.12em;
          text-transform: uppercase; border: 1px solid #e0dbd5; border-radius: 100px;
          padding: 0.3rem 0.85rem; cursor: pointer; transition: all 0.2s;
        }
        .spec-edit-bar-cancel { color: #a09890; background: none; }
        .spec-edit-bar-cancel:hover { color: #1a1a1a; border-color: #aaa; }
        .spec-edit-bar-save { color: #fff; background: #c17c5f; border-color: #c17c5f; }
        .spec-edit-bar-save:hover { background: #a8694f; }
        .spec-edit-bar-save:disabled { opacity: 0.6; cursor: default; }

        .spec-answer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center; z-index: 200; padding: 2rem;
        }
        .spec-answer-card {
          background: #faf9f6; border-radius: 12px; max-width: 640px; width: 100%;
          max-height: 70vh; overflow-y: auto; padding: 2.5rem; position: relative;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15);
        }
        .spec-answer-close {
          position: absolute; top: 1rem; right: 1.2rem; background: none; border: none;
          font-size: 1.5rem; color: #a09890; cursor: pointer; line-height: 1;
        }
        .spec-answer-close:hover { color: #1a1a1a; }

        .spec-bottom-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          display: flex; flex-direction: column; align-items: center;
          padding: 0 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
          pointer-events: none; z-index: 50;
        }
        .spec-mode-toggle {
          display: flex; gap: 0; margin-bottom: 0.5rem; pointer-events: auto;
          background: #faf9f6; border: 1px solid #e0dbd5; border-radius: 100px; overflow: hidden;
        }
        .spec-mode-btn {
          font-family: 'Montserrat', sans-serif; font-size: 0.55rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: #b0aaa4; background: none; border: none;
          padding: 0.35rem 1rem; cursor: pointer; transition: all 0.2s;
        }
        .spec-mode-active { color: #1a1a1a; background: #f0ece7; }
        .spec-mode-btn:hover { color: #1a1a1a; }
      `}</style>

      <style jsx global>{`
        .spec-body { scroll-behavior: smooth; }
        .spec-body-editing {
          outline: none;
          border-radius: 8px;
          padding: 0.5rem;
          margin: -0.5rem;
          background: rgba(193,124,95,0.02);
          border: 1px dashed rgba(193,124,95,0.15);
          cursor: text;
        }
        .spec-body-editing:focus {
          background: rgba(193,124,95,0.03);
          border-color: rgba(193,124,95,0.25);
        }
        .spec-h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; font-size: 2rem; color: #1a1a1a; margin: 2rem 0 1rem; }
        .spec-h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; font-size: 1.5rem; color: #1a1a1a; margin: 3rem 0 1rem; padding-top: 1.5rem; border-top: 1px solid #e8e4df; scroll-margin-top: 90px; }
        .spec-h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; font-size: 1.15rem; color: #3a3530; margin: 2rem 0 0.75rem; scroll-margin-top: 90px; }
        .spec-p { margin: 0 0 1.25rem; }
        .spec-ul, .spec-ol { margin: 0 0 1.25rem; padding-left: 1.5rem; }
        .spec-ul li, .spec-ol li { margin-bottom: 0.5rem; }
        .spec-bq { border-left: 3px solid #c17c5f; padding: 0.5rem 1rem; margin: 0 0 1.25rem; color: #6a6560; font-style: italic; }
        .spec-code { background: #f0ece7; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85em; margin: 0 0 1.25rem; }
        .spec-inline-code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.85em; background: #f0ece7; padding: 0.15em 0.4em; border-radius: 2px; color: #5a5550; }

        .docs-edit-toast {
          position: fixed; top: 5rem; left: 50%; transform: translateX(-50%); z-index: 100;
          font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.05rem; font-style: italic;
          color: #3a3530; background: #faf9f6; border: 1px solid #e0dbd5; border-radius: 100px;
          padding: 0.7rem 1.6rem; box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
          pointer-events: none; animation: docs-toast-life 2.8s ease forwards;
          white-space: nowrap; max-width: 90vw; overflow: hidden; text-overflow: ellipsis;
        }
        .docs-edit-toast-icon { color: #c17c5f; margin-right: 0.5rem; font-style: normal; }
        @keyframes docs-toast-life {
          0% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          10% { opacity: 1; transform: translateX(-50%) translateY(0); }
          75% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
        }
        .docs-edit-form { max-width: 600px; width: 100%; pointer-events: auto; }
        .docs-edit-input-wrap { position: relative; }
        .docs-edit-input {
          width: 100%; padding: 0.85rem 1.5rem; font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.05rem; color: #1a1a1a; background: #faf9f6;
          border: 1px solid #ddd8d2; border-radius: 100px; outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .docs-edit-input::placeholder { color: #c0bbb5; font-style: italic; }
        .docs-edit-input:focus { border-color: #c17c5f; box-shadow: 0 2px 16px rgba(193,124,95,0.1); }
        .docs-edit-input:disabled { opacity: 1; }
        .docs-edit-fly {
          position: absolute; left: 1.5rem; top: 50%; transform: translateY(-50%);
          font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.05rem;
          color: #c17c5f; pointer-events: none; white-space: nowrap; overflow: hidden;
          max-width: calc(100% - 3rem); text-overflow: ellipsis;
          animation: docs-fly-up 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 2;
        }
        @keyframes docs-fly-up {
          0% { opacity: 1; transform: translateY(-50%) scale(1); }
          100% { opacity: 0; transform: translateY(calc(-50% - 60px)) scale(0.92); }
        }
        .docs-edit-dots {
          position: absolute; left: 1.5rem; top: 50%; transform: translateY(-50%);
          display: flex; gap: 5px; align-items: center;
        }
        .docs-edit-dots span {
          width: 5px; height: 5px; border-radius: 50%; background: #c17c5f;
          animation: docs-dot-pulse 1.2s ease-in-out infinite;
        }
        .docs-edit-dots span:nth-child(2) { animation-delay: 0.15s; }
        .docs-edit-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes docs-dot-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes docs-shimmer { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .docs-edit-shimmer { animation: docs-shimmer 1.5s ease-in-out infinite; }
      `}</style>
    </>
  );
}

function Topbar() {
  return (
    <nav className="docs-topbar">
      <Link href="/docs" className="docs-topbar-brand">GIOIA Docs</Link>
      <div className="docs-topbar-nav">
        <Link href="/docs/spec" className="docs-topbar-link" style={{ color: '#c17c5f' }}>Spec</Link>
        <Link href="/docs/spec/history" className="docs-topbar-link">History</Link>
        <Link href="/docs/spec/api" className="docs-topbar-link">API</Link>
        <Link href="/docs" className="docs-topbar-link">Docs</Link>
        <Link href="/" className="docs-topbar-link">Home</Link>
      </div>
    </nav>
  );
}
