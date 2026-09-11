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

function getAgentMetadata(page: LLMPage): string {
  const data = page.data as typeof page.data & {
    a11yConstraints?: string[];
    compositionRecipes?: Array<{
      components: string[];
      constraints: string[];
      description: string;
      name: string;
    }>;
    compositionRules?: string[];
    intent?: string;
    motionEngine?: string;
    role?: string;
  };

  const metadataValues = [
    data.intent,
    data.role,
    data.motionEngine,
    data.a11yConstraints?.length,
    data.compositionRules?.length,
    data.compositionRecipes?.length,
  ];
  if (!metadataValues.some(Boolean)) {
    return "";
  }

  const lines = ["## Agent Metadata"];
  if (data.intent) {
    lines.push(`- intent: ${data.intent}`);
  }
  if (data.role) {
    lines.push(`- role: ${data.role}`);
  }
  if (data.motionEngine) {
    lines.push(`- motionEngine: ${data.motionEngine}`);
  }
  if (data.a11yConstraints?.length) {
    lines.push(
      `- a11yConstraints: ${data.a11yConstraints.map((item) => `\`${item}\``).join(", ")}`
    );
  }
  if (data.compositionRules?.length) {
    lines.push(
      `- compositionRules: ${data.compositionRules.map((item) => `\`${item}\``).join(", ")}`
    );
  }
  for (const recipe of data.compositionRecipes ?? []) {
    lines.push(
      `- recipe "${recipe.name}": ${recipe.description} Components: ${recipe.components.join(", ")}. Constraints: ${recipe.constraints.join(", ") || "none"}.`
    );
  }

  return `${lines.join("\n")}\n\n`;
}

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
  const agentMetadata = getAgentMetadata(page);

  return `# ${title} (${page.url})

  ${agentMetadata}${body}`;
}
