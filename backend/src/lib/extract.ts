import fs from 'fs';
import path from 'path';

export async function extractText(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractPdf(filePath);
  }

  // txt, md, and other text files
  return fs.readFileSync(filePath, 'utf-8');
}

async function extractPdf(filePath: string): Promise<string> {
  // Dynamic import for pdf-parse (CommonJS module)
  const pdfParse = (await import('pdf-parse')).default;
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 200);
}

export function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.pdf': 'application/pdf',
    '.html': 'text/html',
    '.htm': 'text/html',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/** Extract inner <body> content from an HTML string. Strips <script> and <noscript> tags. */
export function extractHtmlBody(html: string): string {
  // Remove <script> and <noscript> blocks
  let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // Try to extract <body> content
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }

  // No <body> tag — strip wrappers
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/i, '');
  cleaned = cleaned.replace(/<html[^>]*>|<\/html>/gi, '');
  cleaned = cleaned.replace(/<head[\s\S]*?<\/head>/gi, '');
  return cleaned.trim();
}

/** Strip all tags and decode common HTML entities to produce plain text. */
export function htmlToPlainText(html: string): string {
  // Strip all tags
  let text = html.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&mdash;': '—',
    '&ndash;': '–', '&hellip;': '…', '&laquo;': '«', '&raquo;': '»',
  };
  for (const [entity, char] of Object.entries(entities)) {
    text = text.replaceAll(entity, char);
  }
  // Decode numeric entities
  text = text.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

/** Fetch a URL and return its HTML content. Validates content-type is HTML. */
export async function fetchUrlContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'GioiaArchiveBot/1.0' },
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error(`Expected HTML but got: ${contentType}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}
