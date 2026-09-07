import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { extractExports } from "./extract-exports.js";
import type { DiagnosticIssue, DoctorOptions, DoctorResult } from "./types.js";

const PRIMITIVE_CATEGORIES = [
  "texts",
  "buttons",
  "disclosure",
  "effects",
  "animate",
] as const;

interface ResolvedTarget {
  category?: string;
  componentName: string;
  dirPath: string;
  framework?: "base" | "radix";
  kind: "primitive" | "ui" | "icon" | "catalog";
  metaJsonRel: string;
  metaPageSlug: string;
  registryJsonPath: string;
  relMdxPath: string;
}

function resolvePrimitiveTarget(
  wwwRoot: string,
  rawName: string
): ResolvedTarget | null {
  for (const cat of PRIMITIVE_CATEGORIES) {
    const candidateDir = path.join(
      wwwRoot,
      "registry",
      "primitives",
      cat,
      rawName
    );
    if (existsSync(candidateDir)) {
      return {
        kind: "primitive",
        category: cat,
        componentName: rawName,
        dirPath: candidateDir,
        registryJsonPath: path.join(candidateDir, "registry-item.json"),
        relMdxPath: `content/docs/motion/${rawName}.mdx`,
        metaJsonRel: "content/docs/motion/meta.json",
        metaPageSlug: rawName,
      };
    }
  }
  return null;
}

function resolveUiTarget(
  wwwRoot: string,
  rawName: string
): ResolvedTarget | null {
  let framework: "base" | "radix" | undefined;
  let compName = rawName;

  if (rawName.startsWith("base/") || rawName.startsWith("base-")) {
    framework = "base";
    compName = rawName.startsWith("base/")
      ? rawName.slice("base/".length)
      : rawName.slice("base-".length);
  } else if (rawName.startsWith("radix/") || rawName.startsWith("radix-")) {
    framework = "radix";
    compName = rawName.startsWith("radix/")
      ? rawName.slice("radix/".length)
      : rawName.slice("radix-".length);
  }

  const frameworksToTry: Array<"base" | "radix"> = framework
    ? [framework]
    : ["base", "radix"];

  for (const fw of frameworksToTry) {
    const candidateDir = path.join(wwwRoot, "registry", "ui", fw, compName);
    if (existsSync(candidateDir)) {
      return {
        kind: "ui",
        framework: fw,
        componentName: compName,
        dirPath: candidateDir,
        registryJsonPath: path.join(candidateDir, "registry-item.json"),
        relMdxPath: `content/ui/${fw}/${compName}.mdx`,
        metaJsonRel: "content/ui/meta.json",
        metaPageSlug: `${fw}/${compName}`,
      };
    }
  }

  return null;
}

function resolveTarget(
  wwwRoot: string,
  nameInput: string
): ResolvedTarget | null {
  const clean = nameInput.trim().toLowerCase();

  const primitive = resolvePrimitiveTarget(wwwRoot, clean);
  if (primitive) {
    return primitive;
  }

  const ui = resolveUiTarget(wwwRoot, clean);
  if (ui) {
    return ui;
  }

  const iconDir = path.join(wwwRoot, "registry", "icons", clean);
  if (existsSync(iconDir)) {
    return {
      kind: "icon",
      componentName: clean,
      dirPath: iconDir,
      registryJsonPath: path.join(iconDir, "registry-item.json"),
      relMdxPath: `content/docs/motion/${clean}.mdx`,
      metaJsonRel: "content/docs/motion/meta.json",
      metaPageSlug: clean,
    };
  }

  const catalogMdx = path.join(wwwRoot, "content", "catalog", `${clean}.mdx`);
  if (existsSync(catalogMdx)) {
    return {
      kind: "catalog",
      componentName: clean,
      dirPath: path.join(wwwRoot, "content", "catalog"),
      registryJsonPath: "",
      relMdxPath: `content/catalog/${clean}.mdx`,
      metaJsonRel: "content/catalog/meta.json",
      metaPageSlug: clean,
    };
  }

  return null;
}

