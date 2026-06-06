import type { OramaDocument } from "fumadocs-core/search/orama-cloud";
import { NextResponse } from "next/server";
import { source } from "@/lib/docs/source";

async function getStaticSearchData() {
  "use cache";
  const pages = source.getPages();
  return pages
    .filter((page) => page.slugs[0] !== "openapi")
    .map((page) => {
      const { structuredData } = page.data;

      return {
        id: page.url,
        structured: structuredData,
        tag: page.slugs[0],
        url: page.url,
        title: page.data.title,
        description: page.data.description,
      } satisfies OramaDocument;
    });
}

export async function GET(): Promise<Response> {
  const results = await getStaticSearchData();
  return NextResponse.json(results);
}
