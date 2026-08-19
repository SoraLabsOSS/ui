import { createSearchAPI } from "fumadocs-core/search/server";
import { getCachedSearchIndexes } from "@/lib/docs/cached/search-index";

let searchApiPromise: Promise<ReturnType<typeof createSearchAPI>> | null = null;

function getSearchAPI() {
  if (!searchApiPromise) {
    searchApiPromise = getCachedSearchIndexes().then((indexes) =>
      createSearchAPI("advanced", {
        // https://docs.orama.com/open-source/supported-languages
        language: "english",
        indexes,
      })
    );
  }
  return searchApiPromise;
}

export async function GET(request: Request) {
  const { GET: searchGET } = await getSearchAPI();
  const response = await searchGET(request);

  if (response.ok) {
    const headers = new Headers(response.headers);
    headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400"
    );
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
}
