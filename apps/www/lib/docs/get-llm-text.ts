import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/docs/source";

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  // note: it doesn't escape frontmatter, it's up to you.
  return `# ${page.data.title}
URL: ${page.url}

${processed}`;
}
