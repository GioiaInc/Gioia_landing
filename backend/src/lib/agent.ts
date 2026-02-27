import Anthropic from '@anthropic-ai/sdk';
import { searchDocuments, getDocumentFullText, getDocumentChunkCount, searchInDocument } from './db.js';

const anthropic = new Anthropic();

const SMALL_DOC_THRESHOLD = 8000; // docs under this are returned in full

const tools: Anthropic.Tool[] = [
  {
    name: 'search_documents',
    description:
      'Search across all documents in the archive. Returns matching document titles, summaries, and text snippets. Use this to find relevant documents before reading them in full.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'The search query — keywords or phrases to find in documents',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'read_document',
    description:
      'Read a document by its ID. For short documents, returns the full text. For long documents (1hr+ transcripts etc.), returns a summary and tells you the chunk count — use search_in_document to find specific parts.',
    input_schema: {
      type: 'object' as const,
      properties: {
        document_id: {
          type: 'number',
          description: 'The document ID to read',
        },
      },
      required: ['document_id'],
    },
  },
  {
    name: 'search_in_document',
    description:
      'Search within a specific long document for chunks matching a query. Use this when read_document told you the document is too long to return in full. Returns the most relevant sections/chunks.',
    input_schema: {
      type: 'object' as const,
      properties: {
        document_id: {
          type: 'number',
          description: 'The document ID to search within',
        },
        query: {
          type: 'string',
          description: 'What to search for within this document',
        },
      },
      required: ['document_id', 'query'],
    },
  },
];

function executeTool(name: string, input: Record<string, unknown>): string {
  if (name === 'search_documents') {
    const query = String(input.query || '');
    const results = searchDocuments(query);
    if (results.length === 0) {
      return 'No documents found matching that query.';
    }
    return JSON.stringify(
      results.map((r) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        tags: r.tags,
        snippet: (r as unknown as Record<string, unknown>).snippet || null,
      })),
      null,
      2
    );
  }

  if (name === 'read_document') {
    const id = Number(input.document_id);
    const text = getDocumentFullText(id);
    if (!text) {
      return 'Document not found or has no content.';
    }

    // Short doc — return in full
    if (text.length <= SMALL_DOC_THRESHOLD) {
      return text;
    }

    // Long doc — return beginning + warn about length
    const chunkCount = getDocumentChunkCount(id);
    const preview = text.substring(0, 2000);
    return `[LONG DOCUMENT — ${text.length} characters, ${chunkCount} chunks. Showing first ~2000 chars. Use search_in_document to find specific sections.]\n\n${preview}\n\n[...truncated — ${chunkCount} chunks total. Use search_in_document(document_id=${id}, query="your keywords") to find relevant parts.]`;
  }

  if (name === 'search_in_document') {
    const id = Number(input.document_id);
    const query = String(input.query || '');
    const results = searchInDocument(id, query);

    if (results.length === 0) {
      return `No chunks matched "${query}" in this document. Try different keywords.`;
    }

    return results
      .map((r, i) => {
        const header = `--- Chunk ${r.chunk_index + 1} ---`;
        return `${header}\n${r.content}`;
      })
      .join('\n\n');
  }

  return 'Unknown tool.';
}

export async function* streamChat(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): AsyncGenerator<string> {
  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const systemPrompt = `You are the GIOIA Archive assistant. You help team members find information across their document archive — meeting notes, strategy docs, plans, etc.

You have three tools:
- search_documents: search across all docs by keyword
- read_document: read a specific doc (returns full text for short docs, preview for long ones)
- search_in_document: search within a long document for relevant chunks

Workflow for answering questions:
1. search_documents to find relevant docs
2. read_document to get the content
3. If the doc is long, use search_in_document with specific keywords to find the relevant sections

Guidelines:
- Always search before answering substantive questions
- Cite which documents you drew information from
- If you can't find relevant documents, say so honestly
- Keep answers concise and actionable
- You can search multiple times with different queries if needed`;

  // Agentic loop — up to 5 tool-use rounds
  for (let round = 0; round < 5; round++) {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      tools,
      messages,
    });

    let hasToolUse = false;
    const toolUseBlocks: Array<{ id: string; name: string; input: string }> = [];
    let currentToolId = '';
    let currentToolName = '';
    let currentToolInput = '';

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        if (event.content_block.type === 'text') {
          // Start of text block — nothing to do yet
        } else if (event.content_block.type === 'tool_use') {
          hasToolUse = true;
          currentToolId = event.content_block.id;
          currentToolName = event.content_block.name;
          currentToolInput = '';
        }
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          yield event.delta.text;
        } else if (event.delta.type === 'input_json_delta') {
          currentToolInput += event.delta.partial_json;
        }
      } else if (event.type === 'content_block_stop') {
        if (currentToolId) {
          toolUseBlocks.push({
            id: currentToolId,
            name: currentToolName,
            input: currentToolInput,
          });
          currentToolId = '';
        }
      }
    }

    if (!hasToolUse) {
      break;
    }

    // Build the assistant message with all content blocks
    const finalMessage = await stream.finalMessage();
    messages.push({ role: 'assistant', content: finalMessage.content });

    // Execute tools and build tool results
    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((tool) => {
      let input: Record<string, unknown>;
      try {
        input = JSON.parse(tool.input);
      } catch {
        input = {};
      }
      const result = executeTool(tool.name, input);
      return {
        type: 'tool_result' as const,
        tool_use_id: tool.id,
        content: result,
      };
    });

    messages.push({ role: 'user', content: toolResults });
  }
}
