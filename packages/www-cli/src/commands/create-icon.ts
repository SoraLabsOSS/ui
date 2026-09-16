import { note, outro, spinner } from "@clack/prompts";
import { printDryRunPlan } from "../lib/dry-run.js";
import {
  buildIconLabels,
  renderIconDemoIndex,
  renderIconDemoRegistryItem,
  renderIconIndex,
  renderIconRegistryItem,
} from "../lib/icon-templates.js";
import {
  findRepoRoot,
  getIconPaths,
  getWwwRoot,
  relativeFromWww,
} from "../lib/paths.js";
import { runRegistryBuild } from "../lib/registry-build.js";
import type { CreateIconOptions } from "../lib/resolve-create-icon-options.js";
import { resolveCreateIconOptions } from "../lib/resolve-create-icon-options.js";
import {
  findExistingPaths,
  type ScaffoldFile,
  writeScaffoldFiles,
} from "../lib/write-files.js";

function buildScaffoldPlan(
  wwwRoot: string,
  name: string,
  keywords: string[],
  withDemo: boolean
): { files: ScaffoldFile[]; labels: ReturnType<typeof buildIconLabels> } {
  const paths = getIconPaths(wwwRoot, name);
  const labels = buildIconLabels(name, keywords);

  const files: ScaffoldFile[] = [
    {
      relativePath: relativeFromWww(wwwRoot, paths.iconIndexPath),
      contents: renderIconIndex(name, labels.exportName),
    },
    {
      relativePath: relativeFromWww(wwwRoot, paths.iconRegistryItemPath),
      contents: renderIconRegistryItem(
        name,
        labels.title,
        labels.description,
        labels.keywords,
        labels.releaseDate
      ),
    },
  ];

  if (withDemo) {
    files.push(
      {
        relativePath: relativeFromWww(wwwRoot, paths.demoIndexPath),
        contents: renderIconDemoIndex(
          name,
          labels.exportName,
          labels.demoExportName
        ),
      },
      {
        relativePath: relativeFromWww(wwwRoot, paths.demoRegistryItemPath),
        contents: renderIconDemoRegistryItem(name, labels.title),
      }
    );
  }

  return { files, labels };
}

export async function runCreateIcon(
  nameArg: string | undefined,
  options: CreateIconOptions
): Promise<void> {
  const repoRoot = findRepoRoot();
  const wwwRoot = getWwwRoot(repoRoot);
  const resolved = await resolveCreateIconOptions(nameArg, options);
  const { files, labels } = buildScaffoldPlan(
    wwwRoot,
    resolved.name,
    resolved.keywords,
    resolved.withDemo
  );

  const existing = await findExistingPaths(
    wwwRoot,
    files.map((file) => file.relativePath)
  );

  if (existing.length > 0) {
    throw new Error(
      `These paths already exist:\n${existing.map((item) => `  - ${item}`).join("\n")}`
    );
  }

  if (resolved.dryRun) {
    printDryRunPlan({
      title: `animated icon "${resolved.name}"`,
      files: files.map((file) => file.relativePath),
      metaUpdates: [],
    });
    return;
  }

  if (resolved.quiet) {
    await writeScaffoldFiles(wwwRoot, files);

    if (!resolved.skipBuild) {
      runRegistryBuild(wwwRoot, { quiet: true });
    }

    console.log(
      `Created animated icon "${resolved.name}" (${files.length} files).`
    );
    return;
  }

  const writeSpinner = spinner();
  writeSpinner.start("Writing scaffold files");

  await writeScaffoldFiles(wwwRoot, files);

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
      `Registry name: ${labels.registryName}`,
      `Export name: ${labels.exportName} / ${labels.exportName}Icon`,
      resolved.withDemo
        ? `Demo export: ${labels.demoExportName}`
        : "Demo: skipped",
      `Keywords: ${labels.keywords.join(", ")}`,
      "",
      "Next steps:",
      `  1. Implement SVG path animations in registry/icons/${resolved.name}/index.tsx`,
      "  2. Define animation variants and trigger behavior",
      resolved.skipBuild
        ? "  3. Run: cd apps/www && bun run registry:build"
        : "  3. Verify via apps/www/registry/icons showcase",
    ].join("\n"),
    "Contributor checklist"
  );

  outro(`Created animated icon "${resolved.name}".`);
}
