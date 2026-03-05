import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Apply a natural-language edit instruction to the spec markdown.
 * Can optionally target a specific section.
 */
export async function editSpec(
  currentMarkdown: string,
  instruction: string,
  section?: string
): Promise<{ markdown: string; diffSummary: string }> {
  const sectionContext = section
    ? `\nThe user wants to edit specifically the section about: "${section}". Only modify that section, leave everything else unchanged.`
    : '';

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `You are editing a product specification document in Markdown format based on an instruction.${sectionContext}

Here is the current document:

<document>
${currentMarkdown}
</document>

Edit instruction: "${instruction}"

Rules:
- Apply the requested change precisely
- Preserve all Markdown formatting (headings, lists, bold, etc.)
- Do NOT change sections unrelated to the instruction
- Keep the same heading hierarchy and structure
- Output the FULL updated document (all sections, not just the changed part)

Respond with ONLY the updated Markdown, no explanation or fences.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  // Generate a brief diff summary
  const summaryMsg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Briefly describe in 1 sentence what changed between the old and new version of this document. Be specific about what was added, removed, or modified.

Edit instruction was: "${instruction}"

Respond with ONLY the summary sentence, no quotes or explanation.`,
      },
    ],
  });

  const summary = summaryMsg.content[0];
  const diffSummary = summary.type === 'text' ? summary.text.trim() : instruction;

  return { markdown: content.text.trim(), diffSummary };
}

/**
 * Answer a question about the spec document.
 */
export async function askSpec(markdown: string, question: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a helpful assistant answering questions about the belo product specification.

Here is the full specification:

<document>
${markdown}
</document>

Question: "${question}"

Answer the question based on the document. If the answer is not in the document, say so. Be concise and specific. Reference section numbers when relevant.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return content.text.trim();
}
