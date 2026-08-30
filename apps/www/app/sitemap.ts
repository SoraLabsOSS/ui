import type { InferPageType } from "fumadocs-core/source";
import type { MetadataRoute } from "next";
import { blog } from "@/lib/blog/source";
import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";
import { getLatestShippedRegistryItem } from "@/lib/registry/get-latest-shipped-registry-item";
import { SITE_URL } from "@/lib/site";
import { uiSource } from "@/lib/ui/source";

type ContentPage =
  | InferPageType<typeof source>
  | InferPageType<typeof componentSource>
  | InferPageType<typeof uiSource>;

type BlogPage = InferPageType<typeof blog>;

/** Keep in sync with `LAST_UPDATED` in legal policy articles. */
const LEGAL_LAST_UPDATED = new Date("2026-06-24");

function toLastModified(value: Date | string | number | undefined) {
  if (!value) {
    return;
  }

  return new Date(value);
}

function maxDate(...dates: Array<Date | undefined>) {
  let latest: Date | undefined;

  for (const date of dates) {
    if (date && (!latest || date > latest)) {
      latest = date;
    }
  }

  return latest;
}

function getLatestLastModified(
  pages: ReadonlyArray<{ data: { lastModified?: Date | string | number } }>
) {
  let latest: Date | undefined;

  for (const page of pages) {
    const date = toLastModified(page.data.lastModified);
    if (date && (!latest || date > latest)) {
      latest = date;
    }
  }

  return latest;
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

function blogPageToEntry(page: BlogPage): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${page.url}`,
    lastModified:
      toLastModified(page.data.lastModified) ?? toLastModified(page.data.date),
    changeFrequency: "monthly",
    priority: 0.65,
  };
}

function getVisibleBlogPages() {
  return blog
    .getPages()
    .filter((page) => !(page.data.hidden || page.data.subpage));
}

function getLatestBlogDate(pages: BlogPage[]) {
  let latest: Date | undefined;

  for (const page of pages) {
    const date =
      toLastModified(page.data.lastModified) ?? toLastModified(page.data.date);

    if (!date) {
      continue;
    }

    if (!latest || date > latest) {
      latest = date;
    }
  }

  return latest;
}

const LEGAL_ENTRIES: MetadataRoute.Sitemap = [
  {
    url: `${SITE_URL}/legal/privacy`,
    lastModified: LEGAL_LAST_UPDATED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/legal/terms`,
    lastModified: LEGAL_LAST_UPDATED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  staticContentCacheLife();

  const docPages = source
    .getPages()
    .filter((page) => page.slugs[0] !== "openapi");
  const docEntries = docPages.map((page) =>
    contentPageToEntry(page, page.url === "/docs" ? 0.9 : 0.7)
  );
  const latestDocDate = getLatestLastModified(docPages);

  const catalogPages = componentSource.getPages();
  const componentEntries = catalogPages.map((page) =>
    contentPageToEntry(page, 0.75)
  );
  const latestCatalogDate = getLatestLastModified(catalogPages);

  const uiPages = uiSource.getPages();
  const uiEntries = uiPages.map((page) =>
    contentPageToEntry(page, page.url === "/ui" ? 0.85 : 0.75)
  );
  const latestUiDate = getLatestLastModified(uiPages);

  const visibleBlogPages = getVisibleBlogPages();
  const blogEntries = visibleBlogPages.map(blogPageToEntry);
  const latestBlogDate = getLatestBlogDate(visibleBlogPages);

  const latestShipped = getLatestShippedRegistryItem();
  const latestContentDate = maxDate(
    latestDocDate,
    latestCatalogDate,
    latestUiDate,
    latestBlogDate
  );

  const rawEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: latestContentDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...docEntries,
    {
      url: `${SITE_URL}/catalog`,
      lastModified: latestCatalogDate,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: latestBlogDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogEntries,
    {
      url: `${SITE_URL}/pricing`,
      lastModified: latestShipped
        ? toLastModified(latestShipped.releasedAt)
        : latestContentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...componentEntries,
    ...uiEntries,
    ...LEGAL_ENTRIES,
  ];

  // Deduplicate by URL while preserving the highest priority entry
  const entryMap = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of rawEntries) {
    const existing = entryMap.get(entry.url);
    if (!existing || (entry.priority ?? 0) > (existing.priority ?? 0)) {
      entryMap.set(entry.url, entry);
    }
  }

  return await Promise.resolve(Array.from(entryMap.values()));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await buildSitemap();
}
