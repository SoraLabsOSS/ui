import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { extractExports } from "./extract-exports.js";
import type { DiagnosticIssue } from "./types.js";

interface RegistryItemLike {
  files?: Array<{ path?: string }>;
  meta?: {
    demoProps?: Record<string, Record<string, unknown>>;
  };
  name?: string;
}

/**
 * Finds all registry-item.json files within a directory recursively.
 */
async function findRegistryItemFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  if (!existsSync(dir)) {
    return results;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findRegistryItemFiles(fullPath)));
    } else if (entry.isFile() && entry.name === "registry-item.json") {
      results.push(fullPath);
    }
  }

  return results;
}

function resolveSourcePath(
  wwwRoot: string,
  jsonPath: string,
  parsed: RegistryItemLike
): string {
  if (parsed.files?.[0]?.path) {
    return path.isAbsolute(parsed.files[0].path)
      ? parsed.files[0].path
      : path.join(wwwRoot, parsed.files[0].path);
  }
  return path.join(path.dirname(jsonPath), "index.tsx");
}

async function validateSingleItemDemoProps(
  wwwRoot: string,
  jsonPath: string,
  parsed: RegistryItemLike,
  demoProps: Record<string, Record<string, unknown>>
): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  const keys = Object.keys(demoProps);
  const relJsonPath = path.relative(wwwRoot, jsonPath).replaceAll("\\", "/");
  const sourcePath = resolveSourcePath(wwwRoot, jsonPath, parsed);
  const relSourcePath = path
    .relative(wwwRoot, sourcePath)
    .replaceAll("\\", "/");

  if (!existsSync(sourcePath)) {
    issues.push({
      category: "demo-props",
      severity: "error",
      file: relJsonPath,
      message: `Primary source file "${relSourcePath}" referenced by "${parsed.name ?? relJsonPath}" does not exist.`,
      fix: `Create the missing source file at "${relSourcePath}".`,
    });
    return issues;
  }

  let sourceContent = "";
  try {
    sourceContent = await fs.readFile(sourcePath, "utf-8");
  } catch {
    issues.push({
      category: "demo-props",
      severity: "error",
      file: relSourcePath,
      message: `Could not read source file "${relSourcePath}".`,
    });
    return issues;
  }

  const exportedNames = extractExports(sourceContent);
  const availableExports =
    exportedNames.size > 0
      ? [...exportedNames].join(", ")
      : "no exported components found";

  for (const key of keys) {
    if (!exportedNames.has(key)) {
      issues.push({
        category: "demo-props",
        severity: "error",
        file: relJsonPath,
        message: `meta.demoProps key "${key}" does not match any exported component in "${relSourcePath}". Available exports: [${availableExports}].`,
        fix: `Update meta.demoProps key to match one of [${availableExports}], or export "${key}" in "${relSourcePath}".`,
      });
    }
  }

  return issues;
}

export interface CheckDemoPropsResult {
  demoPropsChecked: number;
  issues: DiagnosticIssue[];
}

/**
 * Validates that all keys in meta.demoProps match an exported identifier
 * in the component's primary source file.
 */
export async function checkDemoProps(
  wwwRoot: string
): Promise<CheckDemoPropsResult> {
  const issues: DiagnosticIssue[] = [];
  let demoPropsChecked = 0;

  const registryDir = path.join(wwwRoot, "registry");
  const registryItemFiles = await findRegistryItemFiles(registryDir);

  for (const jsonPath of registryItemFiles) {
    const relJsonPath = path.relative(wwwRoot, jsonPath).replaceAll("\\", "/");
    let parsed: RegistryItemLike;

    try {
      const content = await fs.readFile(jsonPath, "utf-8");
      parsed = JSON.parse(content) as RegistryItemLike;
    } catch {
      issues.push({
        category: "demo-props",
        severity: "error",
        file: relJsonPath,
        message: `Failed to read or parse JSON in "${relJsonPath}".`,
        fix: "Check that the file contains valid JSON syntax.",
      });
      continue;
    }

    const demoProps = parsed.meta?.demoProps;
    if (!demoProps || typeof demoProps !== "object") {
      continue;
    }

    const keys = Object.keys(demoProps);
    if (keys.length === 0) {
      continue;
    }

    demoPropsChecked += keys.length;
    const itemIssues = await validateSingleItemDemoProps(
      wwwRoot,
      jsonPath,
      parsed,
      demoProps
    );
    issues.push(...itemIssues);
  }

  return { issues, demoPropsChecked };
}
