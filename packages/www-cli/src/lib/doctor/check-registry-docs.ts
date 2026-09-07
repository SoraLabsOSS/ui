import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import type { DiagnosticIssue } from "./types.js";

const PRIMITIVE_SOURCE_RE = /^registry\/primitives\/([^/]+)\/([^/]+)\//;
const UI_SOURCE_RE = /^registry\/ui\/(base|radix)\/([^/]+)\//;
const PREVIEW_TAG_RE =
  /<Component(?:Preview|Installation)\s+name=["']([^"']+)["']/g;

interface RegistryItemFile {
  path?: string;
  target?: string;
}

interface RegistryItemLike {
  files?: RegistryItemFile[];
  name: string;
  registryDependencies?: string[];
  type?: string;
}

function normalizeRegistryDependencyName(dep: string): string {
  if (dep.startsWith("@soralabs/")) {
    return dep.slice("@soralabs/".length);
  }
  return dep;
}

function getScaffoldHint(item: RegistryItemLike): string | null {
  if (
    item.name.startsWith("primitives-") ||
    item.name.startsWith("icons-") ||
    item.name.startsWith("lib-") ||
    item.name.startsWith("hooks-")
  ) {
    return null;
  }

  const sourcePath = (item.files?.[0]?.path ?? "").replaceAll("\\", "/");

  const primitiveMatch = sourcePath.match(PRIMITIVE_SOURCE_RE);
  if (primitiveMatch) {
    const [, category, name] = primitiveMatch;
    return `bun run create:primitive ${name} --category=${category} --yes`;
  }

  const uiMatch = sourcePath.match(UI_SOURCE_RE);
  if (uiMatch) {
    const [, framework, name] = uiMatch;
    return `bun run create:ui ${name} --framework=${framework} --yes`;
  }

  if (item.name.startsWith("base-")) {
    return `bun run create:ui ${item.name.slice("base-".length)} --framework=base --yes`;
  }

  if (item.name.startsWith("radix-")) {
    return `bun run create:ui ${item.name.slice("radix-".length)} --framework=radix --yes`;
  }

  if (item.name.startsWith("demo-radix-")) {
    const name = item.name.slice("demo-radix-".length);
    return `bun run create:ui ${name} --framework=radix --yes`;
  }

  if (item.name.startsWith("demo-base-")) {
    const name = item.name.slice("demo-base-".length);
    return `bun run create:ui ${name} --framework=base --yes`;
  }

  if (item.name.startsWith("demo-")) {
    const name = item.name.slice("demo-".length);
    return `bun run create:primitive ${name} --category=effects --yes`;
  }

  return `bun run create:primitive ${item.name} --category=effects --yes`;
}

async function collectDocumentedNames(wwwRoot: string): Promise<Set<string>> {
  const allowedNames = new Set<string>();
  const contentRoots = [
    path.join(wwwRoot, "content", "docs"),
    path.join(wwwRoot, "content", "catalog"),
    path.join(wwwRoot, "content", "ui"),
  ];

  async function walk(dir: string) {
    if (!existsSync(dir)) {
      return;
    }
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(".mdx")) {
        const content = await fs.readFile(fullPath, "utf-8");
        const matches = content.matchAll(PREVIEW_TAG_RE);
        for (const match of matches) {
          if (match[1]) {
            allowedNames.add(match[1]);
          }
        }
      }
    }
  }

  for (const root of contentRoots) {
    await walk(root);
  }

  for (const name of [...allowedNames]) {
    allowedNames.add(`demo-${name}`);
    allowedNames.add(`radix-${name}`);
    allowedNames.add(`demo-radix-${name}`);
    allowedNames.add(`base-${name}`);
    allowedNames.add(`demo-base-${name}`);
  }

  return allowedNames;
}

async function loadAllRegistryItems(
  registryDir: string
): Promise<RegistryItemLike[]> {
  const items: RegistryItemLike[] = [];

  async function walk(dir: string) {
    if (!existsSync(dir)) {
      return;
    }
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name === "registry-item.json") {
        try {
          const content = await fs.readFile(fullPath, "utf-8");
          const parsed = JSON.parse(content) as RegistryItemLike;
          if (parsed && typeof parsed.name === "string") {
            items.push(parsed);
          }
        } catch {
          // ignore parse errors; handled by check-demo-props
        }
      }
    }
  }

  await walk(registryDir);
  return items;
}

function collectTransitiveRegistryDependencyNames(
  items: RegistryItemLike[],
  seedNames: Set<string>
): Set<string> {
  const itemByName = new Map(items.map((item) => [item.name, item]));
  const resolvedNames = new Set(seedNames);
  let changed = true;

  while (changed) {
    changed = false;
    for (const name of resolvedNames) {
      const item = itemByName.get(name);
      if (!item?.registryDependencies?.length) {
        continue;
      }
      for (const dep of item.registryDependencies) {
        const normalized = normalizeRegistryDependencyName(dep);
        if (!resolvedNames.has(normalized)) {
          resolvedNames.add(normalized);
          changed = true;
        }
      }
    }
  }

  return resolvedNames;
}

