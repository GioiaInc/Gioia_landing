'use client';

import { useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';

type PageWidth = 'narrow' | 'default' | 'wide' | 'full';

const PAGE_WIDTH_LABELS: Record<PageWidth, string> = {
  narrow: 'Narrow',
  default: 'Default',
  wide: 'Wide',
  full: 'Full',
};

interface EditorToolbarProps {
  editor: Editor | null;
  saving: 'saved' | 'saving' | 'unsaved';
  rightPanelOpen: boolean;
  onTogglePanel: () => void;
  onSave: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  pageWidth: PageWidth;
  onPageWidthChange: (width: PageWidth) => void;
}

export type { PageWidth };

export default function EditorToolbar({
  editor,
  saving,
  rightPanelOpen,
  onTogglePanel,
  onSave,
  onExportPDF,
  onExportDOCX,
  zoom,
  onZoomChange,
  pageWidth,
  onPageWidthChange,
}: EditorToolbarProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [widthOpen, setWidthOpen] = useState(false);

  const btn = useCallback(
    (
      label: string,
      command: () => void,
      isActive: boolean
    ) => (
      <button
        className={`spec-toolbar-btn${isActive ? ' spec-toolbar-btn-active' : ''}`}
        onClick={command}
        title={label}
      >
        {label}
      </button>
    ),
    []
  );

  if (!editor) return null;

  return (
    <div className="spec-toolbar">
      {btn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {btn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      {btn('U', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}

      <div className="spec-toolbar-divider" />

      {btn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
      {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
      {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}

      <div className="spec-toolbar-divider" />

      {btn('\u2022', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
      {btn('1.', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      {btn('\u201C', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
      {btn('<>', () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'))}

      <div className="spec-toolbar-divider" />

      {/* Zoom controls */}
      <button
        className="spec-toolbar-btn"
        onClick={() => onZoomChange(Math.max(50, zoom - 10))}
        title="Zoom out"
      >
        &minus;
      </button>
      <button
        className="spec-toolbar-zoom-label"
        onClick={() => onZoomChange(100)}
        title="Reset zoom"
      >
        {zoom}%
      </button>
      <button
        className="spec-toolbar-btn"
        onClick={() => onZoomChange(Math.min(200, zoom + 10))}
        title="Zoom in"
      >
        +
      </button>

      <div className="spec-toolbar-divider" />

      {/* Page width picker */}
      <div className="spec-toolbar-dropdown">
        <button
          className="spec-toolbar-width-btn"
          onClick={() => setWidthOpen(!widthOpen)}
          onBlur={() => setTimeout(() => setWidthOpen(false), 150)}
          title="Page width"
        >
          <span className="spec-toolbar-width-icon" />
          {PAGE_WIDTH_LABELS[pageWidth]}
        </button>
        {widthOpen && (
          <div className="spec-toolbar-dropdown-menu">
            {(Object.keys(PAGE_WIDTH_LABELS) as PageWidth[]).map((w) => (
              <button
                key={w}
                className={`spec-toolbar-dropdown-item${pageWidth === w ? ' spec-toolbar-dropdown-item-active' : ''}`}
                onMouseDown={() => { onPageWidthChange(w); setWidthOpen(false); }}
              >
                {PAGE_WIDTH_LABELS[w]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="spec-toolbar-spacer" />

      <div className="spec-toolbar-save">
        <span
          className={`spec-toolbar-save-dot${
            saving === 'saving'
              ? ' spec-toolbar-save-dot-saving'
              : saving === 'unsaved'
              ? ' spec-toolbar-save-dot-unsaved'
              : ''
          }`}
        />
        {saving === 'saving' ? 'Saving...' : saving === 'unsaved' ? 'Unsaved' : 'Saved'}
      </div>

      <div className="spec-toolbar-dropdown">
        <button
          className="spec-toolbar-btn"
          onClick={() => setDownloadOpen(!downloadOpen)}
          onBlur={() => setTimeout(() => setDownloadOpen(false), 150)}
          title="Download"
        >
          &#8595;
        </button>
        {downloadOpen && (
          <div className="spec-toolbar-dropdown-menu">
            <button className="spec-toolbar-dropdown-item" onMouseDown={onExportPDF}>
              Download PDF
            </button>
            <button className="spec-toolbar-dropdown-item" onMouseDown={onExportDOCX}>
              Download DOCX
            </button>
          </div>
        )}
      </div>

      <button
        className={`spec-toolbar-ai-btn${rightPanelOpen ? ' spec-toolbar-ai-btn-open' : ''}`}
        onClick={onTogglePanel}
      >
        AI
      </button>
    </div>
  );
}
