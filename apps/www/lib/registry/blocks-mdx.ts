import type { MDXComponents } from "mdx/types";

import { SoraTypeTable } from "@/components/docs/sora-type-table";

/** MDX overrides for blocks pages — preview lives in the sticky panel. */
export function getBlocksMDXComponents(
  components?: MDXComponents
): MDXComponents {
  return {
    ...components,
    ComponentPreview: () => null,
    TypeTable: SoraTypeTable,
  };
}
