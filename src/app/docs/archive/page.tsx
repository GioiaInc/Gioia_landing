'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { streamChat, getChatHistory, getSessionId, type ChatMessage } from '@/lib/archive-api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

let msgCounter = 0;
function nextMsgId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

function renderMarkdown(text: string): string {
  if (!text) return '';
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (``` ... ```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Headings (###, ##, #)
    .replace(/^### (.+)$/gm, '<strong style="font-size:1.05em">$1</strong>')
    .replace(/^## (.+)$/gm, '<strong style="font-size:1.1em">$1</strong>')
    .replace(/^# (.+)$/gm, '<strong style="font-size:1.15em">$1</strong>');

  // Unordered lists
  html = html.replace(/(^|\n)([-*] .+(?:\n[-*] .+)*)/g, (_, pre, block) => {
    const items = block.split('\n').map((line: string) =>
      `<li>${line.replace(/^[-*] /, '')}</li>`
    ).join('');
    return `${pre}<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/(^|\n)(\d+\. .+(?:\n\d+\. .+)*)/g, (_, pre, block) => {
    const items = block.split('\n').map((line: string) =>
      `<li>${line.replace(/^\d+\. /, '')}</li>`
    ).join('');
    return `${pre}<ol>${items}</ol>`;
  });

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p>');
  // Single newlines to <br>
  html = html.replace(/\n/g, '<br>');

  return html;
}

export default function ArchiveChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string>('');

  // Load session + history on mount
  useEffect(() => {
    const sid = getSessionId();
    sessionIdRef.current = sid;

    getChatHistory(sid)
      .then((history) => {
        if (history.length > 0) {
          setMessages(history.map((m) => ({ ...m, id: nextMsgId() })));
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Track visual viewport for mobile keyboard
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const vv = window.visualViewport;
    const onResize = () => {
      const offset = window.innerHeight - vv.height;
      setKeyboardOffset(offset > 50 ? offset : 0);
    };

    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isStreaming) return;

      setInput('');
      const userMsg: Message = { id: nextMsgId(), role: 'user', content: text };
      const assistantMsg: Message = { id: nextMsgId(), role: 'assistant', content: '' };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        for await (const chunk of streamChat(text, sessionIdRef.current)) {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + chunk };
            }
            return updated;
          });
        }
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            const errText = err instanceof Error ? err.message : 'Something went wrong';
            updated[updated.length - 1] = {
              ...last,
              content: last.content ? last.content + `\n\n[Error: ${errText}]` : `Error: ${errText}`,
            };
          }
          return updated;
        });
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [input, isStreaming]
  );

  const handleNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    localStorage.setItem('gioia-archive-session', newId);
    sessionIdRef.current = newId;
    setMessages([]);
    inputRef.current?.focus();
  }, []);

  if (isLoading) {
    return (
      <>
        <nav className="docs-topbar">
          <Link href="/docs" className="docs-topbar-brand">GIOIA Docs</Link>
          <div className="docs-topbar-nav">
            <Link href="/docs/archive/upload" className="docs-topbar-link">Upload</Link>
            <Link href="/" className="docs-topbar-link">Home</Link>
          </div>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 65px)' }}>
          <div className="docs-loading-dot" />
        </div>
      </>
    );
  }

  // Is the last message an in-progress assistant response?
  const lastMsg = messages[messages.length - 1];
  const showCursorForId = isStreaming && lastMsg?.role === 'assistant' ? lastMsg.id : null;

  return (
    <>
      <nav className="docs-topbar">
        <Link href="/docs" className="docs-topbar-brand">GIOIA Docs</Link>
        <div className="docs-topbar-nav">
          {messages.length > 0 && (
            <button onClick={handleNewChat} className="chat-new-btn">
              New Chat
            </button>
          )}
          <Link href="/docs/archive/upload" className="docs-topbar-link">Upload</Link>
          <Link href="/" className="docs-topbar-link">Home</Link>
        </div>
      </nav>

      <div className="chat-page">
        <div className="chat-messages" role="log" aria-live="polite">
          {messages.length === 0 && (
            <div className="chat-empty">
              <p className="chat-empty-text">Ask anything about your documents</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.role === 'user' ? 'chat-msg chat-msg-user' : 'chat-msg chat-msg-assistant'}
            >
              <div
                className={msg.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-assistant'}
              >
                {msg.role === 'assistant' ? (
                  <>
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    {showCursorForId === msg.id && <span className="chat-cursor" />}
                  </>
                ) : (
                  <>
                    {msg.content}
                    {showCursorForId === msg.id && <span className="chat-cursor" />}
                  </>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div
          className="chat-input-area"
          style={keyboardOffset > 0 ? { bottom: keyboardOffset } : undefined}
        >
          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your documents…"
              className="chat-input"
              disabled={isStreaming}
              autoFocus
            />
          </form>
        </div>
      </div>

      <style jsx global>{`
        .docs-topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #faf9f6;
        }

        .chat-page {
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 65px);
          position: relative;
        }

        .chat-messages {
          flex: 1;
          max-width: 820px;
          width: 100%;
          margin: 0 auto;
          padding: 2rem 1.5rem 120px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .chat-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
        }

        .chat-empty-text {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.2rem;
          font-style: italic;
          color: #b0aaa4;
        }

        .chat-msg {
          display: flex;
        }

        .chat-msg-user {
          justify-content: flex-end;
        }

        .chat-msg-assistant {
          justify-content: flex-start;
        }

        .chat-bubble {
          max-width: 85%;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.1rem;
          line-height: 1.7;
          color: #1a1a1a;
          word-break: break-word;
        }

        .chat-bubble-user {
          white-space: pre-wrap;
          background: #f0ece7;
          padding: 0.75rem 1.15rem;
          border-radius: 18px 18px 4px 18px;
        }

        .chat-bubble-assistant {
          padding: 0.75rem 0;
        }

        .chat-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #c17c5f;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: chat-blink 1s step-end infinite;
        }

        @keyframes chat-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .chat-new-btn {
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #a09890;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.3s ease;
        }
        .chat-new-btn:hover {
          color: #1a1a1a;
        }

        .chat-input-area {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          padding: 1.25rem 1.5rem calc(2rem + env(safe-area-inset-bottom, 0px));
          background: linear-gradient(transparent, #faf9f6 30%);
          pointer-events: none;
          transition: bottom 0.15s ease;
        }

        .chat-input-form {
          max-width: 700px;
          width: 100%;
          pointer-events: auto;
        }

        .chat-input {
          width: 100%;
          padding: 0.85rem 1.5rem;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.05rem;
          color: #1a1a1a;
          background: #fff;
          border: 1px solid #e8e4df;
          border-radius: 100px;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .chat-input::placeholder {
          color: #c0bbb5;
          font-style: italic;
        }

        .chat-input:focus {
          border-color: #c17c5f;
          box-shadow: 0 2px 16px rgba(193, 124, 95, 0.1);
        }

        .chat-input:disabled {
          opacity: 0.6;
        }

        /* Markdown styles in assistant messages */
        .chat-bubble-assistant pre {
          background: #f0ece7;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          overflow-x: auto;
          margin: 0.5rem 0;
          font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .chat-bubble-assistant pre code {
          font-family: inherit;
          font-size: inherit;
        }

        .chat-inline-code {
          background: #f0ece7;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace;
          font-size: 0.88em;
        }

        .chat-bubble-assistant strong {
          font-weight: 700;
        }

        .chat-bubble-assistant em {
          font-style: italic;
        }

        .chat-bubble-assistant a {
          color: #c17c5f;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .chat-bubble-assistant a:hover {
          color: #a0624a;
        }

        .chat-bubble-assistant ul,
        .chat-bubble-assistant ol {
          margin: 0.4rem 0;
          padding-left: 1.5rem;
        }

        .chat-bubble-assistant li {
          margin-bottom: 0.2rem;
        }

        .chat-bubble-assistant p {
          margin: 0.4rem 0;
        }

        @media (max-width: 540px) {
          .chat-messages {
            padding: 1.5rem 1rem 120px;
          }
          .chat-bubble {
            font-size: 1rem;
            max-width: 90%;
          }
          .chat-input-area {
            padding: 1rem 1rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>
    </>
  );
}
