import path from "node:path";
import { log, note, outro, spinner } from "@clack/prompts";
import { insertIntoUiMeta } from "../lib/meta-json.js";
import {
  findRepoRoot,
  getUiPaths,
  getWwwRoot,
  type UiFramework,
} from "../lib/paths.js";
import { runRegistryBuild } from "../lib/registry-build.js";
import type { CreateUiOptions } from "../lib/resolve-create-ui-options.js";
import { resolveCreateUiOptions } from "../lib/resolve-create-ui-options.js";
import {
  buildUiScaffoldLabels,
  renderUiDemoIndex,
  renderUiDemoRegistryItem,
  renderUiIndex,
  renderUiMdx,
  renderUiRegistryItem,
} from "../lib/ui-templates.js";
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
  framework: UiFramework,
  name: string,
  withDemo: boolean
): {
  files: ScaffoldFile[];
  labels: ReturnType<typeof buildUiScaffoldLabels>;
} {
  const paths = getUiPaths(wwwRoot, framework, name);
  const labels = buildUiScaffoldLabels(framework, name);

  const files: ScaffoldFile[] = [
    {
      relativePath: relativeFromWww(wwwRoot, paths.uiIndexPath),
      contents: renderUiIndex(framework, name, labels.exportName),
    },
    {
      relativePath: relativeFromWww(wwwRoot, paths.uiRegistryItemPath),
      contents: renderUiRegistryItem(framework, name, labels),
    },
    {
      relativePath: relativeFromWww(wwwRoot, paths.mdxPath),
      contents: renderUiMdx(framework, name, labels),
    },
  ];

  if (withDemo) {
    files.push(
      {
        relativePath: relativeFromWww(wwwRoot, paths.demoIndexPath),
        contents: renderUiDemoIndex(
          framework,
          name,
          labels.exportName,
          labels.demoComponentName
        ),
      },
      {
        relativePath: relativeFromWww(wwwRoot, paths.demoRegistryItemPath),
        contents: renderUiDemoRegistryItem(framework, name, labels),
      }
    );
  }

  return { files, labels };
}

export async function runCreateUi(
  nameArg: string | undefined,
  options: CreateUiOptions
): Promise<void> {
  const repoRoot = findRepoRoot();
  const wwwRoot = getWwwRoot(repoRoot);
  const resolved = await resolveCreateUiOptions(nameArg, options);
  const { files, labels } = buildScaffoldPlan(
    wwwRoot,
    resolved.framework,
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
  await insertIntoUiMeta(
    path.join(wwwRoot, "content/ui/meta.json"),
    resolved.framework,
    resolved.name
  );
  written.push(
    `content/ui/meta.json (+${resolved.framework}/${resolved.name})`
  );

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
      `Export name: ${labels.exportName}`,
      `demoProps key: ${labels.exportName}`,
      `Preview demo: ${labels.demoRegistryName}`,
      withDemoNote(resolved.withDemo, labels.demoComponentName),
      "",
      "Next steps:",
      "  1. Implement component in registry/ui/.../index.tsx",
      "  2. Expand content/ui/<framework>/<name>.mdx (Examples, Props, Credits)",
      "  3. Tune meta.demoProps in registry-item.json",
      "  4. Add variant demos under registry/demo/ui/... if needed",
      resolved.skipBuild
        ? "  5. Run: cd apps/www && bun run registry:build"
        : `  5. Preview: bun run dev:www → /ui/${resolved.framework}/${resolved.name}`,
    ].join("\n"),
    "Contributor checklist"
  );

  outro(`Created ${resolved.framework} UI component "${resolved.name}".`);
}

function withDemoNote(withDemo: boolean, demoComponentName: string): string {
  if (!withDemo) {
    return "Manual demo: skipped (add registry/demo/ui/... before preview works)";
  }
  return `Manual demo export: ${demoComponentName}`;
}
