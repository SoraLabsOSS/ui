import catalogMeta from "@/content/catalog/meta.json";
import { componentSource } from "@/lib/registry/component-source";

const SECTION_SEPARATOR = /^---.*---$/;

/** Slugs listed in `content/catalog/meta.json`, in catalog order. */
function getMetaComponentSlugs(): string[] {
  return (catalogMeta.pages ?? []).filter(
    (page) => !SECTION_SEPARATOR.test(page)
  );
}

/**
 * Slugs for catalog pages under `content/catalog/`.
 * Ordered and filtered by `meta.json` — only pages listed there appear in the
 * gallery, neighbours nav, and static params. Orphan MDX files are ignored
 * until added to meta.
 */
export function getComponentSlugs(): string[] {
  const existing = new Set(
    componentSource.getPages().map((page) => page.slugs.join("/"))
  );
  const fromMeta = getMetaComponentSlugs().filter((slug) => existing.has(slug));

  if (fromMeta.length > 0) {
    return fromMeta;
  }

  // Empty / missing meta — fall back to every discovered page.
  return [...existing];
}
