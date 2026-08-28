import { existsSync } from "node:fs";
import path from "node:path";

const REPO_MARKERS = ["bun.lock", "turbo.json"] as const;

export function findRepoRoot(startDir = process.cwd()): string {
  let current = path.resolve(startDir);

  while (true) {
    if (
      REPO_MARKERS.every((marker) => existsSync(path.join(current, marker)))
    ) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(
        "Could not find Sora UI monorepo root (expected bun.lock and turbo.json)."
      );
    }
    current = parent;
  }
}

export function getWwwRoot(repoRoot = findRepoRoot()): string {
  return path.join(repoRoot, "apps", "www");
}

export const PRIMITIVE_CATEGORIES = [
  "texts",
  "buttons",
  "disclosure",
  "effects",
  "animate",
] as const;

export type PrimitiveCategory = (typeof PRIMITIVE_CATEGORIES)[number];

export const CATEGORY_SECTIONS: Record<PrimitiveCategory, string> = {
  texts: "---Texts---",
  buttons: "---Buttons---",
  disclosure: "---Disclosure---",
  effects: "---Effects---",
  animate: "---Animate---",
};

export function sectionForCategory(category: PrimitiveCategory): string {
  return CATEGORY_SECTIONS[category];
}

export interface PrimitivePaths {
  category: PrimitiveCategory;
  componentName: string;
  demoDir: string;
  demoIndexPath: string;
  demoRegistryItemPath: string;
  mdxPath: string;
  metaJsonPath: string;
  primitiveDir: string;
  primitiveIndexPath: string;
  primitiveRegistryItemPath: string;
  wwwRoot: string;
}

export function getPrimitivePaths(
  wwwRoot: string,
  category: PrimitiveCategory,
  name: string
): PrimitivePaths {
  const primitiveDir = path.join(
    wwwRoot,
    "registry",
    "primitives",
    category,
    name
  );
  const demoDir = path.join(
    wwwRoot,
    "registry",
    "demo",
    "primitives",
    category,
    name
  );

  return {
    wwwRoot,
    category,
    componentName: name,
    primitiveDir,
    primitiveIndexPath: path.join(primitiveDir, "index.tsx"),
    primitiveRegistryItemPath: path.join(primitiveDir, "registry-item.json"),
    demoDir,
    demoIndexPath: path.join(demoDir, "index.tsx"),
    demoRegistryItemPath: path.join(demoDir, "registry-item.json"),
    mdxPath: path.join(wwwRoot, "content", "docs", "motion", `${name}.mdx`),
    metaJsonPath: path.join(wwwRoot, "content", "docs", "motion", "meta.json"),
  };
}