async function checkPrimitivesFolders(
  wwwRoot: string,
  primitivesDir: string
): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  if (!existsSync(primitivesDir)) {
    return issues;
  }

  const categories = await fs.readdir(primitivesDir, { withFileTypes: true });
  for (const cat of categories) {
    if (!cat.isDirectory()) {
      continue;
    }
    const catDir = path.join(primitivesDir, cat.name);
    const components = await fs.readdir(catDir, { withFileTypes: true });
    for (const comp of components) {
      if (!comp.isDirectory()) {
        continue;
      }
      const mdxPath = path.join(
        wwwRoot,
        "content",
        "docs",
        "motion",
        `${comp.name}.mdx`
      );
      const catalogMdxPath = path.join(
        wwwRoot,
        "content",
        "catalog",
        `${comp.name}.mdx`
      );

      if (!(existsSync(mdxPath) || existsSync(catalogMdxPath))) {
        const relDir = path
          .relative(wwwRoot, path.join(catDir, comp.name))
          .replaceAll("\\", "/");
        const relMdx = path.relative(wwwRoot, mdxPath).replaceAll("\\", "/");

        issues.push({
          category: "registry-docs",
          severity: "error",
          file: relDir,
          message: `Motion primitive "${comp.name}" (${relDir}) has no matching MDX documentation at "${relMdx}".`,
          fix: `bun run create:primitive ${comp.name} --category=${cat.name} --yes`,
        });
      }
    }
  }

  return issues;
}

async function checkUiFolders(
  wwwRoot: string,
  uiDir: string
): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  if (!existsSync(uiDir)) {
    return issues;
  }

  const frameworks = await fs.readdir(uiDir, { withFileTypes: true });
  for (const fw of frameworks) {
    if (!fw.isDirectory()) {
      continue;
    }
    const fwDir = path.join(uiDir, fw.name);
    const components = await fs.readdir(fwDir, { withFileTypes: true });
    for (const comp of components) {
      if (!comp.isDirectory()) {
        continue;
      }
      const mdxPath = path.join(
        wwwRoot,
        "content",
        "ui",
        fw.name,
        `${comp.name}.mdx`
      );

      if (!existsSync(mdxPath)) {
        const relDir = path
          .relative(wwwRoot, path.join(fwDir, comp.name))
          .replaceAll("\\", "/");
        const relMdx = path.relative(wwwRoot, mdxPath).replaceAll("\\", "/");

        issues.push({
          category: "registry-docs",
          severity: "error",
          file: relDir,
          message: `UI component "${comp.name}" (${relDir}) has no matching MDX documentation at "${relMdx}".`,
          fix: `bun run create:ui ${comp.name} --framework=${fw.name} --yes`,
        });
      }
    }
  }

  return issues;
}

async function checkUndocumentedBuildSkips(
  wwwRoot: string,
  allItems: RegistryItemLike[]
): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  const documentedNames = await collectDocumentedNames(wwwRoot);
  const seedNames = new Set(
    allItems
      .filter((item) => !item.name.startsWith("primitives-"))
      .filter((item) => documentedNames.has(item.name))
      .map((item) => item.name)
  );

  for (const item of allItems) {
    if (item.name.startsWith("icons-")) {
      seedNames.add(item.name);
    }
  }

  const publishedNames = collectTransitiveRegistryDependencyNames(
    allItems,
    seedNames
  );

  for (const item of allItems) {
    if (publishedNames.has(item.name) || item.name.startsWith("primitives-")) {
      continue;
    }

    const hint = getScaffoldHint(item);
    const relPath = (item.files?.[0]?.path ?? item.name).replaceAll("\\", "/");

    issues.push({
      category: "registry-skip",
      severity: "warning",
      file: relPath,
      message: `Registry item "${item.name}" will be skipped by registry:build because it is not referenced by <ComponentPreview> or <ComponentInstallation> in any MDX doc.`,
      fix: hint
        ? `Scaffold docs via: ${hint}`
        : `Add an MDX page referencing <ComponentPreview name="${item.name}" />.`,
    });
  }

  return issues;
}

export interface CheckRegistryDocsResult {
  issues: DiagnosticIssue[];
  registryItemsChecked: number;
}

/**
 * Validates that registry folders have corresponding MDX pages,
 * and detects items that registry:build would skip as undocumented.
 */
export async function checkRegistryDocs(
  wwwRoot: string
): Promise<CheckRegistryDocsResult> {
  const registryDir = path.join(wwwRoot, "registry");
  const allItems = await loadAllRegistryItems(registryDir);

  const [primitiveIssues, uiIssues, skipIssues] = await Promise.all([
    checkPrimitivesFolders(wwwRoot, path.join(registryDir, "primitives")),
    checkUiFolders(wwwRoot, path.join(registryDir, "ui")),
    checkUndocumentedBuildSkips(wwwRoot, allItems),
  ]);

  return {
    issues: [...primitiveIssues, ...uiIssues, ...skipIssues],
    registryItemsChecked: allItems.length,
  };
}
