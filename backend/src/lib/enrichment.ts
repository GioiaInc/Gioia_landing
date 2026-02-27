import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

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
