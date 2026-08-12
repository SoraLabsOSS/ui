import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type ModelMessage,
  type UIMessageStreamWriter,
} from "ai";
import { env } from "@/env";
import { plainSourceTitle } from "@/lib/plain-text";
import type { ChatUIMessage } from "../../../components/ai/search";

const TEXT_ID = "ai-search";
const CR_AT_EOL = /\r$/;

/** Kept in sync with the Cloudflare AI Search instance `sora-search`. */
const systemPrompt = [
  "You are the Sora UI documentation assistant.",
  "Reply in the same language as the user.",
  "Answer from the retrieved documents. Synthesize, paraphrase, and infer from related pages — do not require an exact heading match.",
  "If the user asks how to add, install, or use something and a Get Started, Installation, or usage page was retrieved, that is the answer: walk through those steps and code examples.",
  'Sora UI is a shadcn-style registry (`@soralabs` / `@soralabsoss/sora-cli`). There is no npm package named `@sora-ui/components` and no `<Icon name="..." />` API.',
  "Copy CLI commands and code snippets from the retrieved docs when present. After install, imports use `@/components/sora-ui/...`, not a fake npm package.",
  "When the question is about adding or installing icons and Icons Get Started was retrieved: install the wrapper (`icons-icon`), then `npx shadcn@latest add @soralabs/icons-[icon-name]` (kebab-case, e.g. `icons-chevrons`). Usage is `<Chevrons animateOnHover />` or wrap with `<AnimateIcon>`.",
  "Do not invent packages, import paths, component names, CLI commands, or URLs that are not in the retrieved sources.",
  "Cite matching pages as markdown links using the source path (e.g. [/docs/icons/get-started](/docs/icons/get-started)).",
  "Only say you could not find it when the retrieved documents are empty or clearly about a different topic with no overlap. Then suggest a better English keyword.",
  "Never output tool XML, <tool_call>, function calls, or JSON tool syntax — write a normal markdown answer.",
].join("\n");

const queryRewritePrompt = [
  "Rewrite the latest user question into a short English search query for Sora UI docs.",
  "Prefer official names and paths:",
  "- icons / add icons / lucide / reicon → Sora Icons catalog get started @soralabs/icons AnimateIcon /docs/icons/get-started",
  "- install / setup → Installation shadcn @soralabs sora-cli",
  "- a named primitive → that component's docs page",
  "Do not rewrite icon catalog questions into icon-button or other button primitives.",
  "Output only the search query, no quotes or explanation.",
].join("\n");

interface CfSearchChunk {
  id?: string;
  item?: {
    key?: string;
    metadata?: { title?: string };
  };
}

interface CfChatChunk {
  choices?: Array<{ delta?: { content?: string | null } }>;
}

function textFromContent(content: ModelMessage["content"]): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .flatMap((part) => (part.type === "text" ? [part.text] : []))
    .join("\n");
}

function toCfMessages(
  messages: ModelMessage[]
): Array<{ content: string; role: string }> {
  return [
    { role: "system", content: systemPrompt },
    ...messages.flatMap((message) => {
      if (message.role !== "user" && message.role !== "assistant") {
        return [];
      }

      const content = textFromContent(message.content).trim();
      if (!content) {
        return [];
      }

      return [{ role: message.role, content }];
    }),
  ];
}

function docsHref(key: string): string {
  try {
    return new URL(key).pathname;
  } catch {
    return key.startsWith("/") ? key : `/${key}`;
  }
}

function parseSseBlock(block: string): { data: string; event: string } {
  let event = "message";
  const dataLines: string[] = [];

  for (const rawLine of block.split("\n")) {
    const line = rawLine.replace(CR_AT_EOL, "");
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  return { event, data: dataLines.join("\n") };
}

async function* iterateSse(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const parsed = parseSseBlock(block);
      if (parsed.data) {
        yield parsed;
      }
    }
  }

  const tail = parseSseBlock(buffer);
  if (tail.data) {
    yield tail;
  }
}

function writeSearchSources(
  write: (part: {
    sourceId: string;
    title?: string;
    type: "source-url";
    url: string;
  }) => void,
  data: string
) {
  let chunks: unknown;
  try {
    chunks = JSON.parse(data);
  } catch {
    return;
  }

  if (!Array.isArray(chunks)) {
    return;
  }

  const seen = new Set<string>();
  for (const raw of chunks) {
    const chunk = raw as CfSearchChunk;
    const key = chunk.item?.key;
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    const url = docsHref(key);
    const title = chunk.item?.metadata?.title
      ? plainSourceTitle(chunk.item.metadata.title)
      : undefined;
    write({
      type: "source-url",
      sourceId: chunk.id ?? key,
      url,
      title: title || undefined,
    });
  }
}

function contentDelta(data: string): string | undefined {
  try {
    const chunk = JSON.parse(data) as CfChatChunk;
    return chunk.choices?.[0]?.delta?.content ?? undefined;
  } catch {
    return;
  }
}

async function pipeCfChatStream(
  writer: UIMessageStreamWriter<ChatUIMessage>,
  body: ReadableStream<Uint8Array>
) {
  writer.write({ type: "start" });
  writer.write({ type: "start-step" });

  let textStarted = false;

  for await (const event of iterateSse(body)) {
    if (event.data === "[DONE]") {
      break;
    }

    if (event.event === "chunks") {
      writeSearchSources((part) => writer.write(part), event.data);
      continue;
    }

    const delta = contentDelta(event.data);
    if (!delta) {
      continue;
    }

    if (!textStarted) {
      writer.write({ type: "text-start", id: TEXT_ID });
      textStarted = true;
    }

    writer.write({ type: "text-delta", id: TEXT_ID, delta });
  }

  if (textStarted) {
    writer.write({ type: "text-end", id: TEXT_ID });
  }

  writer.write({ type: "finish-step" });
  writer.write({ type: "finish" });
}

export async function POST(req: Request, _ctx: RouteContext<"/api/chat">) {
  const reqJson = await req.json();
  const uiMessages = (reqJson.messages ?? []) as ChatUIMessage[];
  const messages = await convertToModelMessages<ChatUIMessage>(uiMessages, {
    convertDataPart(part) {
      if (part.type === "data-client") {
        return {
          type: "text",
          text: `[Client Context: ${JSON.stringify(part.data)}]`,
        };
      }
    },
  });

  const stream = createUIMessageStream<ChatUIMessage>({
    originalMessages: uiMessages,
    onError(error) {
      return error instanceof Error ? error.message : "Chat failed";
    },
    async execute({ writer }) {
      if (!env.AI_SEARCH_CHAT_URL) {
        throw new Error(
          "Ask AI is not configured. Please set AI_SEARCH_CHAT_URL."
        );
      }
      const response = await fetch(env.AI_SEARCH_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: req.signal,
        body: JSON.stringify({
          stream: true,
          max_tokens: 2048,
          model: "@cf/meta/llama-3.1-8b-instruct-fast",
          messages: toCfMessages(messages),
          ai_search_options: {
            cache: { enabled: true },
            query_rewrite: {
              enabled: true,
              rewrite_prompt: queryRewritePrompt,
            },
          },
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(
          `Cloudflare AI Search failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`
        );
      }

      if (!response.body) {
        throw new Error("Cloudflare AI Search returned an empty body");
      }

      await pipeCfChatStream(writer, response.body);
    },
  });

  return createUIMessageStreamResponse({ stream });
}
