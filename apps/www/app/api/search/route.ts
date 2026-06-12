import { createSearchAPI } from "fumadocs-core/search/server";
import { getSearchIndexes } from "@/lib/docs/search-index";

export const { GET } = createSearchAPI("advanced", {
  // https://docs.orama.com/open-source/supported-languages
  language: "english",
  indexes: getSearchIndexes(),
});
