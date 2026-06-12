import {
  type DocPage,
  FumadocsRemoteSource,
  type FumadocsRemoteSourceConfig,
} from "@mcpframework/docs";
import { DOCS_CACHE_TTL_MS, docsCache } from "./docs-cache.js";

const DOCS_BASE_URL =
  process.env.DOCS_BASE_URL?.replace(/\/+$/, "") ?? "https://ui.soralabs.io.vn";

const LEADING_SLASHES = /^\/+/;
const TRAILING_SLASHES = /\/+$/;
const DOCS_PREFIX = /^docs\//;
const MDX_EXTENSION = /\.mdx$/;
const FIRST_HEADING = /^#\s+(.+)$/m;

/**
 * Sora UI docs live under `/docs/...` and `/components/...`.
 * `@mcpframework/docs` strips a `docs/` prefix and uses a single MDX prefix,
 * so we try both URL shapes before falling back to the package defaults.
 */
export class SoraDocsSource extends FumadocsRemoteSource {
  constructor(config: Partial<FumadocsRemoteSourceConfig> = {}) {
    super({
      baseUrl: DOCS_BASE_URL,
      cache: docsCache,
      refreshInterval: DOCS_CACHE_TTL_MS,
      ...config,
    });
  }

  override async getPage(slug: string): Promise<DocPage | null> {
    const trimmedSlug = slug
      .replace(LEADING_SLASHES, "")
      .replace(TRAILING_SLASHES, "");
    const normalizedSlug = trimmedSlug.replace(DOCS_PREFIX, "");
    const cacheKey = `page:${normalizedSlug}`;
    const cached = await this.cache.get<DocPage>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const mdxPaths = new Set<string>([
      `/docs/${normalizedSlug}.mdx`,
      `/${normalizedSlug}.mdx`,
    ]);

    if (trimmedSlug.startsWith("docs/")) {
      mdxPaths.add(`/${trimmedSlug}.mdx`);
    }

    for (const path of mdxPaths) {
      try {
        const content = await this.fetchText(`${this.baseUrl}${path}`);
        const titleMatch = content.match(FIRST_HEADING);
        const page: DocPage = {
          slug: normalizedSlug,
          url: `${this.baseUrl}${path.replace(MDX_EXTENSION, "")}`,
          title: titleMatch?.[1].trim() ?? normalizedSlug,
          content,
        };

        await this.cache.set(cacheKey, page);
        return page;
      } catch {
        // Try the next candidate path.
      }
    }

    return super.getPage(slug);
  }
}

export const soraDocsSource = new SoraDocsSource();
