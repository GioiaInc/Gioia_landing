'use client';

import Link from 'next/link';

export default function Topbar() {
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
