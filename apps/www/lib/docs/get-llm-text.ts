import type { InferPageType } from "fumadocs-core/source";
import type { blog } from "@/lib/blog/source";
import { expandLlmMarkdown } from "@/lib/docs/expand-llm-markdown";
import type { source } from "@/lib/docs/source";
import type { componentSource } from "@/lib/registry/component-source";
import type { uiSource } from "@/lib/ui/source";

type LLMPage =
  | InferPageType<typeof source>
  | InferPageType<typeof componentSource>
  | InferPageType<typeof uiSource>
  | InferPageType<typeof blog>;

const FRONTMATTER_RE = /^---[\s\S]*?---\s*/;
const TITLE_RE = /^title:\s*["']?([^"'\n]+)["']?/m;

export async function getLLMText(page: LLMPage) {
  let processed = "";
  let raw = "";

  try {
    processed = await page.data.getText("processed");
  } catch {
    raw = await page.data.getText("raw");
    processed = raw.replace(FRONTMATTER_RE, "");
  }

  const title =
    page.data.title ||
    (raw ? raw.match(TITLE_RE)?.[1] : undefined) ||
    "Document";
  const body = expandLlmMarkdown(processed);

  return `# ${title} (${page.url})

${body}`;
}