function getScaffoldHintForTarget(target: ResolvedTarget): string {
  if (target.kind === "primitive") {
    return `bun run create:primitive ${target.componentName} --category=${target.category} --yes`;
  }
  if (target.kind === "ui") {
    return `bun run create:ui ${target.componentName} --framework=${target.framework} --yes`;
  }
  return `Create "${target.relMdxPath}".`;
}

async function validateSourceExports(
  wwwRoot: string,
  sourcePath: string,
  demoProps: Record<string, Record<string, unknown>>
): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  const relSource = path.relative(wwwRoot, sourcePath).replaceAll("\\", "/");

  if (existsSync(sourcePath)) {
    const sourceContent = await fs.readFile(sourcePath, "utf-8");
    const exports = extractExports(sourceContent);
    const available = [...exports].join(", ");

    for (const key of Object.keys(demoProps)) {
      if (!exports.has(key)) {
        issues.push({
          category: "demo-props",
          severity: "error",
          file: relSource,
          message: `meta.demoProps key "${key}" does not match any exported component in "${relSource}". Available exports: [${available}].`,
          fix: `Update meta.demoProps key to match one of [${available}], or export "${key}".`,
        });
      }
    }
  } else {
    issues.push({
      category: "demo-props",
      severity: "error",
      file: relSource,
      message: `Primary source file "${relSource}" does not exist.`,
      fix: `Create the missing component source file at "${relSource}".`,
    });
  }

  return issues;
}

async function validateTargetRegistryAndDemoProps(
  wwwRoot: string,
  target: ResolvedTarget
): Promise<{ demoPropsChecked: number; issues: DiagnosticIssue[] }> {
  const issues: DiagnosticIssue[] = [];
  let demoPropsChecked = 0;

  if (target.kind === "catalog") {
    return { issues, demoPropsChecked: 0 };
  }

  if (!existsSync(target.registryJsonPath)) {
    issues.push({
      category: "registry-docs",
      severity: "error",
      message: `Missing registry-item.json for "${target.componentName}".`,
      fix: `Create "${path.relative(wwwRoot, target.registryJsonPath).replaceAll("\\", "/")}".`,
    });
    return { issues, demoPropsChecked };
  }

  let parsed: {
    files?: Array<{ path?: string }>;
    meta?: { demoProps?: Record<string, Record<string, unknown>> };
  };

  try {
    const raw = await fs.readFile(target.registryJsonPath, "utf-8");
    parsed = JSON.parse(raw);
  } catch {
    issues.push({
      category: "demo-props",
      severity: "error",
      message: `Failed to parse registry-item.json for "${target.componentName}".`,
      fix: "Fix JSON syntax errors in registry-item.json.",
    });
    return { issues, demoPropsChecked };
  }

  const demoProps = parsed.meta?.demoProps;
  if (demoProps && typeof demoProps === "object") {
    demoPropsChecked = Object.keys(demoProps).length;

    let sourcePath = path.join(target.dirPath, "index.tsx");
    if (parsed.files?.[0]?.path) {
      sourcePath = path.isAbsolute(parsed.files[0].path)
        ? parsed.files[0].path
        : path.join(wwwRoot, parsed.files[0].path);
    }

    const exportIssues = await validateSourceExports(
      wwwRoot,
      sourcePath,
      demoProps
    );
    issues.push(...exportIssues);
  }

  return { issues, demoPropsChecked };
}

function checkMdxReferenceMatch(
  mdxContent: string,
  target: ResolvedTarget
): boolean {
  if (
    mdxContent.includes(`name="${target.componentName}"`) ||
    mdxContent.includes(`name='${target.componentName}'`) ||
    mdxContent.includes(`name="demo-${target.componentName}"`)
  ) {
    return true;
  }

  if (target.framework) {
    const fwPrefixed = `name="${target.framework}-${target.componentName}"`;
    const demoFwPrefixed = `name="demo-${target.framework}-${target.componentName}"`;
    if (
      mdxContent.includes(fwPrefixed) ||
      mdxContent.includes(demoFwPrefixed)
    ) {
      return true;
    }
  }

  return false;
}

