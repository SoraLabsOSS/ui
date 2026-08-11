import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
} from "ai";
import { Document, type DocumentData } from "flexsearch";
import { z } from "zod";
import { source } from "@/lib/docs/source";
import type { ChatUIMessage, SearchTool } from "../../../components/ai/search";

interface CustomDocument extends DocumentData {
  content: string;
  description: string;
  title: string;
  url: string;
}

interface SearchHit {
  description: string;
  snippet: string;
  title: string;
  url: string;
}

const QUERY_TOKEN_SPLIT = /[^\p{L}\p{N}]+/u;

const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: "url",
      index: ["title", "description", "content"],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!("getText" in page.data)) {
        return null;
      }

      return {
        title: page.data.title,
        description: page.data.description,
        url: page.url,
        content: await page.data.getText("processed"),
      } as CustomDocument;
    })
  );

  for (const doc of docs) {
    if (doc) {
      search.add(doc);
    }
  }

  return search;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}

function snippetFrom(content: string | undefined): string {
  if (!content) {
    return "";
  }
  return content.replace(/\s+/g, " ").trim().slice(0, 400);
}

function collectHits(raw: unknown, seen: Set<string>, hits: SearchHit[]) {
  if (!Array.isArray(raw)) {
    return;
  }

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const row = item as {
      doc?: CustomDocument;
      result?: unknown;
      title?: string;
      url?: string;
      description?: string;
      content?: string;
    };

    if (Array.isArray(row.result)) {
      collectHits(row.result, seen, hits);
      continue;
    }

    const doc = row.doc ?? row;
    const url = doc.url;
    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    hits.push({
      title: doc.title ?? url,
      url,
      description: doc.description ?? "",
      snippet: snippetFrom(doc.content),
    });
  }
}

async function searchDocs(query: string, limit: number): Promise<SearchHit[]> {
  const search = await searchServer;
  const seen = new Set<string>();
  const hits: SearchHit[] = [];
  const queries = [
    query,
    ...query.split(QUERY_TOKEN_SPLIT).filter((token) => token.length > 2),
  ];

  for (const q of queries) {
    if (hits.length >= limit) {
      break;
    }

    const raw = await search.searchAsync(q, {
      limit,
      merge: true,
      enrich: true,
    });
    collectHits(raw, seen, hits);
  }

  return hits.slice(0, limit);
}

/** Vercel AI Gateway model id — https://vercel.com/ai-gateway/models/ling-3.0-tiny-free/api */
const CHAT_MODEL = "inclusionai/ling-3.0-tiny-free";

const systemPrompt = [
  "You are the Sora UI documentation assistant.",
  "Reply in the same language as the user.",
  "Call the `search` tool once to load relevant docs, then write a complete answer.",
  "Do not call search more than once. After tool results arrive, always respond with markdown — never stop on a tool call.",
  "Ground the answer in search results. Cite pages as markdown links using the `url` field.",
  "If results are empty, say you could not find it and suggest a better English keyword (for example `icons`, `installation`).",
].join("\n");

const searchTool = tool({
  description:
    "Search Sora UI docs. Returns title, url, description, and a short snippet for each page.",
  inputSchema: z.object({
    query: z.string().describe("Search keywords. Prefer English doc terms."),
    limit: z.number().int().min(1).max(20).default(8),
  }),
  async execute({ query, limit }) {
    return await searchDocs(query, limit);
  },
}) satisfies SearchTool;

export async function POST(req: Request, _ctx: RouteContext<"/api/chat">) {
  const reqJson = await req.json();

  const result = streamText({
    model: CHAT_MODEL,
    instructions: systemPrompt,
    reasoning: "none",
    maxOutputTokens: 2048,
    stopWhen: stepCountIs(5),
    prepareStep: ({ stepNumber }) => {
      if (stepNumber > 0) {
        return { toolChoice: "none" };
      }
    },
    tools: {
      search: searchTool,
    },
    messages: await convertToModelMessages<ChatUIMessage>(
      reqJson.messages ?? [],
      {
        convertDataPart(part) {
          if (part.type === "data-client") {
            return {
              type: "text",
              text: `[Client Context: ${JSON.stringify(part.data)}]`,
            };
          }
        },
      }
    ),
    toolChoice: "auto",
    onError({ error }) {
      console.error("[/api/chat]", error);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      tools: { search: searchTool },
      onError(error) {
        return error instanceof Error ? error.message : "Chat failed";
      },
    }),
  });
}
