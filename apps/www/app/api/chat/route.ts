import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type ModelMessage,
  type UIMessageStreamWriter,
} from "ai";
import { env } from "@/env";
import type { ChatUIMessage } from "../../../components/ai/search";

const TEXT_ID = "ai-search";
const CR_AT_EOL = /\r$/;

const systemPrompt = [
  "You are the Sora UI documentation assistant.",
  "Reply in the same language as the user.",
  "Answer only from the retrieved documentation.",
  "Cite pages as markdown links using each source url (path is enough, e.g. [/docs/primitives/stagger-button](/docs/primitives/stagger-button)).",
  "Never output tool XML, <tool_call>, function calls, or JSON tool syntax — write a normal markdown answer.",
  "If the retrieved docs are empty or irrelevant, say you could not find it and suggest a better English keyword (for example `icons`, `installation`).",
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
    write({
      type: "source-url",
      sourceId: chunk.id ?? key,
      url,
      title: chunk.item?.metadata?.title,
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
      const response = await fetch(env.AI_SEARCH_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: req.signal,
        body: JSON.stringify({
          stream: true,
          max_tokens: 2048,
          messages: toCfMessages(messages),
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
