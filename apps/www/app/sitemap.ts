import type { InferPageType } from "fumadocs-core/source";
import type { MetadataRoute } from "next";
import { blog } from "@/lib/blog/source";
import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";
import { SITE_URL } from "@/lib/site";
import { uiSource } from "@/lib/ui/source";

type ContentPage =
  | InferPageType<typeof source>
  | InferPageType<typeof componentSource>
  | InferPageType<typeof uiSource>;

type BlogPage = InferPageType<typeof blog>;

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

  const uiEntries = uiSource
    .getPages()
    .map((page) => contentPageToEntry(page, page.url === "/ui" ? 0.85 : 0.75));

  const visibleBlogPages = getVisibleBlogPages();
  const blogEntries = visibleBlogPages.map(blogPageToEntry);
  const latestBlogDate = getLatestBlogDate(visibleBlogPages);

  return await Promise.resolve([
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...docEntries,
    {
      url: `${SITE_URL}/motion`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/catalog`,
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
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...componentEntries,
    ...uiEntries,
    ...LEGAL_ENTRIES,
  ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await buildSitemap();
}
