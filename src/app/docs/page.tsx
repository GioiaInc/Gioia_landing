'use client';

import Link from 'next/link';
import { docs } from '@/lib/docs-config';

export default function DocsHub() {
  const count = docs.length;
  const radius = 170; // px from center
  const radiusMobile = 120;

  return (
    <>
      {/* Top bar */}
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

      {/* Hub */}
      <div className="docs-hub">
        <h1 className="docs-hub-title">Documents</h1>
        <p className="docs-hub-sub">Select a document to view.</p>

        {/* Circular orbit — desktop */}
        <div className="docs-orbit">
          <div className="docs-orbit-ring" />
          <div className="docs-orbit-center" />

          {docs.map((doc, i) => {
            const angle = (i / count) * 2 * Math.PI - Math.PI / 2; // start from top
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className="docs-orbit-item"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <div className="docs-orbit-item-inner">
                  <span className="docs-orbit-item-title">{doc.title}</span>
                  {doc.subtitle && (
                    <span className="docs-orbit-item-sub">{doc.subtitle}</span>
                  )}
                  {doc.category && (
                    <span className="docs-orbit-item-cat">{doc.category}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile list fallback */}
        <div className="docs-list-mobile">
          {docs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="docs-list-mobile-item"
            >
              <span className="docs-list-mobile-title">{doc.title}</span>
              {doc.category && (
                <span className="docs-list-mobile-cat">{doc.category}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="docs-footer">
        <p className="docs-footer-text">&copy; 2026 GIOIA</p>
      </footer>
    </>
  );
}
