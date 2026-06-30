import type { MDXComponents } from "mdx/types";
import { SoraTypeTable } from "@/components/docs/sora-type-table";

/** MDX overrides for catalog pages — preview lives in the sticky panel. */
export function getCatalogMDXComponents(
  components?: MDXComponents
): MDXComponents {
  return {
    ...components,
    ComponentPreview: () => null,
    TypeTable: SoraTypeTable,
  };
}
