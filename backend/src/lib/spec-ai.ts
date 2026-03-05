import Anthropic from '@anthropic-ai/sdk';
import { extractSection } from './spec-db.js';

const anthropic = new Anthropic();
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Find the best matching section for an edit instruction, so we only send
 * that section to Claude instead of the full 42k doc.
 */
function findRelevantSection(markdown: string, instruction: string): { sectionMd: string; before: string; after: string } | null {
  const lines = markdown.split('\n');
  const h2Indices: { index: number; title: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      h2Indices.push({ index: i, title: lines[i].replace(/^## /, '') });
    }
  }

  if (h2Indices.length === 0) return null;

  // Try to match instruction keywords to a section title
  const lowerInst = instruction.toLowerCase();
  let bestIdx = -1;
  let bestScore = 0;

  for (let i = 0; i < h2Indices.length; i++) {
    const words = h2Indices[i].title.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const score = words.filter(w => lowerInst.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  // If no good match, don't scope — let AI handle full doc
  if (bestScore === 0) return null;

  const startLine = h2Indices[bestIdx].index;
  const endLine = bestIdx + 1 < h2Indices.length ? h2Indices[bestIdx + 1].index : lines.length;

  return {
    sectionMd: lines.slice(startLine, endLine).join('\n'),
    before: lines.slice(0, startLine).join('\n'),
    after: lines.slice(endLine).join('\n'),
  };
}

/**
 * Apply a natural-language edit instruction to the spec markdown.
 * Automatically scopes to the relevant section when possible for speed.
 */
export async function editSpec(
  currentMarkdown: string,
  instruction: string,
  section?: string
): Promise<{ markdown: string; diffSummary: string }> {
  // Try to scope the edit to a specific section
  let scopedSection: ReturnType<typeof findRelevantSection> = null;

  if (section) {
    // Explicit section requested
    const sectionMd = extractSection(currentMarkdown, section);
    if (sectionMd) {
      const idx = currentMarkdown.indexOf(sectionMd);
      if (idx !== -1) {
        scopedSection = {
          sectionMd,
          before: currentMarkdown.slice(0, idx),
          after: currentMarkdown.slice(idx + sectionMd.length),
        };
      }
    }
  } else {
    scopedSection = findRelevantSection(currentMarkdown, instruction);
  }

  let updatedMarkdown: string;
  let editTarget: string;

  if (scopedSection) {
    // Edit only the relevant section
    editTarget = scopedSection.sectionMd;
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Edit this section of a product specification based on the instruction below.

<section>
${scopedSection.sectionMd}
</section>

Instruction: "${instruction}"

Rules:
- Apply the change precisely
- Preserve all Markdown formatting
- Return the FULL updated section (not just the changed part)
- Do NOT add or remove headings unless the instruction says to

Respond with ONLY the updated section markdown, no fences or explanation.`,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    updatedMarkdown = scopedSection.before + content.text.trim() + '\n\n' + scopedSection.after;
  } else {
    // Full doc edit (fallback for cross-section changes or new sections)
    editTarget = currentMarkdown;
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16384,
      messages: [{
        role: 'user',
        content: `Edit this product specification based on the instruction below.

<document>
${currentMarkdown}
</document>

Instruction: "${instruction}"

Rules:
- Apply the change precisely
- Preserve all Markdown formatting
- Do NOT change sections unrelated to the instruction
- Output the FULL updated document

Respond with ONLY the updated Markdown, no fences or explanation.`,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');
    updatedMarkdown = content.text.trim();
  }

  // Generate diff summary (cheap call — just from the instruction)
  const diffSummary = `Applied: ${instruction.length > 120 ? instruction.slice(0, 120) + '...' : instruction}`;

  return { markdown: updatedMarkdown, diffSummary };
}

/**
 * Answer a question about the spec document.
 */
export async function askSpec(markdown: string, question: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `You are a helpful assistant answering questions about the belo product specification.

<document>
${markdown}
</document>

Question: "${question}"

Answer based on the document. If not in the doc, say so. Be concise. Reference section numbers when relevant.`,
    }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return content.text.trim();
}
