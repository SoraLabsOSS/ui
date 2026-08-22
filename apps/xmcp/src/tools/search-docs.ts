import type { InferSchema, ToolMetadata } from "xmcp";
import { z } from "zod";
import {
  type DocSearchResult,
  DocSourceError,
  soraDocsSource,
} from "../docs/sora-docs-source";
import { formatSearchResults } from "../lib/tokens";

export const schema = {
  query: z
    .string()
    .describe("Search query — keywords or phrase to find in the documentation"),
  section: z
    .string()
    .optional()
    .describe("Filter results to a specific documentation section"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(25)
    .optional()
    .describe("Maximum number of results to return (default 10, max 25)"),
};

export const metadata: ToolMetadata = {
  name: "search_docs",
  description:
    "Search the documentation by keyword or phrase. Returns a ranked list of matching pages with relevant excerpts.",
  annotations: {
    title: "Search Documentation",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function searchDocs({
  query,
  section,
  limit,
}: InferSchema<typeof schema>) {
  try {
    const searchLimit = limit ?? 10;
    const results: DocSearchResult[] = await soraDocsSource.search(query, {
      section,
      limit: searchLimit,
    });
    const formatted = formatSearchResults(results, 4000);

    if (results.length === searchLimit) {
      return `${formatted}\n\n(Note: results may be truncated at ${searchLimit} — refine your query or raise \`limit\` for more.)`;
    }

    return formatted;
  } catch (error) {
    if (error instanceof DocSourceError) {
      return `Search failed: ${error.message}. Try again or use list_sections to browse available documentation.`;
    }
    throw error;
  }
}
