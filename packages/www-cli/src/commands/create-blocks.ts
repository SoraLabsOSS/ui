import { note, outro, spinner } from "@clack/prompts";

import { renderBlocksMdx } from "../lib/blocks-templates.js";
import { printDryRunPlan } from "../lib/dry-run.js";
import { insertIntoBlocksMeta } from "../lib/meta-json.js";
import { toPascalCase } from "../lib/naming.js";
import {
  findRepoRoot,
  getBlocksPaths,
  getWwwRoot,
  relativeFromWww,
} from "../lib/paths.js";
import { runRegistryBuild } from "../lib/registry-build.js";
import type { CreateBlocksOptions } from "../lib/resolve-create-blocks-options.js";
import { resolveCreateBlocksOptions } from "../lib/resolve-create-blocks-options.js";
import { findExistingPaths, writeScaffoldFiles } from "../lib/write-files.js";
import type { ScaffoldFile } from "../lib/write-files.js";

export async function runCreateBlocks(
  slugArg: string | undefined,
  options: CreateBlocksOptions
): Promise<void> {
  const repoRoot = findRepoRoot();
  const wwwRoot = getWwwRoot(repoRoot);
  const resolved = await resolveCreateBlocksOptions(slugArg, options);
  const paths = getBlocksPaths(wwwRoot, resolved.slug);

  const files: ScaffoldFile[] = [
    {
      relativePath: relativeFromWww(wwwRoot, paths.mdxPath),
      contents: renderBlocksMdx({
        slug: resolved.slug,
        title: resolved.title,
        description: resolved.description,
        category: resolved.category,
        registryName: resolved.registryName,
        exportName: toPascalCase(resolved.registryName),
      }),
    },
  ];

  const existing = await findExistingPaths(
    wwwRoot,
    files.map((file) => file.relativePath)
  );

  if (existing.length > 0) {
    throw new Error(
      `These paths already exist:\n${existing.map((item) => `  - ${item}`).join("\n")}`
    );
  }

  const metaUpdate = `content/blocks/meta.json (+${resolved.slug})`;

  if (resolved.dryRun) {
    printDryRunPlan({
      title: `blocks showcase "${resolved.slug}"`,
      files: files.map((file) => file.relativePath),
      metaUpdates: [metaUpdate],
    });
    return;
  }

  if (resolved.quiet) {
    await writeScaffoldFiles(wwwRoot, files);
    await insertIntoBlocksMeta(paths.metaJsonPath, resolved.slug);

    if (!resolved.skipBuild) {
      runRegistryBuild(wwwRoot, { quiet: true });
    }

    console.log(
      `Created blocks showcase "${resolved.slug}" (1 file, meta updated).`
    );
    return;
  }

  const writeSpinner = spinner();
  writeSpinner.start("Writing scaffold files");

  await writeScaffoldFiles(wwwRoot, files);
  await insertIntoBlocksMeta(paths.metaJsonPath, resolved.slug);

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
      `Slug: ${resolved.slug}`,
      `Route: /blocks/${resolved.slug}`,
      `Underlying primitive: ${resolved.registryName}`,
      "",
      "Next steps:",
      `  1. Edit content/blocks/${resolved.slug}.mdx (showcase narrative, usage, props)`,
      "  2. Verify underlying primitive exists or create it with bun run create:primitive",
      resolved.skipBuild
        ? "  3. Run: cd apps/www && bun run registry:build"
        : `  3. Preview: bun run dev:www → /blocks/${resolved.slug}`,
    ].join("\n"),
    "Contributor checklist"
  );

  outro(`Created blocks showcase "${resolved.slug}".`);
}
