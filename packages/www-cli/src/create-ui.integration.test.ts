import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { runCreateUi } from "./commands/create-ui.js";
import { getUiPaths } from "./lib/paths.js";
import {
  cleanupUiFixture,
  getRepoRoot,
  getWwwRootFromRepo,
  pathExists,
  UI_FIXTURE_NAME,
} from "./test/fixture.js";

const CLI_ENTRY = path.join(getRepoRoot(), "packages/www-cli/src/index.ts");
const INTERACTIVE_PROMPT_ERROR = /Interactive prompts require/i;

function runCli(args: string[]) {
  return spawnSync(process.execPath, [CLI_ENTRY, "create", "ui", ...args], {
    cwd: getRepoRoot(),
    encoding: "utf-8",
    env: {
      ...process.env,
      FORCE_COLOR: "0",
    },
  });
}

describe("create ui integration", () => {
  const framework = "base" as const;
  const wwwRoot = getWwwRootFromRepo();
  const paths = getUiPaths(wwwRoot, framework, UI_FIXTURE_NAME);

  beforeEach(async () => {
    await cleanupUiFixture(framework);
  });

  afterEach(async () => {
    await cleanupUiFixture(framework);
  });

  it("scaffolds UI registry, docs, demo, and meta via programmatic API", async () => {
    await runCreateUi(UI_FIXTURE_NAME, {
      framework,
      yes: true,
      skipBuild: true,
    });

    const indexSource = await readFile(paths.uiIndexPath, "utf-8");
    const registryItem = JSON.parse(
      await readFile(paths.uiRegistryItemPath, "utf-8")
    ) as { meta: { demoProps: Record<string, unknown> }; name: string };
    const mdx = await readFile(paths.mdxPath, "utf-8");
    const meta = JSON.parse(await readFile(paths.metaJsonPath, "utf-8")) as {
      pages: string[];
    };
    const demoSource = await readFile(paths.demoIndexPath, "utf-8");

    expect(indexSource).toContain("export function WwwCliUiFixture");
    expect(registryItem.name).toBe("base-www-cli-ui-fixture");
    expect(Object.keys(registryItem.meta.demoProps)).toEqual([
      "WwwCliUiFixture",
    ]);
    expect(mdx).toContain('<ComponentPreview name="demo-www-cli-ui-fixture"');
    expect(mdx).toContain(
      '<ComponentInstallation name="base-www-cli-ui-fixture"'
    );
    expect(meta.pages).toContain("base/www-cli-ui-fixture");
    expect(demoSource).toContain("export default function WwwCliUiFixtureDemo");
    expect(await pathExists(paths.demoRegistryItemPath)).toBe(true);
  });

  it("skips demo files when --skip-demo is set", async () => {
    await runCreateUi(UI_FIXTURE_NAME, {
      framework,
      yes: true,
      skipBuild: true,
      skipDemo: true,
    });

    expect(await pathExists(paths.demoIndexPath)).toBe(false);
  });

  it("runs through the CLI entry with non-interactive flags", () => {
    const result = runCli([
      UI_FIXTURE_NAME,
      "--framework=base",
      "--yes",
      "--skip-build",
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).not.toMatch(INTERACTIVE_PROMPT_ERROR);
  });

  it("does not write files in dry-run mode", async () => {
    await runCreateUi(UI_FIXTURE_NAME, {
      framework,
      yes: true,
      dryRun: true,
      skipBuild: true,
    });

    expect(await pathExists(paths.uiIndexPath)).toBe(false);
    expect(await pathExists(paths.mdxPath)).toBe(false);
  });

  it("runs through the CLI with --no-input", () => {
    const result = runCli([
      UI_FIXTURE_NAME,
      "--framework=base",
      "--no-input",
      "--skip-build",
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).not.toMatch(INTERACTIVE_PROMPT_ERROR);
  });
});
