import { spawnSync } from "node:child_process";
import path from "node:path";
import { log, note, outro, spinner } from "@clack/prompts";
import { insertIntoMotionMeta } from "../lib/meta-json.js";
import {
  findRepoRoot,
  getPrimitivePaths,
  getWwwRoot,
  type PrimitiveCategory,
} from "../lib/paths.js";
import type { CreatePrimitiveOptions } from "../lib/resolve-create-primitive-options.js";
import { resolveCreatePrimitiveOptions } from "../lib/resolve-create-primitive-options.js";
import {
  buildScaffoldLabels,
  renderDemoIndex,
  renderDemoRegistryItem,
  renderMotionMdx,
  renderPrimitiveIndex,
  renderPrimitiveRegistryItem,
} from "../lib/templates.js";
import {
  findExistingPaths,
  type ScaffoldFile,
  writeScaffoldFiles,
} from "../lib/write-files.js";

function relativeFromWww(wwwRoot: string, absolutePath: string): string {
  return path.relative(wwwRoot, absolutePath).replaceAll("\\", "/");
}

function buildScaffoldPlan(
  wwwRoot: string,
  category: PrimitiveCategory,
  name: string,
  withDemo: boolean
): { files: ScaffoldFile[]; labels: ReturnType<typeof buildScaffoldLabels> } {
  const paths = getPrimitivePaths(wwwRoot, category, name);
  const labels = buildScaffoldLabels(name);

  const files: ScaffoldFile[] = [
    {
      relativePath: relativeFromWww(wwwRoot, paths.primitiveIndexPath),
      contents: renderPrimitiveIndex(name, labels.exportName),
    },
    {
      relativePath: relativeFromWww(wwwRoot, paths.primitiveRegistryItemPath),
      contents: renderPrimitiveRegistryItem(
        name,
        category,
        labels.exportName,
        labels.title,
        labels.description
      ),
    },
    {
      relativePath: relativeFromWww(wwwRoot, paths.mdxPath),
      contents: renderMotionMdx(
        name,
        category,
        labels.title,
        labels.description,
        labels.exportName
      ),
    },
  ];

  if (withDemo) {
    files.push(
      {
        relativePath: relativeFromWww(wwwRoot, paths.demoIndexPath),
        contents: renderDemoIndex(
          name,
          category,
          labels.exportName,
          labels.demoExportName
        ),
      },
      {
        relativePath: relativeFromWww(wwwRoot, paths.demoRegistryItemPath),
        contents: renderDemoRegistryItem(name, category, labels.title),
      }
    );
  }

  return { files, labels };
}

function runRegistryBuild(wwwRoot: string): void {
  const script = path.join(wwwRoot, "scripts", "build-registry.mts");
  const result = spawnSync(process.execPath, [script], {
    cwd: wwwRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("registry:build failed.");
  }
}

export async function runCreatePrimitive(
  nameArg: string | undefined,
  options: CreatePrimitiveOptions
): Promise<void> {
  const repoRoot = findRepoRoot();
  const wwwRoot = getWwwRoot(repoRoot);
  const resolved = await resolveCreatePrimitiveOptions(nameArg, options);
  const { files, labels } = buildScaffoldPlan(
    wwwRoot,
    resolved.category,
    resolved.name,
    resolved.withDemo
  );

  const existing = await findExistingPaths(
    wwwRoot,
    files.map((file) => file.relativePath)
  );

  if (existing.length > 0) {
    log.error(
      `These paths already exist:\n${existing.map((item) => `  - ${item}`).join("\n")}`
    );
    process.exit(1);
  }

  const writeSpinner = spinner();
  writeSpinner.start("Writing scaffold files");

  const written = await writeScaffoldFiles(wwwRoot, files);
  await insertIntoMotionMeta(
    path.join(wwwRoot, "content/docs/motion/meta.json"),
    resolved.category,
    resolved.name
  );
  written.push(`content/docs/motion/meta.json (+${resolved.name})`);

  writeSpinner.stop("Scaffold created");

  if (!resolved.skipBuild) {
    const buildSpinner = spinner();
    buildSpinner.start("Running registry:build");
    try {
      runRegistryBuild(wwwRoot);
      buildSpinner.stop("registry:build completed");
    } catch (error) {
      buildSpinner.stop("registry:build failed");
      throw error;
    }
  }

  note(
    [
      `Export name: ${labels.exportName}`,
      `demoProps key: ${labels.exportName}`,
      withDemoNote(resolved.withDemo, labels.demoExportName),
      "",
      "Next steps:",
      "  1. Implement animation in registry/primitives/.../index.tsx",
      "  2. Expand content/docs/motion/<name>.mdx (Usage, Accessibility, Credits)",
      "  3. Tune meta.demoProps in registry-item.json",
      resolved.skipBuild
        ? "  4. Run: cd apps/www && bun run registry:build"
        : "  4. Preview: bun run dev:www → /motion/<name>",
    ].join("\n"),
    "Contributor checklist"
  );

  outro(`Created motion primitive "${resolved.name}".`);
}

function withDemoNote(withDemo: boolean, demoExportName: string): string {
  if (!withDemo) {
    return "Manual demo: skipped (demoProps drives preview + Code tab)";
  }
  return `Manual demo export: ${demoExportName}`;
}
