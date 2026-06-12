/**
 * Vercel shallow-clones by default (depth 1). Fumadocs `lastModified` runs `git log`
 * per file at MDX compile time — with shallow history every page gets the deploy date.
 *
 * Prefer `VERCEL_DEEP_CLONE=true` in project settings (clone-time fix).
 * This script is a fallback: unshallow before `fumadocs-mdx` / `next build`.
 */
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const wwwRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

async function getRepoRoot(): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["rev-parse", "--show-toplevel"],
      { cwd: wwwRoot }
    );
    const root = stdout.trim();
    return root.length > 0 ? root : wwwRoot;
  } catch {
    return wwwRoot;
  }
}

async function isShallowRepository(repoRoot: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["rev-parse", "--is-shallow-repository"],
      { cwd: repoRoot }
    );
    return stdout.trim() === "true";
  } catch {
    return false;
  }
}

async function unshallowRepository(repoRoot: string): Promise<void> {
  try {
    await execFileAsync("git", ["fetch", "--unshallow", "--quiet"], {
      cwd: repoRoot,
      timeout: 120_000,
    });
    return;
  } catch {
    await execFileAsync(
      "git",
      ["fetch", "--depth", "1000000", "--quiet", "origin"],
      { cwd: repoRoot, timeout: 120_000 }
    );
  }
}

async function main(): Promise<void> {
  if (process.env.VERCEL !== "1") {
    return;
  }

  const repoRoot = await getRepoRoot();
  if (!(await isShallowRepository(repoRoot))) {
    return;
  }

  console.log(
    "[www] Shallow git clone on Vercel — fetching history for per-file lastModified…"
  );

  try {
    await unshallowRepository(repoRoot);
    console.log("[www] Git history ready for lastModified.");
  } catch (error) {
    console.warn(
      "[www] Could not fetch full git history. Set VERCEL_DEEP_CLONE=true in Vercel project settings, or lastModified will show the deploy date.",
      error
    );
  }
}

await main();
