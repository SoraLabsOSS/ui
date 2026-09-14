import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { runCreateCatalog } from "./commands/create-catalog.js";
import { getCatalogPaths } from "./lib/paths.js";
import {
  CATALOG_FIXTURE_SLUG,
  cleanupCatalogFixture,
  getRepoRoot,
  getWwwRootFromRepo,
  pathExists,
} from "./test/fixture.js";

const CLI_ENTRY = path.join(getRepoRoot(), "packages/www-cli/src/index.ts");
const ALREADY_EXISTS_ERROR = /already exist/i;
const DRY_RUN_PATTERN = /Dry run/i;

function runCli(args: string[]) {
  return spawnSync(
    process.execPath,
    [CLI_ENTRY, "create", "catalog", ...args],
    {
      cwd: getRepoRoot(),
      encoding: "utf-8",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
      },
    }
  );
}

describe("create catalog integration", () => {
  const wwwRoot = getWwwRootFromRepo();
  const paths = getCatalogPaths(wwwRoot, CATALOG_FIXTURE_SLUG);

  beforeEach(async () => {
    await cleanupCatalogFixture();
  });

  afterEach(async () => {
    await cleanupCatalogFixture();
  });

  it("scaffolds catalog MDX and patches meta.json via programmatic API", async () => {
    await runCreateCatalog(CATALOG_FIXTURE_SLUG, {
      category: "effects",
      yes: true,
      skipBuild: true,
    });

    expect(await pathExists(paths.mdxPath)).toBe(true);

    const mdx = await readFile(paths.mdxPath, "utf-8");
    expect(mdx).toContain("title: WWW CLI Catalog Fixture");
    expect(mdx).toContain("category: effects");
    expect(mdx).toContain(
      `<ComponentInstallation name="${CATALOG_FIXTURE_SLUG}" />`
    );

    const meta = JSON.parse(await readFile(paths.metaJsonPath, "utf-8")) as {
      pages: string[];
    };
    expect(meta.pages).toContain(CATALOG_FIXTURE_SLUG);
  });

  it("rejects duplicate catalog page creation", async () => {
    await runCreateCatalog(CATALOG_FIXTURE_SLUG, {
      category: "effects",
      yes: true,
      skipBuild: true,
    });

    await expect(
      runCreateCatalog(CATALOG_FIXTURE_SLUG, {
        category: "effects",
        yes: true,
        skipBuild: true,
      })
    ).rejects.toThrow(ALREADY_EXISTS_ERROR);
  });

  it("does not write files in dry-run mode", async () => {
    await runCreateCatalog(CATALOG_FIXTURE_SLUG, {
      category: "effects",
      dryRun: true,
      yes: true,
      skipBuild: true,
    });

    expect(await pathExists(paths.mdxPath)).toBe(false);

    const meta = JSON.parse(await readFile(paths.metaJsonPath, "utf-8")) as {
      pages: string[];
    };
    expect(meta.pages).not.toContain(CATALOG_FIXTURE_SLUG);
  });

  it("runs through the CLI entry with non-interactive flags", async () => {
    const result = runCli([CATALOG_FIXTURE_SLUG, "--yes", "--skip-build"]);

    expect(result.status).toBe(0);
    expect(await pathExists(paths.mdxPath)).toBe(true);
  });

  it("runs through the CLI with --no-input", async () => {
    const result = runCli([CATALOG_FIXTURE_SLUG, "--no-input", "--skip-build"]);

    expect(result.status).toBe(0);
    expect(await pathExists(paths.mdxPath)).toBe(true);
  });

  it("supports dry-run via CLI", async () => {
    const result = runCli([CATALOG_FIXTURE_SLUG, "--dry-run", "--yes"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(DRY_RUN_PATTERN);
    expect(await pathExists(paths.mdxPath)).toBe(false);
  });
});
