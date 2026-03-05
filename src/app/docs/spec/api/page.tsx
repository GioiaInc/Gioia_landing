'use client';

import Link from 'next/link';
import { useState } from 'react';

const API_BASE = 'https://gioia-archive-v2.fly.dev';

const SKILL_MD = `# belo Spec API — Agent Skill

You have access to the belo product specification via the GIOIA Spec API. Use it to read, search, edit, and ask questions about the spec.

## Authentication

All requests require the API key:
\`\`\`
X-Api-Key: <YOUR_API_KEY>
\`\`\`
Or as a Bearer token:
\`\`\`
Authorization: Bearer <YOUR_API_KEY>
\`\`\`

## Base URL

\`${API_BASE}\`

## Endpoints

### Read the full spec
\`\`\`
GET /api/spec
\`\`\`
Returns raw markdown. Add \`?format=json\` for structured response with title, markdown, sections list, and updated_at.

### List all sections
\`\`\`
GET /api/spec/sections
\`\`\`
Returns array of \`{ level, title }\` for every heading.

### Read a specific section
\`\`\`
GET /api/spec/section/:heading
\`\`\`
URL-encode the heading text. Add \`?format=json\` for JSON. Examples:
- \`/api/spec/section/Monetization\`
- \`/api/spec/section/Digital%20Twin\`
- \`/api/spec/section/Golden%20Circle\`

### AI Edit
\`\`\`
POST /api/spec/edit
Content-Type: application/json

{
  "instruction": "Add a note about end-to-end encryption in the Privacy section",
  "section": "Privacy & Consent",       // optional — scopes the edit
  "source_label": "My Agent Name"       // optional — shows in audit log
}
\`\`\`
The AI will apply the edit and return \`{ ok, diff_summary, updated_at }\`.

### Direct Markdown Replace
\`\`\`
POST /api/spec/edit
Content-Type: application/json

{
  "markdown": "# Full updated markdown...",
  "instruction": "Rewrote section 5",   // description for audit log
  "source_label": "My Agent Name"
}
\`\`\`

### Ask a Question
\`\`\`
POST /api/spec/ask
Content-Type: application/json

{
  "question": "What are the open questions about the Golden Circle?"
}
\`\`\`
Returns \`{ answer }\` — a concise AI-generated answer referencing the spec.

### View Edit History
\`\`\`
GET /api/spec/history?limit=50&offset=0
\`\`\`
Returns \`{ edits, total, limit, offset }\`. Each edit has: id, source, source_label, action, instruction, diff_summary, created_at.

### Revert to Previous Version
\`\`\`
POST /api/spec/revert/:edit_id
\`\`\`

## Tips for Agents

1. **Read before editing.** Always \`GET /api/spec/section/:heading\` first to understand current content.
2. **Scope your edits.** Include the \`section\` field when editing — it's faster and safer.
3. **Label yourself.** Set \`source_label\` so your edits show up clearly in the audit log.
4. **Use ask for research.** The \`/ask\` endpoint is great for understanding the spec without parsing markdown.
5. **Check history.** After editing, verify your change in \`/api/spec/history\`.
`;

export default function SpecApiPage() {
  const [copied, setCopied] = useState(false);

  const copySkillMd = () => {
    navigator.clipboard.writeText(SKILL_MD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Render the skill.md as HTML
  function renderSkillHtml() {
    let html = SKILL_MD
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="api-code"><code>$2</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="api-inline">$1</code>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // H3
    html = html.replace(/^### (.+)$/gm, '<h3 class="api-h3">$1</h3>');
    // H2
    html = html.replace(/^## (.+)$/gm, '<h2 class="api-h2">$1</h2>');
    // H1
    html = html.replace(/^# (.+)$/gm, '<h1 class="api-h1">$1</h1>');
    // Lists
    html = html.replace(/(^|\n)(\d+\. .+(?:\n\d+\. .+)*)/g, (_, pre, block) => {
      const items = block.split('\n').map((l: string) => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
      return `${pre}<ol class="api-ol">${items}</ol>`;
    });
    html = html.replace(/(^|\n)(- .+(?:\n- .+)*)/g, (_, pre, block) => {
      const items = block.split('\n').map((l: string) => `<li>${l.replace(/^- /, '')}</li>`).join('');
      return `${pre}<ul class="api-ul">${items}</ul>`;
    });
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-3]|<pre|<ul|<ol)/g, '$1');
    html = html.replace(/(<\/h[1-3]>|<\/pre>|<\/ul>|<\/ol>)<\/p>/g, '$1');
    return html;
  }

  return (
    <>
      <nav className="docs-topbar">
        <Link href="/docs" className="docs-topbar-brand">GIOIA Docs</Link>
        <div className="docs-topbar-nav">
          <Link href="/docs/spec" className="docs-topbar-link">Spec</Link>
          <Link href="/docs/spec/history" className="docs-topbar-link">History</Link>
          <Link href="/docs/spec/api" className="docs-topbar-link" style={{ color: '#c17c5f' }}>API</Link>
          <Link href="/docs" className="docs-topbar-link">Docs</Link>
          <Link href="/" className="docs-topbar-link">Home</Link>
        </div>
      </nav>

      <div className="docs-article" style={{ paddingBottom: '4rem' }}>
        <Link href="/docs/spec" className="docs-article-back">&larr; Back to Spec</Link>

        <p className="docs-article-cat">Agent Integration</p>
        <h1 className="docs-article-title">Spec API</h1>
        <p className="docs-article-date">
          Give this to any AI agent so it can read, edit, and query the belo spec.
        </p>

        <button className="api-copy-btn" onClick={copySkillMd}>
          {copied ? 'Copied!' : 'Copy as skill.md'}
        </button>

        <div
          className="docs-article-body api-body"
          dangerouslySetInnerHTML={{ __html: renderSkillHtml() }}
        />
      </div>

      <style jsx>{`
        .api-copy-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #fff;
          background: #c17c5f;
          border: none;
          border-radius: 100px;
          padding: 0.55rem 1.3rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 2.5rem;
        }
        .api-copy-btn:hover {
          background: #a8694f;
        }
      `}</style>

      <style jsx global>{`
        .api-body {
          font-size: 1.05rem;
          line-height: 1.75;
        }
        .api-h1 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 1.8rem;
          color: #1a1a1a;
          margin: 2rem 0 1rem;
        }
        .api-h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.35rem;
          color: #1a1a1a;
          margin: 2.5rem 0 0.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid #e8e4df;
        }
        .api-h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.1rem;
          color: #3a3530;
          margin: 1.75rem 0 0.5rem;
        }
        .api-code {
          background: #1a1a1a;
          color: #e8e4df;
          padding: 1rem 1.25rem;
          border-radius: 6px;
          overflow-x: auto;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.8rem;
          line-height: 1.6;
          margin: 0.75rem 0 1.25rem;
        }
        .api-inline {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.82em;
          background: #f0ece7;
          padding: 0.15em 0.45em;
          border-radius: 3px;
          color: #c17c5f;
        }
        .api-ul, .api-ol {
          margin: 0.5rem 0 1.25rem;
          padding-left: 1.5rem;
        }
        .api-ul li, .api-ol li {
          margin-bottom: 0.4rem;
        }
      `}</style>
    </>
  );
}
