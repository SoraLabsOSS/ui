import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import type { DiagnosticIssue } from "./types.js";

const MDX_EXT_RE = /\.mdx$/;

interface MetaFileConfig {
  dirRel: string;
  metaRel: string;
  recursive: boolean;
}

const META_CONFIGS: MetaFileConfig[] = [
  {
    metaRel: "content/docs/motion/meta.json",
    dirRel: "content/docs/motion",
    recursive: false,
  },
  {
    metaRel: "content/ui/meta.json",
    dirRel: "content/ui",
    recursive: true,
  },
  {
    metaRel: "content/catalog/meta.json",
    dirRel: "content/catalog",
    recursive: false,
  },
];

interface MetaJsonData {
  pages?: string[];
}

/**
 * Finds all .mdx files within a directory.
 */
async function findMdxFiles(
  dir: string,
  recursive = false,
  baseDir = dir
): Promise<string[]> {
  const results: string[] = [];
  if (!existsSync(dir)) {
    return results;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && recursive) {
      results.push(...(await findMdxFiles(fullPath, recursive, baseDir)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      const rel = path.relative(baseDir, fullPath).replaceAll("\\", "/");
      results.push(rel.replace(MDX_EXT_RE, ""));
    }
  }

  return results;
}

async function checkSingleMetaConfig(
  wwwRoot: string,
  config: MetaFileConfig
): Promise<{
  issues: DiagnosticIssue[];
  mdxFilesChecked: number;
  metaPagesChecked: number;
}> {
  const issues: DiagnosticIssue[] = [];
  const metaPath = path.join(wwwRoot, config.metaRel);
  const dirPath = path.join(wwwRoot, config.dirRel);

  if (!existsSync(metaPath)) {
    if (existsSync(dirPath)) {
      issues.push({
        category: "meta-json",
        severity: "error",
        file: config.metaRel,
        message: `Metadata file "${config.metaRel}" does not exist.`,
        fix: `Create "${config.metaRel}" with a "pages" array.`,
      });
    }
    return { issues, metaPagesChecked: 0, mdxFilesChecked: 0 };
  }

  let meta: MetaJsonData;
  try {
    const raw = await fs.readFile(metaPath, "utf-8");
    meta = JSON.parse(raw) as MetaJsonData;
  } catch {
    issues.push({
      category: "meta-json",
      severity: "error",
      file: config.metaRel,
      message: `Failed to parse JSON in "${config.metaRel}".`,
      fix: "Check that the file contains valid JSON syntax.",
    });
    return { issues, metaPagesChecked: 0, mdxFilesChecked: 0 };
  }

  const pages = (meta.pages ?? []).filter(
    (slug) => !slug.startsWith("---") && slug.trim().length > 0
  );
  const registeredSet = new Set(pages);

  // 1. Check that every page in meta.json exists on disk
  for (const slug of pages) {
    const expectedMdxPath = path.join(dirPath, `${slug}.mdx`);
    const relExpected = path
      .relative(wwwRoot, expectedMdxPath)
      .replaceAll("\\", "/");

    if (!existsSync(expectedMdxPath)) {
      issues.push({
        category: "meta-json",
        severity: "error",
        file: config.metaRel,
        message: `Page "${slug}" registered in "${config.metaRel}" does not exist on disk at "${relExpected}".`,
        fix: `Create "${relExpected}" or remove "${slug}" from "${config.metaRel}".`,
      });
    }
  }

  // 2. Check that every .mdx file on disk is registered in meta.json
  const diskSlugs = await findMdxFiles(dirPath, config.recursive);

  for (const diskSlug of diskSlugs) {
    if (diskSlug === "index") {
      continue;
    }

    if (!registeredSet.has(diskSlug)) {
      const diskMdxRel = path
        .relative(wwwRoot, path.join(dirPath, `${diskSlug}.mdx`))
        .replaceAll("\\", "/");

      issues.push({
        category: "meta-json",
        severity: "warning",
        file: diskMdxRel,
        message: `MDX file "${diskMdxRel}" exists on disk but is not registered in "${config.metaRel}".`,
        fix: `Add "${diskSlug}" to the "pages" array in "${config.metaRel}".`,
      });
    }
  }

  return {
    issues,
    metaPagesChecked: pages.length,
    mdxFilesChecked: diskSlugs.length,
  };
}

export interface CheckMetaJsonResult {
  issues: DiagnosticIssue[];
  mdxFilesChecked: number;
  metaPagesChecked: number;
}

/**
 * Validates bidirectional sync between meta.json pages arrays and .mdx files on disk.
 */
export async function checkMetaJson(
  wwwRoot: string
): Promise<CheckMetaJsonResult> {
  const allIssues: DiagnosticIssue[] = [];
  let totalMetaPages = 0;
  let totalMdxFiles = 0;

  for (const config of META_CONFIGS) {
    const result = await checkSingleMetaConfig(wwwRoot, config);
    allIssues.push(...result.issues);
    totalMetaPages += result.metaPagesChecked;
    totalMdxFiles += result.mdxFilesChecked;
  }

  return {
    issues: allIssues,
    metaPagesChecked: totalMetaPages,
    mdxFilesChecked: totalMdxFiles,
  };
}
