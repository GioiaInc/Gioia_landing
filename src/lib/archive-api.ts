const API_BASE = process.env.NEXT_PUBLIC_ARCHIVE_API || 'http://localhost:3001';
const TOKEN_KEY = 'gioia-docs-token';
const SESSION_KEY = 'gioia-archive-session';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) || '';
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

/** Get or create a session ID stored in localStorage */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export interface ArchiveDocument {
  id: number;
  title: string | null;
  summary: string | null;
  tags: string[];
  slug: string | null;
  status: string;
  original_name: string;
  created_at: string;
}

export interface DocumentPage {
  id: number;
  formatted_html: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  slug: string | null;
  source_html: string | null;
  source_url: string | null;
  created_at: string;
}

export interface DocumentStatus {
  id: number;
  status: string;
  title: string | null;
  summary: string | null;
  tags: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function uploadFile(file: File): Promise<{ id: number; status: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: headers(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
}

export interface UrlCheckResult {
  ok: boolean;
  title?: string | null;
  snippet?: string;
  contentLength?: number;
  error?: string;
}

export async function checkUrl(url: string): Promise<UrlCheckResult> {
  const res = await fetch(`${API_BASE}/api/upload/url/check`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ ok: false, error: 'Check failed' }));
    throw new Error(err.error || 'Check failed');
  }

  return res.json();
}

export async function uploadUrl(url: string): Promise<{ id: number; status: string }> {
  const res = await fetch(`${API_BASE}/api/upload/url`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
}

export async function getDocuments(): Promise<ArchiveDocument[]> {
  const res = await fetch(`${API_BASE}/api/documents`, {
    headers: headers(),
  });

  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocumentStatus(id: number): Promise<DocumentStatus> {
  const res = await fetch(`${API_BASE}/api/documents/${id}/status`, {
    headers: headers(),
  });

  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function getDocumentPage(slug: string): Promise<DocumentPage> {
  const res = await fetch(`${API_BASE}/api/documents/${slug}/page`, {
    headers: headers(),
  });

  if (!res.ok) throw new Error('Failed to fetch document page');
  return res.json();
}

export async function deleteDocument(id: number, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/documents/${id}/delete`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (res.status === 403) throw new Error('Wrong password');
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function aiEditDocument(id: number, instruction: string): Promise<{ formatted_html: string }> {
  const res = await fetch(`${API_BASE}/api/documents/${id}/ai-edit`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ instruction }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Edit failed' }));
    throw new Error(err.error || 'Edit failed');
  }

  return res.json();
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/api/chat/history/${sessionId}`, {
    headers: headers(),
  });

  if (!res.ok) return [];
  return res.json();
}

export async function* streamChat(
  message: string,
  sessionId: string
): AsyncGenerator<string> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Chat failed' }));
    throw new Error(err.error || 'Chat failed');
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) yield parsed.text;
            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}
