'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { uploadFile, uploadUrl, getDocumentStatus } from '@/lib/archive-api';

type UploadState = 'idle' | 'dragging' | 'uploading' | 'processing' | 'done' | 'error';

export default function UploadPage() {
  const [state, setState] = useState<UploadState>('idle');
  const [title, setTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pollStatus = useCallback(async (id: number, fallbackName: string) => {
    setState('processing');
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const status = await getDocumentStatus(id);

      if (status.status === 'ready') {
        setTitle(status.title || fallbackName);
        setState('done');
        return;
      }
      if (status.status === 'error') {
        setErrorMsg(status.summary || 'Processing failed');
        setState('error');
        return;
      }
    }
    setErrorMsg('Processing timed out');
    setState('error');
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setState('uploading');
    setErrorMsg('');

    try {
      const { id } = await uploadFile(file);
      pollStatus(id, file.name);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  }, [pollStatus]);

  const handleUrl = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;

    setState('uploading');
    setErrorMsg('');

    try {
      const { id } = await uploadUrl(url);
      setUrlInput('');
      pollStatus(id, url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  }, [urlInput, pollStatus]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState('idle');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((s) => (s === 'idle' ? 'dragging' : s));
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((s) => (s === 'dragging' ? 'idle' : s));
  }, []);

  const onClick = useCallback(() => {
    if (state === 'idle' || state === 'done' || state === 'error') {
      fileInputRef.current?.click();
    }
  }, [state]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  const circleClass = [
    'upload-circle',
    state === 'dragging' && 'upload-circle-dragging',
    state === 'uploading' && 'upload-circle-uploading',
    state === 'processing' && 'upload-circle-processing',
    state === 'done' && 'upload-circle-done',
    state === 'error' && 'upload-circle-error',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <nav className="docs-topbar">
        <Link href="/docs" className="docs-topbar-brand">
          GIOIA Docs
        </Link>
        <div className="docs-topbar-nav">
          <Link href="/docs/archive" className="docs-topbar-link">
            Archive
          </Link>
          <Link href="/" className="docs-topbar-link">
            Home
          </Link>
        </div>
      </nav>

      <div className="upload-page">
        <div
          className={circleClass}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={onClick}
        >
          {state === 'idle' && (
            <>
              <span className="upload-icon">+</span>
              <span className="upload-label">Drop a file here</span>
              <span className="upload-sub">.txt, .md, .pdf, .html</span>
            </>
          )}
          {state === 'dragging' && (
            <span className="upload-label">Drop it</span>
          )}
          {state === 'uploading' && (
            <>
              <span className="upload-dot" />
              <span className="upload-label">Uploading…</span>
            </>
          )}
          {state === 'processing' && (
            <>
              <span className="upload-dot" />
              <span className="upload-label">AI is reading…</span>
            </>
          )}
          {state === 'done' && (
            <>
              <span className="upload-check">&#10003;</span>
              <span className="upload-title">{title}</span>
              <span className="upload-sub">Tap to upload another</span>
            </>
          )}
          {state === 'error' && (
            <>
              <span className="upload-error-icon">!</span>
              <span className="upload-label">{errorMsg}</span>
              <span className="upload-sub">Tap to try again</span>
            </>
          )}
        </div>

        {(state === 'idle' || state === 'done' || state === 'error') && (
          <div className="upload-url-section">
            <span className="upload-url-divider">or paste a URL</span>
            <form
              className="upload-url-form"
              onSubmit={(e) => { e.preventDefault(); handleUrl(); }}
            >
              <input
                type="url"
                className="upload-url-input"
                placeholder="https://…"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button
                type="submit"
                className="upload-url-btn"
                disabled={!urlInput.trim()}
                aria-label="Upload URL"
              >
                &#8594;
              </button>
            </form>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.html,.htm"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <style jsx global>{`
        .upload-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 65px);
          padding: 2rem;
          gap: 1.5rem;
        }

        .upload-circle {
          width: 320px;
          height: 320px;
          border-radius: 50%;
          border: 2px dashed #ddd8d2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          padding: 2rem;
        }

        .upload-circle:hover {
          border-color: #c17c5f;
        }

        .upload-circle-dragging {
          border-color: #c17c5f;
          border-style: solid;
          background: rgba(193, 124, 95, 0.04);
          transform: scale(1.05);
        }

        .upload-circle-uploading,
        .upload-circle-processing {
          border-style: solid;
          border-color: #ddd8d2;
          cursor: default;
          animation: upload-pulse 2s ease-in-out infinite;
        }

        .upload-circle-done {
          border-style: solid;
          border-color: #c17c5f;
          cursor: pointer;
        }

        .upload-circle-error {
          border-style: solid;
          border-color: #d9534f;
          cursor: pointer;
        }

        @keyframes upload-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }

        .upload-icon {
          font-size: 2rem;
          color: #c0bbb5;
          font-weight: 300;
          line-height: 1;
        }

        .upload-label {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.15rem;
          color: #1a1a1a;
          font-style: italic;
        }

        .upload-sub {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #b0aaa4;
        }

        .upload-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c17c5f;
          animation: docs-pulse 1.2s ease-in-out infinite;
        }

        .upload-check {
          font-size: 1.8rem;
          color: #c17c5f;
          line-height: 1;
        }

        .upload-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.3;
        }

        .upload-error-icon {
          font-size: 1.8rem;
          color: #d9534f;
          font-weight: 700;
          line-height: 1;
        }

        .upload-url-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .upload-url-divider {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #b0aaa4;
        }

        .upload-url-form {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1.5px solid #ddd8d2;
          border-radius: 999px;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .upload-url-form:focus-within {
          border-color: #c17c5f;
        }

        .upload-url-input {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.03em;
          border: none;
          outline: none;
          background: transparent;
          padding: 0.55rem 0.9rem;
          width: 240px;
          color: #1a1a1a;
        }

        .upload-url-input::placeholder {
          color: #c0bbb5;
        }

        .upload-url-btn {
          font-size: 1rem;
          background: none;
          border: none;
          color: #c17c5f;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          line-height: 1;
          transition: opacity 0.2s;
        }

        .upload-url-btn:disabled {
          color: #ddd8d2;
          cursor: default;
        }

        .upload-url-btn:not(:disabled):hover {
          opacity: 0.7;
        }

        @media (max-width: 540px) {
          .upload-circle {
            width: 180px;
            height: 180px;
            padding: 1rem;
          }
          .upload-icon { font-size: 1.5rem; }
          .upload-label { font-size: 0.95rem; }
          .upload-title { font-size: 0.9rem; }
        }
      `}</style>
    </>
  );
}
