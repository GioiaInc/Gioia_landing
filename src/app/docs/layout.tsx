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
        .docs-hub {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 60px);
          padding: 4rem 2rem;
        }
        .docs-hub-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 3.2rem;
          color: #1a1a1a;
          margin: 0 0 1rem;
        }
        .docs-hub-sub {
          font-size: 1.15rem;
          color: #8a8580;
          font-style: italic;
          margin-bottom: 5rem;
        }

        /* --- Circular Selector --- */
        .docs-orbit {
          position: relative;
          width: 420px;
          height: 420px;
        }
        @media (max-width: 640px) {
          .docs-orbit {
            width: 300px;
            height: 300px;
          }
        }
        .docs-orbit-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ddd8d2;
        }
        .docs-orbit-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 280px;
          height: 280px;
          border-radius: 50%;
          border: 1px solid #ece8e3;
        }
        @media (max-width: 640px) {
          .docs-orbit-ring {
            width: 200px;
            height: 200px;
          }
        }
        .docs-orbit-item {
          position: absolute;
          top: 50%;
          left: 50%;
          text-decoration: none;
          color: #1a1a1a;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .docs-orbit-item-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.2rem 1.5rem;
          background: #faf9f6;
          border: 1px solid transparent;
          border-radius: 2px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 130px;
        }
        .docs-orbit-item:hover .docs-orbit-item-inner {
          border-color: #e8e4df;
          background: #f5f2ee;
        }
        .docs-orbit-item-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.1rem;
          line-height: 1.3;
          margin-bottom: 0.25rem;
        }
        .docs-orbit-item-sub {
          font-size: 0.85rem;
          color: #a09890;
          font-style: italic;
        }
        .docs-orbit-item-cat {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c17c5f;
          margin-top: 0.5rem;
        }

        /* --- Mobile: stack vertically --- */
        .docs-list-mobile {
          display: none;
          flex-direction: column;
          gap: 1px;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        .docs-list-mobile-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.4rem 0;
          border-bottom: 1px solid #ece8e3;
          text-decoration: none;
          color: #1a1a1a;
          transition: opacity 0.3s ease;
        }
        .docs-list-mobile-item:first-child {
          border-top: 1px solid #ece8e3;
        }
        .docs-list-mobile-item:hover {
          opacity: 0.65;
        }
        .docs-list-mobile-title {
          font-weight: 500;
          font-size: 1.15rem;
        }
        .docs-list-mobile-cat {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c17c5f;
        }

        @media (max-width: 540px) {
          .docs-orbit { display: none; }
          .docs-list-mobile { display: flex; }
          .docs-hub-title { font-size: 2.4rem; }
          .docs-hub { padding: 3rem 1.5rem; min-height: auto; }
          .docs-hub-sub { margin-bottom: 2.5rem; }
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
