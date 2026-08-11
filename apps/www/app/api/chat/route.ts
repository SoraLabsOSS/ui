import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ModelMessage,
  RetryError,
  streamText,
  type TextStreamPart,
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

/**
 * Free-tier text models, tried one request each (`maxRetries: 0`).
 * Lead with GPT-OSS 20B — it is the only host that returned 200 (Together).
 * Skip GPT-OSS 120B / Baseten; that path is what 429-looped.
 * @see https://vercel.com/ai-gateway/models?modality=text&freeTier=true
 */
const CHAT_MODELS = [
  "openai/gpt-oss-20b",
  "meta/llama-3.1-8b",
  "google/gemini-2.5-flash-lite",
  "mistral/mistral-nemo",
  "zai/glm-4.7-flash",
  "poolside/laguna-s-2.1-free",
  "inclusionai/ling-3.0-tiny-free",
] as const;

/** Prefer Together/Groq/Fireworks; Baseten is omitted so it is last-resort only. */
const GATEWAY_PROVIDER_ORDER = [
  "togetherai",
  "groq",
  "fireworks",
  "deepinfra",
  "parasail",
  "google",
  "vertex",
  "novita",
  "mistral",
  "zai",
  "poolside",
  "bedrock",
] as const;

const NON_FAILOVER_STATUS = new Set([400, 401, 402, 403, 404]);

type ChatStreamPart = ReturnType<typeof streamText>["stream"] extends
  | ReadableStream<infer P>
  | AsyncIterable<infer P>
  ? P
  : TextStreamPart<never>;

interface ChatStreamOptions {
  instructions: string;
  maxOutputTokens: number;
  messages: ModelMessage[];
  onError?: (event: { error: unknown }) => void;
  reasoning: "none";
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const status = error.statusCode;
    if (typeof status === "number") {
      return status;
    }
  }

  return;
}

function getErrorLabel(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return `${error.name} ${error.message}`;
  }

  if (typeof error === "object" && error !== null) {
    const record = error as { message?: unknown; name?: unknown };
    return `${record.name ?? ""} ${record.message ?? ""}`;
  }

  return "";
}

function isFailoverError(error: unknown): boolean {
  if (RetryError.isInstance(error)) {
    return isFailoverError(error.lastError);
  }

  const status = getErrorStatus(error);
  if (status !== undefined && NON_FAILOVER_STATUS.has(status)) {
    return false;
  }

  const label = getErrorLabel(error).toLowerCase();
  if (
    label.includes("authentication") ||
    label.includes("invalid_request") ||
    label.includes("invalid request")
  ) {
    return false;
  }

  // Streamed GatewayRateLimitError often has no `isRetryable` flag.
  return true;
}

function isGenerationPart(part: ChatStreamPart): boolean {
  return (
    part.type === "text-start" ||
    part.type === "text-delta" ||
    part.type === "reasoning-start" ||
    part.type === "reasoning-delta" ||
    part.type === "finish-step" ||
    part.type === "finish"
  );
}

function continueStream(
  prefix: ChatStreamPart[],
  reader: ReadableStreamDefaultReader<ChatStreamPart> | null,
  done: boolean
): ReadableStream<ChatStreamPart> {
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index < prefix.length) {
        const next = prefix[index];
        index += 1;
        if (next) {
          controller.enqueue(next);
        }
        return;
      }

      if (done || !reader) {
        controller.close();
        return;
      }

      const result = await reader.read();
      if (result.done) {
        controller.close();
        return;
      }

      controller.enqueue(result.value);
    },
    cancel(reason) {
      return reader?.cancel(reason);
    },
  });
}

async function tryModelStream(
  model: (typeof CHAT_MODELS)[number],
  options: ChatStreamOptions
): Promise<
  | { error: unknown; ok: false }
  | { ok: true; stream: ReadableStream<ChatStreamPart> }
> {
  const result = streamText({
    ...options,
    model,
    maxRetries: 0,
    providerOptions: {
      gateway: {
        order: [...GATEWAY_PROVIDER_ORDER],
      },
    },
  });
  const reader = result.stream.getReader();
  const prefix: ChatStreamPart[] = [];

  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) {
        return { ok: true, stream: continueStream(prefix, reader, true) };
      }

      if (chunk.value.type === "error") {
        if (isFailoverError(chunk.value.error)) {
          await reader.cancel();
          return { ok: false, error: chunk.value.error };
        }

        return {
          ok: true,
          stream: continueStream([...prefix, chunk.value], reader, false),
        };
      }

      prefix.push(chunk.value);
      if (isGenerationPart(chunk.value)) {
        return { ok: true, stream: continueStream(prefix, reader, false) };
      }
    }
  } catch (error) {
    return { ok: false, error };
  }
}

async function streamWithModelFailover(
  options: ChatStreamOptions
): Promise<ReadableStream<ChatStreamPart>> {
  let lastError: unknown;

  for (const [index, model] of CHAT_MODELS.entries()) {
    const attempt = await tryModelStream(model, options);
    if (attempt.ok) {
      return attempt.stream;
    }

    lastError = attempt.error;
    if (index < CHAT_MODELS.length - 1 && isFailoverError(attempt.error)) {
      console.warn(
        `[/api/chat] ${model} failed, trying next model`,
        attempt.error
      );
      continue;
    }

    break;
  }

  return continueStream(
    [{ type: "error", error: lastError ?? new Error("Chat failed") }],
    null,
    true
  );
}

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

  const stream = await streamWithModelFailover({
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
      stream,
      onError(error) {
        return error instanceof Error ? error.message : "Chat failed";
      },
    }),
  });
}
