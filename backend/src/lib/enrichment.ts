import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const FORMAT_MAX_CHARS = 30000;

interface EnrichmentResult {
  title: string;
  summary: string;
  tags: string[];
}

export async function enrichDocument(text: string, originalName: string): Promise<EnrichmentResult> {
  // Truncate very long documents for enrichment (keep first ~8000 chars)
  const truncated = text.length > 8000 ? text.substring(0, 8000) + '\n\n[...truncated for enrichment]' : text;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a document for a team archive system. The original filename is "${originalName}".

Here is the document text:

<document>
${truncated}
</document>

Generate a JSON object with these fields:
- "title": A clear, concise title for this document (max 80 chars)
- "summary": A 1-2 sentence summary of the key content (max 200 chars)
- "tags": An array of 2-5 relevant tags (lowercase, no spaces, use hyphens)

Respond with ONLY the JSON object, no markdown formatting or explanation.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    const result = JSON.parse(content.text);
    return {
      title: String(result.title || originalName).substring(0, 200),
      summary: String(result.summary || '').substring(0, 500),
      tags: Array.isArray(result.tags) ? result.tags.map(String).slice(0, 10) : [],
    };
  } catch {
    throw new Error(`Failed to parse enrichment response: ${content.text.substring(0, 200)}`);
  }
}

/**
 * Generate a formatted HTML article from document text.
 * Output matches the existing doc page style with sections, paragraphs, and standout quotes.
 */
export async function formatDocument(text: string, originalName: string): Promise<string> {
  const truncated = text.length > FORMAT_MAX_CHARS
    ? text.substring(0, FORMAT_MAX_CHARS) + '\n\n[...truncated]'
    : text;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are formatting a document into a clean HTML article for a team knowledge base. The original filename is "${originalName}".

Here is the document text:

<document>
${truncated}
</document>

Generate HTML that follows this exact structure:
1. One <p> intro paragraph summarizing the document
2. Multiple <h2> section headings for each major topic
3. <p> content paragraphs under each heading
4. A final <h2>Standout Quotes</h2> section with 2-3 notable quotes formatted as:
   <p style="font-style: italic; color: #6a6560;">"Quote text here"<br/>— Speaker Name</p>

Rules:
- Output ONLY the HTML body content (no <html>, <head>, <body>, or <article> tags)
- Use only <p>, <h2>, <br/> tags — no <div>, <ul>, <strong>, <em>, or other tags
- Do NOT include a <h1> title — it's rendered separately
- Keep it concise but comprehensive — capture all key topics
- If the document has no clear quotes, pick 2 notable statements and attribute them
- If speakers aren't identifiable, omit the attribution line

Respond with ONLY the HTML, no markdown fences or explanation.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text.trim();
}
