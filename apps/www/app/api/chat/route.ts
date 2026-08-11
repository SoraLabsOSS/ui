import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { Document, type DocumentData } from "flexsearch";
import { source } from "@/lib/docs/source";
import type { ChatUIMessage } from "../../../components/ai/search";

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
  "Answer only from the documentation excerpts provided below.",
  "Cite pages as markdown links using each excerpt's url.",
  "Never output tool XML, <tool_call>, function calls, or JSON tool syntax — write a normal markdown answer.",
  "If the excerpts are empty or irrelevant, say you could not find it and suggest a better English keyword (for example `icons`, `installation`).",
].join("\n");

function lastUserQuery(messages: ChatUIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== "user") {
      continue;
    }

    return (message.parts ?? [])
      .flatMap((part) => (part.type === "text" ? [part.text] : []))
      .join(" ")
      .trim();
  }

  return "";
}

function formatDocsContext(hits: SearchHit[]): string {
  if (hits.length === 0) {
    return "No matching documentation pages were found.";
  }

  return hits
    .map(
      (hit) =>
        `- [${hit.title}](${hit.url}): ${hit.description}\n  ${hit.snippet}`
    )
    .join("\n");
}

export async function POST(req: Request, _ctx: RouteContext<"/api/chat">) {
  const reqJson = await req.json();
  const uiMessages = (reqJson.messages ?? []) as ChatUIMessage[];
  const hits = await searchDocs(lastUserQuery(uiMessages), 8);

  const result = streamText({
    model: CHAT_MODEL,
    providerOptions: {
      gateway: {
        models: [
          "inclusionai/ling-3.0-tiny-free",
          "nvidia/nemotron-3-nano-30b-a3b",
          "meta/llama-3.1-8b",
          "alibaba/qwen3.7-flash",
        ],
      },
    },
    instructions: `${systemPrompt}\n\n## Documentation\n${formatDocsContext(hits)}`,
    reasoning: "none",
    maxOutputTokens: 2048,
    messages: await convertToModelMessages<ChatUIMessage>(uiMessages, {
      convertDataPart(part) {
        if (part.type === "data-client") {
          return {
            type: "text",
            text: `[Client Context: ${JSON.stringify(part.data)}]`,
          };
        }
      },
    }),
    onError({ error }) {
      console.error("[/api/chat]", error);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError(error) {
        return error instanceof Error ? error.message : "Chat failed";
      },
    }),
  });
}
