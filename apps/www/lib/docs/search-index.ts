import type { OramaDocument } from "fumadocs-core/search/orama-cloud";
import type { AdvancedIndex } from "fumadocs-core/search/server";
import type { InferPageType } from "fumadocs-core/source";
import { blog } from "@/lib/blog/source";
import { source } from "@/lib/docs/source";
import { iconsSource } from "@/lib/icons/source";
import { motionSource } from "@/lib/motion/source";
import { componentSource } from "@/lib/registry/component-source";
import { uiSource } from "@/lib/ui/source";
import { getUiQualifiedTitle } from "@/lib/ui/ui-family";

type SearchablePage =
  | InferPageType<typeof source>
  | InferPageType<typeof motionSource>
  | InferPageType<typeof iconsSource>
  | InferPageType<typeof componentSource>
  | InferPageType<typeof uiSource>
  | InferPageType<typeof blog>;

function getSearchTag(page: SearchablePage): string {
  if (page.url === "/blog" || page.url.startsWith("/blog/")) {
    return "blog";
  }

  if (page.url === "/ui" || page.url.startsWith("/ui/")) {
    return "ui";
  }

  if (page.url === "/motion" || page.url.startsWith("/motion/")) {
    return "motion";
  }

  if (page.url === "/icons" || page.url.startsWith("/icons/")) {
    return "icons";
  }

  if (page.url === "/catalog" || page.url.startsWith("/catalog/")) {
    return "catalog";
  }

  return page.slugs[0] ?? "docs";
}

function pageToAdvancedIndex(page: SearchablePage): AdvancedIndex {
  if (!("structuredData" in page.data)) {
    throw new Error(
      `Cannot index page ${page.url}: structuredData is missing.`
    );
  }

  const structuredData = page.data.structuredData;
  const title = getUiQualifiedTitle(
    page.data.title ?? page.slugs.at(-1) ?? page.url,
    page.url
  );

  return {
    title,
    description: "description" in page.data ? page.data.description : undefined,
    url: page.url,
    id: page.url,
    structuredData,
    tag: getSearchTag(page),
  };
}

export function getSearchablePages(): SearchablePage[] {
  const docPages = source
    .getPages()
    .filter((page) => page.slugs[0] !== "openapi");
  const motionPages = motionSource.getPages();
  const iconsPages = iconsSource.getPages();
  const componentPages = componentSource.getPages();
  const uiPages = uiSource.getPages();
  const blogPages = blog
    .getPages()
    .filter((page) => !(page.data.hidden || page.data.subpage));

  return [
    ...docPages,
    ...motionPages,
    ...iconsPages,
    ...uiPages,
    ...componentPages,
    ...blogPages,
  ];
}

export function getSearchIndexes(): AdvancedIndex[] {
  return getSearchablePages().map(pageToAdvancedIndex);
}

export function getStaticSearchDocuments(): OramaDocument[] {
  return getSearchablePages().map((page) => {
    if (!("structuredData" in page.data)) {
      throw new Error(
        `Cannot index page ${page.url}: structuredData is missing.`
      );
    }

    return {
      id: page.url,
      structured: page.data.structuredData,
      tag: getSearchTag(page),
      url: page.url,
      title: getUiQualifiedTitle(page.data.title, page.url),
      description: page.data.description,
    } satisfies OramaDocument;
  });
}
