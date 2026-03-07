'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { getSpec, saveSpec, type SpecData } from '@/lib/spec-api';
import Topbar from './components/Topbar';
import EditorToolbar from './components/EditorToolbar';
import TiptapEditor, { type TiptapEditorHandle } from './components/TiptapEditor';
import LeftSidebar from './components/LeftSidebar';
import RightPanel from './components/RightPanel';
import type { Editor } from '@tiptap/react';
import './spec-editor.css';

type PanelTab = 'ai-edit' | 'ask' | 'history';

function getEditorMarkdown(editor: Editor): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (editor.storage as any).markdown?.getMarkdown?.() || '';
}

export default function SpecEditor() {
  const [spec, setSpec] = useState<SpecData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<PanelTab>('ai-edit');
  const [saving, setSaving] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [toast, setToast] = useState<string | null>(null);
  const [currentMarkdown, setCurrentMarkdown] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);

  const editorRef = useRef<TiptapEditorHandle>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressAutoSaveRef = useRef(false);

  useEffect(() => {
    getSpec()
      .then((data) => {
        setSpec(data);
        setCurrentMarkdown(data.markdown);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const doSave = useCallback(async (md: string) => {
    setSaving('saving');
    try {
      await saveSpec(md);
      setSaving('saved');
      showToast('Saved');
    } catch {
      setSaving('unsaved');
      showToast('Save failed');
    }
  }, [showToast]);

  const handleEditorUpdate = useCallback(
    (ed: Editor) => {
      if (suppressAutoSaveRef.current) return;

      const md = getEditorMarkdown(ed);
      setCurrentMarkdown(md);
      setSaving('unsaved');

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => doSave(md), 3000);
    },
    [doSave]
  );

  const handleEditorReady = useCallback((ed: Editor) => {
    setEditor(ed);
  }, []);

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const ed = editorRef.current?.getEditor();
        if (ed) {
          const md = getEditorMarkdown(ed);
          doSave(md);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [doSave]);

  const handleSpecUpdated = useCallback(async () => {
    try {
      const updated = await getSpec();
      setSpec(updated);
      setCurrentMarkdown(updated.markdown);
      const ed = editorRef.current?.getEditor();
      if (ed) {
        // Suppress auto-save since content is already saved server-side
        suppressAutoSaveRef.current = true;
        ed.commands.setContent(updated.markdown);
        suppressAutoSaveRef.current = false;
        setSaving('saved');
      }
    } catch {
      showToast('Failed to refresh');
    }
  }, [showToast]);

  const handleExportPDF = useCallback(async () => {
    const ed = editorRef.current?.getEditor();
    if (!ed) return;

    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = ed.getHTML();
    wrapper.style.fontFamily = "'Cormorant Garamond', Georgia, serif";
    wrapper.style.fontSize = '12pt';
    wrapper.style.lineHeight = '1.7';
    wrapper.style.color = '#1a1a1a';
    wrapper.style.padding = '2rem';

    html2pdf()
      .set({
        margin: [0.75, 0.75],
        filename: `${spec?.title || 'spec'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      })
      .from(wrapper)
      .save();
  }, [spec?.title]);

  const handleExportDOCX = useCallback(() => {
    const ed = editorRef.current?.getEditor();
    if (!ed) return;

    const html = ed.getHTML();
    const docContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8">
      <style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.7;color:#1a1a1a;}</style>
      </head><body>${html}</body></html>`;

    const blob = new Blob([docContent], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spec?.title || 'spec'}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [spec?.title]);

  const handleManualSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const ed = editorRef.current?.getEditor();
    if (ed) {
      const md = getEditorMarkdown(ed);
      doSave(md);
    }
  }, [doSave]);

  if (loading) {
    return (
      <>
        <Topbar />
        <div className="spec-loading">
          <div className="spec-loading-dot" />
        </div>
      </>
    );
  }

  if (!spec) {
    return (
      <>
        <Topbar />
        <div style={{ maxWidth: 720, margin: '4rem auto', padding: '0 2rem' }}>
          <Link href="/docs" style={{ color: '#c17c5f' }}>&larr; Back</Link>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", marginTop: '2rem' }}>
            Spec Not Found
          </h1>
          <p style={{ color: '#8a8580', fontStyle: 'italic' }}>
            The product specification has not been initialized yet.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar />

      <div className="spec-editor-root">
        <LeftSidebar editor={editor} />

        <div className="spec-center">
          <EditorToolbar
            editor={editor}
            saving={saving}
            rightPanelOpen={rightPanelOpen}
            onTogglePanel={() => setRightPanelOpen(!rightPanelOpen)}
            onSave={handleManualSave}
            onExportPDF={handleExportPDF}
            onExportDOCX={handleExportDOCX}
          />

          <TiptapEditor
            ref={editorRef}
            markdown={currentMarkdown}
            onUpdate={handleEditorUpdate}
            onReady={handleEditorReady}
            busy={saving === 'saving'}
          />
        </div>

        <RightPanel
          open={rightPanelOpen}
          tab={rightPanelTab}
          onTabChange={setRightPanelTab}
          onClose={() => setRightPanelOpen(false)}
          onSpecUpdated={handleSpecUpdated}
          onToast={showToast}
        />
      </div>

      {toast && (
        <div className="spec-toast">
          <span className="spec-toast-icon">&#10003;</span>
          {toast}
        </div>
      )}
    </>
  );
}
