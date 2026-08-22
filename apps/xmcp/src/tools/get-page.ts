import type { InferSchema, ToolMetadata } from "xmcp";
import { z } from "zod";
import { DocSourceError, soraDocsSource } from "../docs/sora-docs-source";
import { truncateToTokenBudget } from "../lib/tokens";

export const schema = {
  slug: z
    .string()
    .describe('Page slug or URL path (e.g. "getting-started" or "ui/button")'),
};

export const metadata: ToolMetadata = {
  name: "get_page",
  description:
    "Retrieve the full content of a documentation page by its slug or URL path. Returns the page as markdown.",
  annotations: {
    title: "Get Documentation Page",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getPage({ slug }: InferSchema<typeof schema>) {
  try {
    const page = await soraDocsSource.getPage(slug);
    if (!page) {
      return `Page not found: "${slug}". Use search_docs to find the correct page or list_sections to browse available documentation.`;
    }

    const header = `# ${page.title}\n${page.url}\n\n`;
    const fullContent = header + page.content;
    const { text } = truncateToTokenBudget(fullContent, 8000);
    return text;
  } catch (error) {
    if (error instanceof DocSourceError) {
      return `Failed to retrieve page: ${error.message}`;
    }
    throw error;
  }
}