async function validateTargetMdxAndMeta(
  wwwRoot: string,
  target: ResolvedTarget
): Promise<{
  issues: DiagnosticIssue[];
  mdxChecked: number;
  metaChecked: number;
}> {
  const issues: DiagnosticIssue[] = [];
  const fullMdxPath = path.join(wwwRoot, target.relMdxPath);
  let mdxChecked = 0;
  let metaChecked = 0;

  if (existsSync(fullMdxPath)) {
    mdxChecked = 1;
    const mdxContent = await fs.readFile(fullMdxPath, "utf-8");
    const nameMatch = checkMdxReferenceMatch(mdxContent, target);

    if (!nameMatch) {
      issues.push({
        category: "registry-skip",
        severity: "warning",
        file: target.relMdxPath,
        message: `MDX page "${target.relMdxPath}" does not reference "${target.componentName}" in a <ComponentPreview> or <ComponentInstallation> tag. It will be skipped during registry:build.`,
        fix: `Add <ComponentPreview name="${target.componentName}" /> to "${target.relMdxPath}".`,
      });
    }
  } else {
    issues.push({
      category: "registry-docs",
      severity: "error",
      file: target.relMdxPath,
      message: `MDX documentation file "${target.relMdxPath}" does not exist.`,
      fix: getScaffoldHintForTarget(target),
    });
  }

  const fullMetaPath = path.join(wwwRoot, target.metaJsonRel);
  if (existsSync(fullMetaPath)) {
    metaChecked = 1;
    try {
      const rawMeta = await fs.readFile(fullMetaPath, "utf-8");
      const meta = JSON.parse(rawMeta) as { pages?: string[] };
      const pages = (meta.pages ?? []).filter((p) => !p.startsWith("---"));
      if (!pages.includes(target.metaPageSlug)) {
        issues.push({
          category: "meta-json",
          severity: "warning",
          file: target.metaJsonRel,
          message: `Component "${target.componentName}" is missing from the "pages" list in "${target.metaJsonRel}". It will not appear in the docs sidebar.`,
          fix: `Add "${target.metaPageSlug}" to "pages" in "${target.metaJsonRel}".`,
        });
      }
    } catch {
      issues.push({
        category: "meta-json",
        severity: "error",
        file: target.metaJsonRel,
        message: `Failed to read or parse "${target.metaJsonRel}".`,
      });
    }
  }

  return { issues, mdxChecked, metaChecked };
}

/**
 * Targeted doctor check for a specific component name.
 */
export async function checkTargetComponent(
  wwwRoot: string,
  targetName: string,
  options: DoctorOptions = {}
): Promise<DoctorResult> {
  const target = resolveTarget(wwwRoot, targetName);

  if (!target) {
    const errorIssue: DiagnosticIssue = {
      category: "registry-docs",
      severity: "error",
      message: `Component "${targetName}" was not found in registry (primitives, ui, icons, or catalog).`,
      fix: `Check the name spelling, or scaffold it via: bun run create:primitive ${targetName} (or bun run create:ui ${targetName}).`,
    };

    return {
      issues: [errorIssue],
      errorCount: 1,
      warningCount: 0,
      passed: false,
      targetComponent: targetName,
      stats: {
        demoPropsChecked: 0,
        mdxFilesChecked: 0,
        metaPagesChecked: 0,
        registryItemsChecked: 0,
      },
    };
  }

  const [regResult, mdxResult] = await Promise.all([
    validateTargetRegistryAndDemoProps(wwwRoot, target),
    validateTargetMdxAndMeta(wwwRoot, target),
  ]);

  const issues = [...regResult.issues, ...mdxResult.issues];
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  const passed = options.strict
    ? errorCount === 0 && warningCount === 0
    : errorCount === 0;

  return {
    issues,
    errorCount,
    warningCount,
    passed,
    targetComponent: target.componentName,
    stats: {
      demoPropsChecked: regResult.demoPropsChecked,
      mdxFilesChecked: mdxResult.mdxChecked,
      metaPagesChecked: mdxResult.metaChecked,
      registryItemsChecked: 1,
    },
  };
}
