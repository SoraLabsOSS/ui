import type { InferPageType } from "fumadocs-core/source";
import type { MetadataRoute } from "next";
import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";
import { SITE_URL } from "@/lib/site";

type ContentPage =
  | InferPageType<typeof source>
  | InferPageType<typeof componentSource>;

function toLastModified(value: Date | string | number | undefined) {
  if (!value) {
    return;
  }

  return new Date(value);
}

function contentPageToEntry(
  page: ContentPage,
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${page.url}`,
    lastModified: toLastModified(page.data.lastModified),
    changeFrequency: "weekly",
    priority,
  };
}

const LEGAL_ENTRIES: MetadataRoute.Sitemap = [
  {
    url: `${SITE_URL}/legal/privacy`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/legal/terms`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  staticContentCacheLife();

  const docEntries = source
    .getPages()
    .filter((page) => page.slugs[0] !== "openapi")
    .map((page) => contentPageToEntry(page, page.url === "/docs" ? 0.9 : 0.7));

  const componentEntries = componentSource
    .getPages()
    .map((page) => contentPageToEntry(page, 0.75));

  return await Promise.resolve([
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...docEntries,
    {
      url: `${SITE_URL}/components`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...componentEntries,
    ...LEGAL_ENTRIES,
  ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await buildSitemap();
}
