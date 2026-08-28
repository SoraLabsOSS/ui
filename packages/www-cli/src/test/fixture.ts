import { access, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PrimitiveCategory } from "../lib/paths.js";
import { findRepoRoot, getPrimitivePaths, getWwwRoot } from "../lib/paths.js";

export const FIXTURE_NAME = "www-cli-automated-fixture";

export function getRepoRoot(): string {
  return findRepoRoot(path.resolve(import.meta.dir, "../.."));
}

export function getWwwRootFromRepo(repoRoot = getRepoRoot()): string {
  return getWwwRoot(repoRoot);
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function cleanupPrimitiveFixture(
  category: PrimitiveCategory,
  name = FIXTURE_NAME,
  repoRoot = getRepoRoot()
): Promise<void> {
  const wwwRoot = getWwwRootFromRepo(repoRoot);
  const paths = getPrimitivePaths(wwwRoot, category, name);

  await rm(paths.primitiveDir, { recursive: true, force: true });
  await rm(paths.demoDir, { recursive: true, force: true });
  await rm(paths.mdxPath, { force: true });

  if (!(await pathExists(paths.metaJsonPath))) {
    return;
  }

  const meta = JSON.parse(await readFile(paths.metaJsonPath, "utf-8")) as {
    pages: string[];
  };
  meta.pages = meta.pages.filter((page) => page !== name);
  await writeFile(paths.metaJsonPath, `${JSON.stringify(meta, null, 2)}\n`);
}
