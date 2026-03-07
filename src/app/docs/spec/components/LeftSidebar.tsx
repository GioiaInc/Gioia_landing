'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface LeftSidebarProps {
  editor: Editor | null;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function LeftSidebar({ editor }: LeftSidebarProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract headings from editor content
  useEffect(() => {
    if (!editor) return;

    const extractHeadings = () => {
      const el = editor.view.dom;
      const headings = el.querySelectorAll('h1, h2, h3');
      const tocItems: TocItem[] = [];
      headings.forEach((h) => {
        const level = parseInt(h.tagName[1]);
        if (level === 2 || level === 3) {
          const title = h.textContent || '';
          const id = 's-' + slugify(title);
          h.id = id;
          tocItems.push({ id, title, level });
        }
      });
      setItems(tocItems);
    };

    extractHeadings();
    editor.on('update', extractHeadings);
    return () => { editor.off('update', extractHeadings); };
  }, [editor]);

  // IntersectionObserver for active section tracking
  useEffect(() => {
    if (!editor || items.length === 0) return;

    const el = editor.view.dom;
    const headings = el.querySelectorAll('h2[id], h3[id]');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [editor, items]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setSidebarOpen(false);
  }, []);

  return (
    <>
      <button
        className="spec-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '\u2715' : '\u2630'}
      </button>
      {sidebarOpen && (
        <div className="spec-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <nav className={`spec-left-sidebar${sidebarOpen ? ' spec-left-sidebar-open' : ''}`}>
        <div className="spec-sidebar-inner">
          <p className="spec-sidebar-label">Contents</p>
          {items.map((item) => (
            <button
              key={item.id}
              className={`spec-sidebar-item${item.level === 3 ? ' spec-sidebar-sub' : ''}${activeId === item.id ? ' spec-sidebar-active' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.title}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
