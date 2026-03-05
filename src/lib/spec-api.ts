const API_BASE = process.env.NEXT_PUBLIC_ARCHIVE_API || 'http://localhost:3001';
const TOKEN_KEY = 'gioia-docs-token';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) || '';
}

function headers(json = false): HeadersInit {
  const h: Record<string, string> = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

export interface SpecData {
  title: string;
  markdown: string;
  sections: { level: number; title: string }[];
  updated_at: string;
}

export interface SpecEdit {
  id: number;
  source: string;
  source_label: string | null;
  action: string;
  instruction: string | null;
  section: string | null;
  diff_summary: string | null;
  created_at: string;
}

export interface SpecEditDetail extends SpecEdit {
  previous_md: string | null;
}

export interface SpecHistory {
  edits: SpecEdit[];
  total: number;
  limit: number;
  offset: number;
}

export async function getSpec(): Promise<SpecData> {
  const res = await fetch(`${API_BASE}/api/spec?format=json`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Failed to fetch spec');
  return res.json();
}

export async function editSpecAI(
  instruction: string,
  section?: string
): Promise<{ ok: boolean; diff_summary: string; updated_at: string }> {
  const res = await fetch(`${API_BASE}/api/spec/edit`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ instruction, section }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Edit failed' }));
    throw new Error(err.error || 'Edit failed');
  }
  return res.json();
}

export async function askSpecAI(question: string): Promise<{ answer: string }> {
  const res = await fetch(`${API_BASE}/api/spec/ask`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Ask failed' }));
    throw new Error(err.error || 'Ask failed');
  }
  return res.json();
}

export async function getSpecHistory(limit = 50, offset = 0): Promise<SpecHistory> {
  const res = await fetch(`${API_BASE}/api/spec/history?limit=${limit}&offset=${offset}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function getSpecEditDetail(id: number): Promise<SpecEditDetail> {
  const res = await fetch(`${API_BASE}/api/spec/history/${id}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Failed to fetch edit');
  return res.json();
}

export async function revertSpec(editId: number): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/api/spec/revert/${editId}`, {
    method: 'POST',
    headers: headers(true),
  });
  if (!res.ok) throw new Error('Revert failed');
  return res.json();
}

export async function seedSpec(markdown: string, title?: string, force = false): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/api/spec/seed`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ markdown, title, force }),
  });
  if (!res.ok) throw new Error('Seed failed');
  return res.json();
}
