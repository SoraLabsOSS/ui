import type { InferPageType } from "fumadocs-core/source";
import { expandLlmMarkdown } from "@/lib/docs/expand-llm-markdown";
import type { source } from "@/lib/docs/source";
import type { componentSource } from "@/lib/registry/component-source";
import type { uiSource } from "@/lib/ui/source";

type LLMPage =
  | InferPageType<typeof source>
  | InferPageType<typeof componentSource>
  | InferPageType<typeof uiSource>;

export async function getLLMText(page: LLMPage) {
  const processed = await page.data.getText("processed");
  const body = expandLlmMarkdown(processed);

  return `# ${page.data.title} (${page.url})

${body}`;
}
