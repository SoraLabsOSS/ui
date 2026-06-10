import { source } from "@/lib/docs/source";

const COMPONENTS_PREFIX = "/docs/components/";

/** Slugs for catalog component docs under `content/docs/components/`. */
export function getComponentSlugs(): string[] {
  return source
    .getPages()
    .map((page) => {
      if (!page.url.startsWith(COMPONENTS_PREFIX)) {
        return null;
      }
      return page.url.slice(COMPONENTS_PREFIX.length);
    })
    .filter((slug): slug is string => Boolean(slug));
}
