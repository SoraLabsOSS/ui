import {
  type DocSearchResult,
  DocSourceError,
  formatSearchResults,
} from "@mcpframework/docs";
import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { soraDocsSource } from "../docs/sora-docs-source.js";

const schema = z.object({
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
});

type SearchDocsInput = z.infer<typeof schema>;

/**
 * The base `SearchDocsTool.execute()` has no way to signal "there are more
 * results beyond `limit`" — `formatSearchResults()` only knows about results
 * it was actually given. This override appends that note when the source
 * returned exactly `limit` results (a heuristic: we can't distinguish
 * "exactly N results total" from "N+ results, capped at N" without a total
 * count from the source).
 */
class SoraSearchDocsTool extends MCPTool<SearchDocsInput> {
  name = "search_docs";
  description =
    "Search the documentation by keyword or phrase. Returns a ranked list of matching pages with relevant excerpts.";
  protected schema = schema;
  protected useStringify = false;

  protected async execute(input: SearchDocsInput): Promise<string> {
    try {
      const limit = input.limit ?? 10;
      const results: DocSearchResult[] = await soraDocsSource.search(
        input.query,
        { section: input.section, limit }
      );
      const formatted = formatSearchResults(results, 4000);

      if (results.length === limit) {
        return `${formatted}\n\n(Note: results may be truncated at ${limit} — refine your query or raise \`limit\` for more.)`;
      }

      return formatted;
    } catch (error) {
      if (error instanceof DocSourceError) {
        return `Search failed: ${error.message}. Try again or use list_sections to browse available documentation.`;
      }
      throw error;
    }
  }
}

export default SoraSearchDocsTool;
