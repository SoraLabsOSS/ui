import {
  type DocPage,
  type DocSection,
  parseLlmsTxt,
} from "../lib/llms-txt-parser";
import type { SearchResultItem } from "../lib/tokens";
import { docsCache } from "./docs-cache";

const BASE_URL_CLEAN_REGEX = /\/+$/;
const QUERY_SPLIT_REGEX = /\s+/;

/** Also used by `registry/sora-registry-source.ts` — same host serves `/r/registry.json`. */
export const DOCS_BASE_URL =
  process.env.DOCS_BASE_URL?.replace(BASE_URL_CLEAN_REGEX, "") ??
  "https://ui.soralabs.studio";

/** Matches `apps/www/app` LLM + search routes. */
const SORA_WWW_DOCS = {
  searchEndpoint: "/api/search",
  llmsTxtPath: "/llms.txt",
  llmsFullTxtPath: "/llms-full.txt",
} as const;

export interface DocSearchOptions {
  limit?: number;
  section?: string;
}

export type DocSearchResult = SearchResultItem & {
  description?: string;
  score?: number;
};

export class DocSourceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DocSourceError";
  }
}

const LEADING_SLASHES = /^\/+/;
const TRAILING_SLASHES = /\/+$/;
const DOCS_PREFIX = /^docs\//;
const COMPONENTS_PREFIX = "components/";
const CATALOG_PREFIX = "catalog/";
const MOTION_PREFIX = "motion/";
const UI_PREFIX = "ui/";
const FIRST_HEADING = /^#\s+(.+)$/m;
const HEADER_PATTERN = /^#\s+([^\n(]+?)(?:\s*\(([^)]+)\))?\s*$/gm;

type LlmsSection = "documentation" | "components" | "catalog" | "motion" | "ui";

interface MdxCandidate {
  fetchPath: string;
  pagePath: string;
}

function trimSlug(slug: string): string {
  return slug.replace(LEADING_SLASHES, "").replace(TRAILING_SLASHES, "");
}

function cacheKeyForSlug(trimmedSlug: string): string {
  return trimmedSlug.replace(DOCS_PREFIX, "");
}

function buildMdxCandidates(trimmedSlug: string): MdxCandidate[] {
  const candidates: MdxCandidate[] = [];
  const seen = new Set<string>();

  const add = (fetchPath: string, pagePath: string) => {
    if (seen.has(fetchPath)) {
      return;
    }
    seen.add(fetchPath);
    candidates.push({ fetchPath, pagePath });
  };

  if (trimmedSlug === "ui" || trimmedSlug.startsWith(UI_PREFIX)) {
    const rest =
      trimmedSlug === "ui" ? "" : trimmedSlug.slice(UI_PREFIX.length);
    const pagePath = rest ? `/ui/${rest}` : "/ui";
    add(`${pagePath}.mdx`, pagePath);
    add(rest ? `/llms-ui.mdx/${rest}` : "/llms-ui.mdx", pagePath);
    return candidates;
  }

  if (trimmedSlug.startsWith(CATALOG_PREFIX)) {
    const rest = trimmedSlug.slice(CATALOG_PREFIX.length);
    add(`/catalog/${rest}.mdx`, `/catalog/${rest}`);
    add(`/llms-catalog.mdx/${rest}`, `/catalog/${rest}`);
    return candidates;
  }

  if (trimmedSlug.startsWith(COMPONENTS_PREFIX)) {
    const rest = trimmedSlug.slice(COMPONENTS_PREFIX.length);
    add(`/catalog/${rest}.mdx`, `/catalog/${rest}`);
    add(`/components/${rest}.mdx`, `/components/${rest}`);
    add(`/llms-catalog.mdx/${rest}`, `/catalog/${rest}`);
    add(`/llms-components.mdx/${rest}`, `/components/${rest}`);
    return candidates;
  }

  if (trimmedSlug.startsWith(MOTION_PREFIX)) {
    const rest = trimmedSlug.slice(MOTION_PREFIX.length);
    add(`/docs/motion/${rest}.mdx`, `/docs/motion/${rest}`);
    add(`/llms.mdx/motion/${rest}`, `/docs/motion/${rest}`);
    return candidates;
  }

  const docPath = trimmedSlug.startsWith("docs/")
    ? trimmedSlug.slice("docs/".length)
    : trimmedSlug;

  add(`/docs/${docPath}.mdx`, `/docs/${docPath}`);
  add(`/llms.mdx/${docPath}`, `/docs/${docPath}`);

  if (!trimmedSlug.startsWith("docs/")) {
    add(`/catalog/${trimmedSlug}.mdx`, `/catalog/${trimmedSlug}`);
    add(`/components/${trimmedSlug}.mdx`, `/components/${trimmedSlug}`);
    add(`/llms-catalog.mdx/${trimmedSlug}`, `/catalog/${trimmedSlug}`);
  }

  return candidates;
}

function pagePathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function matchesLlmsSection(pathname: string, section: LlmsSection): boolean {
  if (section === "catalog" || section === "components") {
    return (
      pathname === "/catalog" ||
      pathname.startsWith("/catalog/") ||
      pathname === "/components" ||
      pathname.startsWith("/components/")
    );
  }

  if (section === "motion") {
    return (
      pathname === "/docs/motion" ||
      pathname.startsWith("/docs/motion/") ||
      pathname === "/motion" ||
      pathname.startsWith("/motion/") ||
      pathname === "/docs/primitives" ||
      pathname.startsWith("/docs/primitives/")
    );
  }

  if (section === "ui") {
    return pathname === "/ui" || pathname.startsWith("/ui/");
  }

  return pathname === "/docs" || pathname.startsWith("/docs/");
}

function filterByLlmsSection(
  results: DocSearchResult[],
  section: LlmsSection,
  limit: number
): DocSearchResult[] {
  return results
    .filter((result) => matchesLlmsSection(pagePathname(result.url), section))
    .slice(0, limit);
}

function countOccurrences(text: string, term: string): number {
  let count = 0;
  let pos = text.indexOf(term, 0);
  while (pos !== -1) {
    count++;
    pos = text.indexOf(term, pos + term.length);
  }
  return count;
}

export class SoraDocsSource {
  readonly baseUrl: string;
  private readonly cache = docsCache;

  constructor(baseUrl: string = DOCS_BASE_URL) {
    this.baseUrl = baseUrl.replace(BASE_URL_CLEAN_REGEX, "");
  }

