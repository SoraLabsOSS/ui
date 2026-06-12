import type { OramaDocument } from "fumadocs-core/search/orama-cloud";
import type { AdvancedIndex } from "fumadocs-core/search/server";
import type { InferPageType } from "fumadocs-core/source";
import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";

type SearchablePage =
  | InferPageType<typeof source>
  | InferPageType<typeof componentSource>;

function pageToAdvancedIndex(page: SearchablePage): AdvancedIndex {
  if (!("structuredData" in page.data)) {
    throw new Error(
      `Cannot index page ${page.url}: structuredData is missing.`
    );
  }

  const structuredData = page.data.structuredData;

  return {
    title: page.data.title ?? page.slugs.at(-1) ?? page.url,
    description: "description" in page.data ? page.data.description : undefined,
    url: page.url,
    id: page.url,
    structuredData,
    tag: page.slugs[0],
  };
}

export function getSearchablePages(): SearchablePage[] {
  const docPages = source
    .getPages()
    .filter((page) => page.slugs[0] !== "openapi");
  const componentPages = componentSource.getPages();

  return [...docPages, ...componentPages];
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
      tag: page.slugs[0],
      url: page.url,
      title: page.data.title,
      description: page.data.description,
    } satisfies OramaDocument;
  });
}
