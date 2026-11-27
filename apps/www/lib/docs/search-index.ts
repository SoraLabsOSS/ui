import type { OramaDocument } from "fumadocs-core/search/orama-cloud";
import type { AdvancedIndex } from "fumadocs-core/search/server";
import type { InferPageType } from "fumadocs-core/source";

import { staticContentCacheLife } from "@/lib/cache-life";
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
  | InferPageType<typeof uiSource>;

function getSearchTag(page: SearchablePage): string {
  if (page.url === "/ui" || page.url.startsWith("/ui/")) {
    return "ui";
  }

  if (page.url === "/motion" || page.url.startsWith("/motion/")) {
    return "motion";
  }

  if (page.url === "/icons" || page.url.startsWith("/icons/")) {
    return "icons";
  }

  if (page.url === "/blocks" || page.url.startsWith("/blocks/")) {
    return "blocks";
  }

  return page.slugs[0] ?? "docs";
}

function pageToAdvancedIndex(page: SearchablePage): AdvancedIndex {
  if (!("structuredData" in page.data)) {
    throw new Error(
      `Cannot index page ${page.url}: structuredData is missing.`
    );
  }

  const { structuredData } = page.data;
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

  return [
    ...docPages,
    ...motionPages,
    ...iconsPages,
    ...uiPages,
    ...componentPages,
  ];
}

export function getSearchIndexes(): AdvancedIndex[] {
  return getSearchablePages().map(pageToAdvancedIndex);
}

export function getStaticPageDocuments(): Omit<OramaDocument, "structured">[] {
  return getSearchablePages().map((page) => ({
    id: page.url,
    tag: getSearchTag(page),
    url: page.url,
    title: getUiQualifiedTitle(page.data.title, page.url),
    description: page.data.description,
  }));
}

export async function getCachedSearchIndexes() {
  "use cache";
  staticContentCacheLife();
  return await Promise.resolve(getSearchIndexes());
}

export async function getCachedStaticPageDocuments() {
  "use cache";
  staticContentCacheLife();
  return await Promise.resolve(getStaticPageDocuments());
}