  async fetchText(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new DocSourceError(
          `Fetch failed: ${url} (${response.status} ${response.statusText})`
        );
      }
      return await response.text();
    } catch (error) {
      if (error instanceof DocSourceError) {
        throw error;
      }
      throw new DocSourceError(
        `Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error }
      );
    }
  }

  async getIndex(): Promise<string> {
    const cacheKey = `index:${this.baseUrl}`;
    const cached = this.cache.get<string>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    const url = `${this.baseUrl}${SORA_WWW_DOCS.llmsTxtPath}`;
    const content = await this.fetchText(url);
    this.cache.set(cacheKey, content);
    return content;
  }

  async getFullContent(): Promise<string> {
    const cacheKey = `full:${this.baseUrl}`;
    const cached = this.cache.get<string>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    const url = `${this.baseUrl}${SORA_WWW_DOCS.llmsFullTxtPath}`;
    const content = await this.fetchText(url);
    this.cache.set(cacheKey, content);
    return content;
  }

  async listSections(): Promise<DocSection[]> {
    const cacheKey = `sections:${this.baseUrl}`;
    const cached = this.cache.get<DocSection[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    const index = await this.getIndex();
    const { sections } = parseLlmsTxt(index, this.baseUrl);
    this.cache.set(cacheKey, sections);
    return sections;
  }

  async search(
    query: string,
    options?: DocSearchOptions
  ): Promise<DocSearchResult[]> {
    const limit = Math.min(options?.limit ?? 10, 25);
    const section = options?.section?.trim().toLowerCase();

    // If section matches top-level LLM categories, search full and filter
    if (
      section === "documentation" ||
      section === "components" ||
      section === "catalog" ||
      section === "motion" ||
      section === "ui"
    ) {
      const results = await this.rawSearch(query, {
        ...options,
        section: undefined,
      });
      return filterByLlmsSection(results, section as LlmsSection, limit);
    }

    return this.rawSearch(query, options);
  }

  private async rawSearch(
    query: string,
    options?: DocSearchOptions
  ): Promise<DocSearchResult[]> {
    const limit = Math.min(options?.limit ?? 10, 25);
    const section = options?.section;
    const cacheKey = `search:${query}:${section ?? ""}:${limit}`;
    const cached = this.cache.get<DocSearchResult[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const results = await this.fumadocsSearch(query, section, limit);
      this.cache.set(cacheKey, results);
      return results;
    } catch {
      // Fall back to local search in llms-full.txt
      try {
        const fullContent = await this.getFullContent();
        const results = this.localSearch(fullContent, query, section, limit);
        this.cache.set(cacheKey, results);
        return results;
      } catch (error) {
        throw new DocSourceError(
          `Search failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  private async fumadocsSearch(
    query: string,
    section: string | undefined,
    limit: number
  ): Promise<DocSearchResult[]> {
    const params = new URLSearchParams({ query });
    if (section) {
      params.set("tag", section);
    }
    const url = `${this.baseUrl}${SORA_WWW_DOCS.searchEndpoint}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new DocSourceError(
        `Fumadocs search returned ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as Array<{
      content?: string;
      id?: string;
      structured?: { heading?: string };
      url?: string;
    }>;

    if (!Array.isArray(data)) {
      throw new DocSourceError("Search API response is not an array");
    }

    return data.slice(0, limit).map((item, index) => {
      const slug = item.url ? trimSlug(item.url) : (item.id ?? "");
      const pageUrl = item.url?.startsWith("http")
        ? item.url
        : `${this.baseUrl}${item.url || item.id}`;

      return {
        slug,
        url: pageUrl,
        title: item.structured?.heading || this.titleFromSlug(slug),
        snippet: item.content?.slice(0, 200) || "",
        section: item.structured?.heading,
        score: 1 - index / Math.max(data.length, 1),
      };
    });
  }

  private localSearch(
    fullContent: string,
    query: string,
    section: string | undefined,
    limit: number
  ): DocSearchResult[] {
    const pageBlocks = this.splitIntoPageBlocks(fullContent);
    const queryTerms = query
      .toLowerCase()
      .split(QUERY_SPLIT_REGEX)
      .filter((t) => t.length > 0);

    if (queryTerms.length === 0) {
      return [];
    }

    const scored: DocSearchResult[] = [];

    for (const block of pageBlocks) {
      if (section && block.section?.toLowerCase() !== section.toLowerCase()) {
        continue;
      }

      const contentLower = block.content.toLowerCase();
      const titleLower = block.title.toLowerCase();

      let score = 0;
      let matchCount = 0;

      for (const term of queryTerms) {
        const titleMatches = countOccurrences(titleLower, term);
        const contentMatches = countOccurrences(contentLower, term);
        if (titleMatches > 0 || contentMatches > 0) {
          matchCount++;
          score += titleMatches * 3 + contentMatches;
        }
      }

      if (matchCount === 0) {
        continue;
      }

      const normalizedScore = Math.min(
        1,
        (matchCount / queryTerms.length) * 0.5 + score / (score + 10)
      );

      const snippet = this.extractSnippet(block.content, queryTerms);
      scored.push({
        slug: block.slug,
        url: block.url,
        title: block.title,
        description: block.description,
        snippet,
        section: block.section,
        score: normalizedScore,
      });
    }

    scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return scored.slice(0, limit);
  }

  private splitIntoPageBlocks(fullContent: string) {
    const blocks: Array<{
      content: string;
      description?: string;
      section?: string;
      slug: string;
      title: string;
      url: string;
    }> = [];

    const matches: Array<{ index: number; title: string; url: string }> = [];
    let match: RegExpExecArray | null = HEADER_PATTERN.exec(fullContent);

    while (match !== null) {
      matches.push({
        title: match[1].trim(),
        url: match[2]?.trim() || "",
        index: match.index,
      });
      match = HEADER_PATTERN.exec(fullContent);
    }

    for (let i = 0; i < matches.length; i++) {
      const start =
        matches[i].index +
        fullContent.slice(matches[i].index).indexOf("\n") +
        1;
      const end =
        i + 1 < matches.length ? matches[i + 1].index : fullContent.length;
      const content = fullContent.slice(start, end).trim();
      const slug = trimSlug(matches[i].url);

      blocks.push({
        title: matches[i].title,
        url: matches[i].url,
        slug,
        content,
      });
    }

    return blocks;
  }

  private extractSnippet(content: string, queryTerms: string[]): string {
    const contentLower = content.toLowerCase();
    let bestPos = -1;

    for (const term of queryTerms) {
      const pos = contentLower.indexOf(term);
      if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
        bestPos = pos;
      }
    }

    if (bestPos === -1) {
      return content.slice(0, 200);
    }

    const snippetStart = Math.max(0, bestPos - 80);
    const snippetEnd = Math.min(content.length, bestPos + 120);
    let snippet = content.slice(snippetStart, snippetEnd).trim();

    if (snippetStart > 0) {
      snippet = `...${snippet}`;
    }
    if (snippetEnd < content.length) {
      snippet = `${snippet}...`;
    }

    return snippet;
  }

  private titleFromSlug(slug: string): string {
    const last = slug.split("/").pop() || slug;
    return last.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  async getPage(slug: string): Promise<DocPage | null> {
    const trimmedSlug = trimSlug(slug);
    const cacheKey = `page:${cacheKeyForSlug(trimmedSlug)}`;
    const cached = this.cache.get<DocPage>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    for (const { fetchPath, pagePath } of buildMdxCandidates(trimmedSlug)) {
      try {
        const content = await this.fetchText(`${this.baseUrl}${fetchPath}`);
        const titleMatch = content.match(FIRST_HEADING);
        const page: DocPage = {
          slug: cacheKeyForSlug(trimmedSlug),
          url: `${this.baseUrl}${pagePath}`,
          title: titleMatch?.[1].trim() ?? cacheKeyForSlug(trimmedSlug),
          content,
        };

        this.cache.set(cacheKey, page);
        return page;
      } catch {
        // Continue checking other candidate URLs
      }
    }

    // Fallback: search in llms-full.txt
    try {
      const fullContent = await this.getFullContent();
      const blocks = this.splitIntoPageBlocks(fullContent);
      for (const block of blocks) {
        if (
          block.slug === trimmedSlug ||
          block.url.endsWith(`/${trimmedSlug}`)
        ) {
          const page: DocPage = {
            slug: trimmedSlug,
            url: block.url,
            title: block.title,
            content: block.content,
            section: block.section,
          };
          this.cache.set(cacheKey, page);
          return page;
        }
      }
    } catch {
      // Ignore
    }

    return null;
  }
}

export const soraDocsSource = new SoraDocsSource();
