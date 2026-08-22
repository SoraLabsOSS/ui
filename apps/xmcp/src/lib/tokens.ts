export interface TruncateResult {
  text: string;
  truncated: boolean;
}

export interface SearchResultItem {
  section?: string;
  slug: string;
  snippet: string;
  title: string;
  url: string;
}

const TRUNCATION_NOTICE =
  "\n\n[Content truncated. Use search_docs with a more specific query to find relevant sections.]";

/**
 * Rough token estimate based on character count.
 * Approximation: ~4 characters per token for English text.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to stay within a token budget.
 * Truncates at word boundary and appends a notice if truncated.
 */
export function truncateToTokenBudget(
  text: string,
  budget: number
): TruncateResult {
  const maxChars = budget * 4;
  if (text.length <= maxChars) {
    return { text, truncated: false };
  }

  // Find the last space before the budget limit to truncate at word boundary
  const truncatedRaw = text.slice(0, maxChars - TRUNCATION_NOTICE.length);
  const lastSpace = truncatedRaw.lastIndexOf(" ");
  const truncated =
    lastSpace > 0 ? truncatedRaw.slice(0, lastSpace) : truncatedRaw;

  return {
    text: truncated + TRUNCATION_NOTICE,
    truncated: true,
  };
}

/**
 * Format search results into readable text, dropping trailing results
 * if the total exceeds the token budget.
 */
export function formatSearchResults(
  results: SearchResultItem[],
  budget = 4000
): string {
  if (results.length === 0) {
    return "No results found. Try a different search query or use list_sections to browse available documentation.";
  }

  const maxChars = budget * 4;
  const lines: string[] = [];
  let totalLength = 0;

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const snippet =
      r.snippet.length > 200 ? `${r.snippet.slice(0, 200)}...` : r.snippet;
    const entry = `${i + 1}. **${r.title}**\n   ${r.url}\n   ${snippet}${r.section ? `\n   Section: ${r.section}` : ""}`;

    if (totalLength + entry.length > maxChars && lines.length > 0) {
      lines.push(
        `\n(${results.length - i} more results omitted — refine your query for more specific results)`
      );
      break;
    }

    lines.push(entry);
    totalLength += entry.length;
  }

  return lines.join("\n\n");
}
