import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { runCreateIcon } from "./commands/create-icon.js";
import { getIconPaths } from "./lib/paths.js";
import {
  cleanupIconFixture,
  getRepoRoot,
  getWwwRootFromRepo,
  ICON_FIXTURE_NAME,
  pathExists,
} from "./test/fixture.js";

const CLI_ENTRY = path.join(getRepoRoot(), "packages/www-cli/src/index.ts");
const ALREADY_EXISTS_ERROR = /already exist/i;
const DRY_RUN_PATTERN = /Dry run/i;

function runCli(args: string[]) {
  return spawnSync(process.execPath, [CLI_ENTRY, "create", "icon", ...args], {
    cwd: getRepoRoot(),
    encoding: "utf-8",
    env: {
      ...process.env,
      FORCE_COLOR: "0",
    },
  });
}

describe("create icon integration", () => {
  const wwwRoot = getWwwRootFromRepo();
  const paths = getIconPaths(wwwRoot, ICON_FIXTURE_NAME);

  beforeEach(async () => {
    await cleanupIconFixture();
  });

  afterEach(async () => {
    await cleanupIconFixture();
  });

  it("scaffolds icon registry files and demo via programmatic API", async () => {
    await runCreateIcon(ICON_FIXTURE_NAME, {
      keywords: ["sparkle", "magic"],
      withDemo: true,
      yes: true,
      skipBuild: true,
    });

    expect(await pathExists(paths.iconIndexPath)).toBe(true);
    expect(await pathExists(paths.iconRegistryItemPath)).toBe(true);
    expect(await pathExists(paths.demoIndexPath)).toBe(true);
    expect(await pathExists(paths.demoRegistryItemPath)).toBe(true);

    const indexSource = await readFile(paths.iconIndexPath, "utf-8");
    expect(indexSource).toContain("function WwwCliIconFixture");
    expect(indexSource).toContain("WwwCliIconFixture as WwwCliIconFixtureIcon");

    const registryItem = JSON.parse(
      await readFile(paths.iconRegistryItemPath, "utf-8")
    ) as { name: string; registryDependencies: string[] };
    expect(registryItem.name).toBe(`icons-${ICON_FIXTURE_NAME}`);
    expect(registryItem.registryDependencies).toEqual([]);
  });

  it("skips demo when withDemo is false", async () => {
    await runCreateIcon(ICON_FIXTURE_NAME, {
      withDemo: false,
      yes: true,
      skipBuild: true,
    });

    expect(await pathExists(paths.iconIndexPath)).toBe(true);
    expect(await pathExists(paths.demoIndexPath)).toBe(false);
  });

  it("rejects duplicate icon creation", async () => {
    await runCreateIcon(ICON_FIXTURE_NAME, {
      yes: true,
      skipBuild: true,
    });

    await expect(
      runCreateIcon(ICON_FIXTURE_NAME, {
        yes: true,
        skipBuild: true,
      })
    ).rejects.toThrow(ALREADY_EXISTS_ERROR);
  });

  it("does not write files in dry-run mode", async () => {
    await runCreateIcon(ICON_FIXTURE_NAME, {
      dryRun: true,
      yes: true,
      skipBuild: true,
    });

    expect(await pathExists(paths.iconIndexPath)).toBe(false);
  });

  it("runs through the CLI entry with non-interactive flags", async () => {
    const result = runCli([ICON_FIXTURE_NAME, "--yes", "--skip-build"]);

    expect(result.status).toBe(0);
    expect(await pathExists(paths.iconIndexPath)).toBe(true);
  });

  it("runs through the CLI with --no-input", async () => {
    const result = runCli([ICON_FIXTURE_NAME, "--no-input", "--skip-build"]);

    expect(result.status).toBe(0);
    expect(await pathExists(paths.iconIndexPath)).toBe(true);
  });

  it("supports dry-run via CLI", async () => {
    const result = runCli([ICON_FIXTURE_NAME, "--dry-run", "--yes"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(DRY_RUN_PATTERN);
    expect(await pathExists(paths.iconIndexPath)).toBe(false);
  });
});
