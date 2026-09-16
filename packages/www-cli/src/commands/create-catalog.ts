import { note, outro, spinner } from "@clack/prompts";
import { renderCatalogMdx } from "../lib/catalog-templates.js";
import { printDryRunPlan } from "../lib/dry-run.js";
import { insertIntoCatalogMeta } from "../lib/meta-json.js";
import { toPascalCase } from "../lib/naming.js";
import {
  findRepoRoot,
  getCatalogPaths,
  getWwwRoot,
  relativeFromWww,
} from "../lib/paths.js";
import { runRegistryBuild } from "../lib/registry-build.js";
import type { CreateCatalogOptions } from "../lib/resolve-create-catalog-options.js";
import { resolveCreateCatalogOptions } from "../lib/resolve-create-catalog-options.js";
import {
  findExistingPaths,
  type ScaffoldFile,
  writeScaffoldFiles,
} from "../lib/write-files.js";

export async function runCreateCatalog(
  slugArg: string | undefined,
  options: CreateCatalogOptions
): Promise<void> {
  const repoRoot = findRepoRoot();
  const wwwRoot = getWwwRoot(repoRoot);
  const resolved = await resolveCreateCatalogOptions(slugArg, options);
  const paths = getCatalogPaths(wwwRoot, resolved.slug);

  const files: ScaffoldFile[] = [
    {
      relativePath: relativeFromWww(wwwRoot, paths.mdxPath),
      contents: renderCatalogMdx({
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

  const metaUpdate = `content/catalog/meta.json (+${resolved.slug})`;

  if (resolved.dryRun) {
    printDryRunPlan({
      title: `catalog showcase "${resolved.slug}"`,
      files: files.map((file) => file.relativePath),
      metaUpdates: [metaUpdate],
    });
    return;
  }

  if (resolved.quiet) {
    await writeScaffoldFiles(wwwRoot, files);
    await insertIntoCatalogMeta(paths.metaJsonPath, resolved.slug);

    if (!resolved.skipBuild) {
      runRegistryBuild(wwwRoot, { quiet: true });
    }

    console.log(
      `Created catalog showcase "${resolved.slug}" (1 file, meta updated).`
    );
    return;
  }

  const writeSpinner = spinner();
  writeSpinner.start("Writing scaffold files");

  await writeScaffoldFiles(wwwRoot, files);
  await insertIntoCatalogMeta(paths.metaJsonPath, resolved.slug);

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
      `Route: /catalog/${resolved.slug}`,
      `Underlying primitive: ${resolved.registryName}`,
      "",
      "Next steps:",
      `  1. Edit content/catalog/${resolved.slug}.mdx (showcase narrative, usage, props)`,
      "  2. Verify underlying primitive exists or create it with bun run create:primitive",
      resolved.skipBuild
        ? "  3. Run: cd apps/www && bun run registry:build"
        : `  3. Preview: bun run dev:www → /catalog/${resolved.slug}`,
    ].join("\n"),
    "Contributor checklist"
  );

  outro(`Created catalog showcase "${resolved.slug}".`);
}
