import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { runCreatePrimitive } from "./commands/create-primitive.js";
import { getPrimitivePaths } from "./lib/paths.js";
import {
  cleanupPrimitiveFixture,
  FIXTURE_NAME,
  getRepoRoot,
  getWwwRootFromRepo,
  pathExists,
} from "./test/fixture.js";

const CLI_ENTRY = path.join(getRepoRoot(), "packages/www-cli/src/index.ts");
const INTERACTIVE_PROMPT_ERROR = /Interactive prompts require/i;
const ALREADY_EXISTS_ERROR = /already exist/i;

function runCli(args: string[]) {
  return spawnSync(
    process.execPath,
    [CLI_ENTRY, "create", "primitive", ...args],
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

describe("create primitive integration", () => {
  const category = "effects" as const;
  const wwwRoot = getWwwRootFromRepo();
  const paths = getPrimitivePaths(wwwRoot, category, FIXTURE_NAME);

  beforeEach(async () => {
    await cleanupPrimitiveFixture(category);
  });

  afterEach(async () => {
    await cleanupPrimitiveFixture(category);
  });

  it("scaffolds registry, docs, and meta via programmatic API", async () => {
    await runCreatePrimitive(FIXTURE_NAME, {
      category,
      yes: true,
      skipBuild: true,
    });

    const indexSource = await readFile(paths.primitiveIndexPath, "utf-8");
    const registryItem = JSON.parse(
      await readFile(paths.primitiveRegistryItemPath, "utf-8")
    ) as { meta: { demoProps: Record<string, unknown> } };
    const mdx = await readFile(paths.mdxPath, "utf-8");
    const meta = JSON.parse(await readFile(paths.metaJsonPath, "utf-8")) as {
      pages: string[];
    };

    expect(indexSource).toContain("export function WwwCliAutomatedFixture");
    expect(Object.keys(registryItem.meta.demoProps)).toEqual([
      "WwwCliAutomatedFixture",
    ]);
    expect(mdx).toContain(`<ComponentPreview name="${FIXTURE_NAME}"`);
    expect(meta.pages).toContain(FIXTURE_NAME);
    expect(await pathExists(paths.demoIndexPath)).toBe(false);
  });

  it("scaffolds manual demo files when --with-demo is set", async () => {
    await runCreatePrimitive(FIXTURE_NAME, {
      category,
      yes: true,
      skipBuild: true,
      withDemo: true,
    });

    const demoSource = await readFile(paths.demoIndexPath, "utf-8");
    const demoItem = JSON.parse(
      await readFile(paths.demoRegistryItemPath, "utf-8")
    ) as { name: string };

    expect(demoSource).toContain("export function WwwCliAutomatedFixtureDemo");
    expect(demoItem.name).toBe(`demo-${FIXTURE_NAME}`);
  });

  it("runs through the CLI entry with non-interactive flags", () => {
    const result = runCli([
      FIXTURE_NAME,
      "--category=effects",
      "--yes",
      "--skip-build",
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).not.toMatch(INTERACTIVE_PROMPT_ERROR);
  });

  it("refuses to overwrite an existing scaffold", async () => {
    await runCreatePrimitive(FIXTURE_NAME, {
      category,
      yes: true,
      skipBuild: true,
    });

    const result = runCli([
      FIXTURE_NAME,
      "--category=effects",
      "--yes",
      "--skip-build",
    ]);

    expect(result.status).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(ALREADY_EXISTS_ERROR);
  });

  it("does not write files in dry-run mode", async () => {
    await runCreatePrimitive(FIXTURE_NAME, {
      category,
      yes: true,
      dryRun: true,
      skipBuild: true,
    });

    expect(await pathExists(paths.primitiveIndexPath)).toBe(false);
    expect(await pathExists(paths.mdxPath)).toBe(false);
  });

  it("runs through the CLI with --no-input", () => {
    const result = runCli([
      FIXTURE_NAME,
      "--category=effects",
      "--no-input",
      "--skip-build",
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).not.toMatch(INTERACTIVE_PROMPT_ERROR);
  });

  it("prints a dry-run plan via the CLI", () => {
    const result = runCli([
      FIXTURE_NAME,
      "--category=effects",
      "--yes",
      "--dry-run",
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/Dry run/i);
    expect(result.stdout).toContain(
      `registry/primitives/${category}/${FIXTURE_NAME}`
    );
  });
});
