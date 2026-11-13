import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** `apps/www` — fallback when git is unavailable. */
const wwwRoot = process.cwd();

const cache = new Map<string, Promise<Date | null>>();
let repoRootPromise: Promise<string> | undefined;

function getRepoRoot(): Promise<string> {
  if (!repoRootPromise) {
    repoRootPromise = (async () => {
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
    })();
  }

  return repoRootPromise;
}

function toGitPath(repoRoot: string, filePath: string): string | null {
  const relativePath = path
    .relative(repoRoot, path.resolve(filePath))
    .split(path.sep)
    .join("/");

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return relativePath;
}

/**
 * Last git commit time for a single file.
 * Uses repo root + `--` so monorepo/Vercel builds resolve the correct object path.
 */
export function gitLastModifiedForFile(filePath: string): Promise<Date | null> {
  const cached = cache.get(filePath);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const repoRoot = await getRepoRoot();
    const gitPath = toGitPath(repoRoot, filePath);
    if (!gitPath) {
      return null;
    }

    try {
      const { stdout } = await execFileAsync(
        "git",
        [
          "log",
          "-1",
          "--pretty=%ai",
          "--invert-grep",
          "--grep=^chore",
          "--grep=^style",
          "--grep=^ci",
          "--grep=^format",
          "--",
          gitPath,
        ],
        { cwd: repoRoot }
      );
      let trimmed = stdout.trim();
      if (!trimmed) {
        // Fall back to any commit if all commits for this file matched the ignored prefixes
        const { stdout: fallback } = await execFileAsync(
          "git",
          ["log", "-1", "--pretty=%ai", "--", gitPath],
          { cwd: repoRoot }
        );
        trimmed = fallback.trim();
      }
      if (!trimmed) {
        try {
          const stat = await fs.promises.stat(filePath);
          return stat.mtime;
        } catch {
          return null;
        }
      }
      const date = new Date(trimmed);
      return Number.isNaN(date.getTime()) ? null : date;
    } catch {
      try {
        const stat = await fs.promises.stat(filePath);
        return stat.mtime;
      } catch {
        return null;
      }
    }
  })();

  cache.set(filePath, promise);
  return promise;
}
