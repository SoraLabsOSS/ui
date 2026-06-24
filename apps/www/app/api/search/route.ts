import { createSearchAPI } from "fumadocs-core/search/server";
import { getCachedSearchIndexes } from "@/lib/docs/cached/search-index";

export async function GET(request: Request) {
  const indexes = await getCachedSearchIndexes();
  const { GET: searchGET } = createSearchAPI("advanced", {
    // https://docs.orama.com/open-source/supported-languages
    language: "english",
    indexes,
  });
  return searchGET(request);
}
