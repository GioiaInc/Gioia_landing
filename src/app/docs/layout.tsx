'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gioia-docs-token';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<'loading' | 'locked' | 'unlocked'>('loading');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      setAuthState('locked');
      return;
    }

    try {
      const res = await fetch('/api/docs/verify', {
        headers: { 'x-docs-token': token },
      });
      if (res.ok) {
        setAuthState('unlocked');
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setAuthState('locked');
      }
    } catch {
      setAuthState('locked');
    }
  }, []);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/docs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.valid && data.token) {
        localStorage.setItem(STORAGE_KEY, data.token);
        setAuthState('unlocked');
      } else {
        setError('Incorrect password');
        setShakeKey((k) => k + 1);
        setPassword('');
      }
    } catch {
      setError('Something went wrong');
    }
  };

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="docs-shell">
        <div className="docs-loading">
          <div className="docs-loading-dot" />
        </div>
      </div>
    );
  }

  // Password gate
  if (authState === 'locked') {
    return (
      <div className="docs-shell">
        <div className="docs-gate">
          <div className="docs-gate-inner">
            <p className="docs-gate-brand">GIOIA</p>
            <h1 className="docs-gate-title">Internal Documents</h1>
            <p className="docs-gate-sub">Enter the password to continue.</p>

            <form onSubmit={handleSubmit} className="docs-gate-form">
              <div key={shakeKey} className={`docs-gate-input-wrap ${error ? 'docs-shake' : ''}`}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Password"
                  className="docs-gate-input"
                  autoFocus
                />
              </div>
              {error && <p className="docs-gate-error">{error}</p>}
              <button type="submit" className="docs-gate-btn">
                Enter
              </button>
            </form>
          </div>
        </div>

        <style jsx global>{`
          /* ========================================
             DOCS AREA — BALO-INSPIRED MINIMAL STYLE
             ======================================== */

          .docs-shell {
            min-height: 100vh;
            background: #faf9f6;
            color: #1a1a1a;
            font-family: 'Cormorant Garamond', Georgia, serif;
            -webkit-font-smoothing: antialiased;
          }

          /* --- Loading --- */
          .docs-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .docs-loading-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #c17c5f;
            animation: docs-pulse 1.2s ease-in-out infinite;
          }
          @keyframes docs-pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }

          /* --- Password Gate --- */
          .docs-gate {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
          }
          .docs-gate-inner {
            text-align: center;
            max-width: 360px;
            width: 100%;
          }
          .docs-gate-brand {
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 0.7rem;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: #a09890;
            margin-bottom: 2.5rem;
          }
          .docs-gate-title {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-weight: 300;
            font-size: 2.4rem;
            line-height: 1.15;
            color: #1a1a1a;
            margin: 0 0 0.75rem;
          }
          .docs-gate-sub {
            font-size: 1.1rem;
            color: #8a8580;
            margin-bottom: 2.5rem;
            font-style: italic;
          }
          .docs-gate-form {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .docs-gate-input-wrap {
            width: 100%;
          }
          .docs-gate-input {
            width: 100%;
            padding: 0.85rem 1rem;
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 1.05rem;
            color: #1a1a1a;
            background: transparent;
            border: 1px solid #ddd8d2;
            border-radius: 0;
            outline: none;
            text-align: center;
            letter-spacing: 0.15em;
            transition: border-color 0.3s ease;
          }
          .docs-gate-input::placeholder {
            color: #c0bbb5;
            letter-spacing: 0.1em;
          }
          .docs-gate-input:focus {
            border-color: #a09890;
          }
          .docs-gate-error {
            font-size: 0.85rem;
            color: #c17c5f;
            margin: 0;
          }
          .docs-gate-btn {
            font-family: 'Montserrat', sans-serif;
            font-weight: 500;
            font-size: 0.7rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #c17c5f;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem 0;
            position: relative;
            transition: color 0.3s ease;
          }
          .docs-gate-btn::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 1px;
            background: #c17c5f;
            transform: scaleX(0.4);
            transition: transform 0.3s ease;
          }
          .docs-gate-btn:hover::after {
            transform: scaleX(1);
          }

          /* Shake animation */
          .docs-shake {
            animation: docs-shake-anim 0.4s ease;
          }
          @keyframes docs-shake-anim {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
          }
        `}</style>
      </div>
    );
  }

  // Authenticated — render docs content
  return (
    <div className="docs-shell">
      {children}

      <style jsx global>{`
        /* ========================================
           DOCS AREA — BALO-INSPIRED MINIMAL STYLE
           ======================================== */

        .docs-shell {
          min-height: 100vh;
          background: #faf9f6;
          color: #1a1a1a;
          font-family: 'Cormorant Garamond', Georgia, serif;
          -webkit-font-smoothing: antialiased;
        }

        /* --- Top Bar --- */
        .docs-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 3rem;
          border-bottom: 1px solid #e8e4df;
        }
        .docs-topbar-brand {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #a09890;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .docs-topbar-brand:hover {
          color: #1a1a1a;
        }
        .docs-topbar-nav {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .docs-topbar-link {
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #a09890;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .docs-topbar-link:hover {
          color: #1a1a1a;
        }

        /* --- Hub Page --- */
        .docs-hub-list {
          max-width: 640px;
          margin: 0 auto;
          padding: 4rem 2rem 6rem;
        }
        .docs-hub-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 3.2rem;
          color: #1a1a1a;
          margin: 0 0 3.5rem;
        }
        @media (max-width: 540px) {
          .docs-hub-list { padding: 2.5rem 1.5rem 4rem; }
          .docs-hub-title { font-size: 2.4rem; margin-bottom: 2.5rem; }
        }

        /* --- Month Groups --- */
        .docs-month-group {
          margin-bottom: 2.5rem;
        }
        .docs-month-label {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #a09890;
          margin: 0 0 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e8e4df;
        }

        /* --- Doc Entries --- */
        .docs-entries {
          display: flex;
          flex-direction: column;
        }
        .docs-entry {
          display: flex;
          align-items: baseline;
          gap: 1.5rem;
          padding: 1rem 0;
          border-bottom: 1px solid #f0ece7;
          text-decoration: none;
          color: #1a1a1a;
          transition: all 0.25s ease;
        }
        .docs-entry:last-child {
          border-bottom: none;
        }
        .docs-entry:hover {
          padding-left: 0.5rem;
        }
        .docs-entry:hover .docs-entry-title {
          color: #c17c5f;
        }
        .docs-entry-date {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.05em;
          color: #b0aaa4;
          min-width: 52px;
          flex-shrink: 0;
          padding-top: 0.15rem;
        }
        .docs-entry-body {
          flex: 1;
          min-width: 0;
        }
        .docs-entry-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.2rem;
          line-height: 1.3;
          display: block;
          transition: color 0.25s ease;
        }
        .docs-entry-sub {
          font-size: 0.95rem;
          color: #8a8580;
          font-style: italic;
          display: block;
          margin-top: 0.15rem;
        }
        .docs-entry-cat {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.5rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c17c5f;
          flex-shrink: 0;
          padding-top: 0.2rem;
        }
        @media (max-width: 540px) {
          .docs-entry { gap: 1rem; }
          .docs-entry-date { min-width: 44px; }
          .docs-entry-cat { display: none; }
        }

        /* --- Document Page --- */
        .docs-article {
          max-width: 640px;
          margin: 0 auto;
          padding: 4rem 2rem 6rem;
        }
        .docs-article-cat {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c17c5f;
          margin-bottom: 1.5rem;
        }
        .docs-article-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 2.8rem;
          line-height: 1.15;
          color: #1a1a1a;
          margin: 0 0 0.5rem;
        }
        .docs-article-date {
          font-size: 0.95rem;
          color: #a09890;
          font-style: italic;
          margin-bottom: 3rem;
        }
        .docs-article-body {
          font-size: 1.15rem;
          line-height: 1.85;
          color: #2a2a2a;
        }
        .docs-article-body h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.5rem;
          margin: 2.5rem 0 1rem;
          color: #1a1a1a;
        }
        .docs-article-body p {
          margin: 0 0 1.25rem;
        }
        .docs-article-body ul,
        .docs-article-body ol {
          margin: 0 0 1.25rem;
          padding-left: 1.5rem;
        }
        .docs-article-body li {
          margin-bottom: 0.5rem;
        }
        .docs-article-body code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.85em;
          background: #f0ece7;
          padding: 0.15em 0.4em;
          border-radius: 2px;
          color: #5a5550;
        }
        .docs-article-body em {
          color: #6a6560;
        }
        .docs-article-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #a09890;
          text-decoration: none;
          margin-bottom: 3rem;
          transition: color 0.3s ease;
        }
        .docs-article-back:hover {
          color: #1a1a1a;
        }

        /* --- Footer --- */
        .docs-footer {
          text-align: center;
          padding: 2rem;
          border-top: 1px solid #e8e4df;
        }
        .docs-footer-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          color: #c0bbb5;
        }

        /* --- Loading --- */
        .docs-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .docs-loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c17c5f;
          animation: docs-pulse 1.2s ease-in-out infinite;
        }
        @keyframes docs-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
