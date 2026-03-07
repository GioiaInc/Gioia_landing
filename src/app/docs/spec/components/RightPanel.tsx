'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  editSpecAI,
  askSpecAI,
  getSpecHistory,
  revertSpec,
  type SpecEdit,
} from '@/lib/spec-api';

type Tab = 'ai-edit' | 'ask' | 'history';

interface QA {
  question: string;
  answer: string;
}

interface RightPanelProps {
  open: boolean;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  onClose: () => void;
  onSpecUpdated: () => void;
  onToast: (msg: string) => void;
}

export default function RightPanel({
  open,
  tab,
  onTabChange,
  onClose,
  onSpecUpdated,
  onToast,
}: RightPanelProps) {
  const [instruction, setInstruction] = useState('');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [qaHistory, setQaHistory] = useState<QA[]>([]);
  const [history, setHistory] = useState<SpecEdit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await getSpecHistory(20);
      setHistory(data.edits);
    } catch {
      onToast('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    if (open && tab === 'history') {
      loadHistory();
    }
  }, [open, tab, loadHistory]);

  const handleAIEdit = async () => {
    if (!instruction.trim() || busy) return;
    setBusy(true);
    try {
      const result = await editSpecAI(instruction.trim());
      onToast(result.diff_summary || 'Edit applied');
      setInstruction('');
      onSpecUpdated();
    } catch {
      onToast('AI edit failed');
    } finally {
      setBusy(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || busy) return;
    const q = question.trim();
    setBusy(true);
    try {
      const result = await askSpecAI(q);
      setQaHistory((prev) => [{ question: q, answer: result.answer }, ...prev]);
      setQuestion('');
    } catch {
      onToast('Ask failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRevert = async (editId: number) => {
    if (busy) return;
    setBusy(true);
    try {
      await revertSpec(editId);
      onToast('Reverted');
      onSpecUpdated();
      loadHistory();
    } catch {
      onToast('Revert failed');
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      {open && (
        <div
          className="spec-panel-backdrop"
          onClick={onClose}
          style={{ display: 'none' }}
        />
      )}

      <aside className={`spec-right-panel${!open ? ' spec-right-panel-closed' : ''}`}>
        <div className="spec-panel-tabs">
          {(['ai-edit', 'ask', 'history'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`spec-panel-tab${tab === t ? ' spec-panel-tab-active' : ''}`}
              onClick={() => onTabChange(t)}
            >
              {t === 'ai-edit' ? 'AI Edit' : t === 'ask' ? 'Ask' : 'History'}
            </button>
          ))}
        </div>

        <div className="spec-panel-body">
          {tab === 'ai-edit' && (
            <>
              <textarea
                className="spec-panel-instruction"
                placeholder='e.g. "Add a section about encryption"'
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAIEdit)}
                disabled={busy}
              />
              <button
                className="spec-panel-submit"
                onClick={handleAIEdit}
                disabled={busy || !instruction.trim()}
              >
                {busy ? 'Applying...' : 'Apply'}
              </button>
            </>
          )}

          {tab === 'ask' && (
            <>
              <textarea
                className="spec-panel-instruction"
                placeholder='e.g. "How does mood scoring work?"'
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAsk)}
                disabled={busy}
              />
              <button
                className="spec-panel-submit"
                onClick={handleAsk}
                disabled={busy || !question.trim()}
              >
                {busy ? 'Thinking...' : 'Ask'}
              </button>
              <div className="spec-panel-result">
                {qaHistory.map((qa, i) => (
                  <div key={i} className="spec-panel-answer">
                    <div className="spec-panel-answer-question">{qa.question}</div>
                    {qa.answer}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'history' && (
            <div className="spec-panel-result">
              {historyLoading ? (
                <div className="spec-loading"><div className="spec-loading-dot" /></div>
              ) : history.length === 0 ? (
                <p style={{ color: '#a09890', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  No edits yet.
                </p>
              ) : (
                history.map((edit) => (
                  <div key={edit.id} className="spec-panel-history-item">
                    <div className="spec-panel-history-info">
                      <div className="spec-panel-history-action">
                        {edit.source_label || edit.source}
                      </div>
                      <div className="spec-panel-history-detail">
                        {edit.diff_summary || edit.instruction || edit.action}
                      </div>
                      <div className="spec-panel-history-date">
                        {new Date(edit.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <button
                      className="spec-panel-history-revert"
                      onClick={() => handleRevert(edit.id)}
                      disabled={busy}
                    >
                      Revert
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      <style jsx>{`
        @media (max-width: 1100px) {
          .spec-panel-backdrop { display: block !important; }
        }
      `}</style>
    </>
  );
}
