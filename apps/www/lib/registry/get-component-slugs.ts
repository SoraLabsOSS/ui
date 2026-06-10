import { componentSource } from "@/lib/registry/component-source";

/** Slugs for catalog pages under `content/components/`. */
export function getComponentSlugs(): string[] {
  return componentSource.getPages().map((page) => page.slugs.join("/"));
}
