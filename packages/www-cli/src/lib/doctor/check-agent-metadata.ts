import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import type { DiagnosticIssue } from "./types.js";

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---/;
const FRONTMATTER_FIELD_RE = /^[A-Za-z][\w-]*:/;
const FRONTMATTER_LIST_RE = /^\s+-\s+/;
const REQUIRED_FIELDS = [
  "intent",
  "role",
  "a11yConstraints",
  "motionEngine",
  "compositionRules",
  "compositionRecipes",
] as const;

function hasNonEmptyFrontmatterValue(
  frontmatter: string,
  field: (typeof REQUIRED_FIELDS)[number]
): boolean {
  const lines = frontmatter.split("\n");
  const fieldIndex = lines.findIndex((line) =>
    new RegExp(`^${field}:\\s*`).test(line)
  );
  if (fieldIndex === -1) {
    return false;
  }
  const inlineValue = lines[fieldIndex]?.slice(field.length + 1).trim();
  if (inlineValue && inlineValue !== "[]") {
    return true;
  }

  for (let index = fieldIndex + 1; index < lines.length; index++) {
    const line = lines[index] ?? "";
    if (FRONTMATTER_FIELD_RE.test(line)) {
      break;
    }
    if (FRONTMATTER_LIST_RE.test(line)) {
      return true;
    }
  }

  return false;
}

async function checkFile(
  wwwRoot: string,
  fullPath: string
): Promise<DiagnosticIssue[]> {
  const relPath = path.relative(wwwRoot, fullPath).replaceAll("\\", "/");
  const content = await fs.readFile(fullPath, "utf-8");
  const frontmatter = content.match(FRONTMATTER_RE)?.[1];

  if (!frontmatter) {
    return [
      {
        category: "agent-metadata",
        severity: "error",
        file: relPath,
        message: `UI page "${relPath}" has no frontmatter for agent metadata.`,
        fix: `Add intent, role, a11yConstraints, motionEngine, compositionRules, and compositionRecipes to "${relPath}".`,
      },
    ];
  }

  return REQUIRED_FIELDS.filter(
    (field) => !hasNonEmptyFrontmatterValue(frontmatter, field)
  ).map((field) => ({
    category: "agent-metadata" as const,
    severity: "error" as const,
    file: relPath,
    message: `UI page "${relPath}" is missing agent metadata field "${field}".`,
    fix: `Add a non-empty "${field}" value to the frontmatter in "${relPath}".`,
  }));
}

export async function checkAgentMetadata(
  wwwRoot: string
): Promise<{ issues: DiagnosticIssue[] }> {
  const uiRoot = path.join(wwwRoot, "content", "ui");
  const issues: DiagnosticIssue[] = [];

  async function walk(dir: string): Promise<void> {
    if (!existsSync(dir)) {
      return;
    }
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        issues.push(...(await checkFile(wwwRoot, fullPath)));
      }
    }
  }

  for (const family of ["base", "radix"]) {
    await walk(path.join(uiRoot, family));
  }
  return { issues };
}

export function checkTargetAgentMetadata(
  wwwRoot: string,
  relativeMdxPath: string
): Promise<DiagnosticIssue[]> {
  const fullPath = path.join(wwwRoot, relativeMdxPath);
  if (!(existsSync(fullPath) && relativeMdxPath.startsWith("content/ui/"))) {
    return Promise.resolve([]);
  }
  return checkFile(wwwRoot, fullPath);
}
