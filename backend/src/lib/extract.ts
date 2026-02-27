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
  };
  return mimeMap[ext] || 'application/octet-stream';
}
