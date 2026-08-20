import {
  type DocPage,
  type DocSearchOptions,
  type DocSearchResult,
  FumadocsRemoteSource,
  type FumadocsRemoteSourceConfig,
} from "@mcpframework/docs";
import { logger } from "mcp-framework";
import { DOCS_CACHE_TTL_MS, docsCache } from "./docs-cache.js";

/** Also used by `registry/sora-registry-source.ts` — same host serves `/r/registry.json`. */
export const DOCS_BASE_URL =
  process.env.DOCS_BASE_URL?.replace(/\/+$/, "") ?? "https://ui.soralabs.io.vn";

/** Matches `apps/www/app` LLM + search routes. */
const SORA_WWW_DOCS = {
  searchEndpoint: "/api/search",
  llmsTxtPath: "/llms.txt",
  llmsFullTxtPath: "/llms-full.txt",
} as const;

const LEADING_SLASHES = /^\/+/;
const TRAILING_SLASHES = /\/+$/;
const DOCS_PREFIX = /^docs\//;
const COMPONENTS_PREFIX = "components/";
const CATALOG_PREFIX = "catalog/";
const MOTION_PREFIX = "motion/";
const UI_PREFIX = "ui/";
const FIRST_HEADING = /^#\s+(.+)$/m;

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

/**
 * Resolve fetch URLs for Sora www:
 * - Public `.mdx` URLs rewrite to `llms.mdx` / `llms-catalog.mdx` / `llms-ui.mdx` (next.config.ts)
 * - Direct `llms*.mdx/{slug}` routes are a fallback without the `.mdx` suffix
 */
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

/**
 * Sora UI docs: Fumadocs `/docs/*`, UI kit `/ui/*`, component catalog `/catalog/*`,
 * LLM exports via `llms.mdx` / `llms-catalog.mdx` / `llms-ui.mdx`.
 */
export class SoraDocsSource extends FumadocsRemoteSource {
  constructor(config: Partial<FumadocsRemoteSourceConfig> = {}) {
    super({
      baseUrl: DOCS_BASE_URL,
      ...SORA_WWW_DOCS,
      cache: docsCache,
      refreshInterval: DOCS_CACHE_TTL_MS,
      ...config,
    });
  }

  override async search(
    query: string,
    options?: DocSearchOptions
  ): Promise<DocSearchResult[]> {
    const limit = Math.min(options?.limit ?? 10, 25);
    const section = options?.section?.trim().toLowerCase();

    // `list_sections` uses "Documentation" / "UI" / "Catalog" / "Motion"; Orama `tag` uses page slugs.
    if (
      section === "documentation" ||
      section === "components" ||
      section === "catalog" ||
      section === "motion" ||
      section === "ui"
    ) {
      const results = await super.search(query, {
        ...options,
        section: undefined,
      });
      return filterByLlmsSection(results, section as LlmsSection, limit);
    }

    return super.search(query, options);
  }

  override async getPage(slug: string): Promise<DocPage | null> {
    const trimmedSlug = trimSlug(slug);
    const cacheKey = `page:${cacheKeyForSlug(trimmedSlug)}`;
    const cached = await this.cache.get<DocPage>(cacheKey);

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

        // Only cached on success — a failed lookup never poisons the cache
        // with a negative result, so a page added later is picked up on
        // the very next request (no stale 24h "not found").
        await this.cache.set(cacheKey, page);
        return page;
      } catch (error) {
        // Expected: trying multiple candidate paths, most will 404.
        logger.debug(
          `getPage candidate failed (${fetchPath}): ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    const fallback = await super.getPage(slug);
    if (!fallback) {
      logger.warn(`getPage: no candidate matched for slug "${trimmedSlug}"`);
    }
    return fallback;
  }
}

export const soraDocsSource = new SoraDocsSource();
