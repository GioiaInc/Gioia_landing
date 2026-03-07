'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Markdown } from 'tiptap-markdown';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { Editor } from '@tiptap/react';

interface TiptapEditorProps {
  markdown: string;
  onUpdate?: (editor: Editor) => void;
  onReady?: (editor: Editor) => void;
  busy?: boolean;
}

export interface TiptapEditorHandle {
  getEditor: () => Editor | null;
}

const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(
  function TiptapEditor({ markdown, onUpdate, onReady, busy }, ref) {
    const onUpdateRef = useRef(onUpdate);
    onUpdateRef.current = onUpdate;

    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Underline,
        Placeholder.configure({
          placeholder: 'Start writing your spec...',
        }),
        Markdown.configure({
          html: false,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: markdown,
      immediatelyRender: false,
      onUpdate: ({ editor: ed }) => {
        onUpdateRef.current?.(ed as Editor);
      },
      onCreate: ({ editor: ed }) => {
        onReadyRef.current?.(ed as Editor);
      },
    });

    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
    }));

    useEffect(() => {
      if (editor && markdown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentMd = (editor.storage as any).markdown?.getMarkdown?.() || '';
        if (currentMd.trim() !== markdown.trim()) {
          editor.commands.setContent(markdown);
        }
      }
    }, [editor, markdown]);

    return (
      <div className={`spec-paper${busy ? ' spec-paper-busy' : ''}`}>
        <EditorContent editor={editor} />
      </div>
    );
  }
);

export default TiptapEditor;
