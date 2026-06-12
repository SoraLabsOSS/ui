import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** `apps/www` — anchor git paths regardless of monorepo build cwd (e.g. Vercel). */
const wwwRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const cache = new Map<string, Promise<Date | null>>();

/**
 * Last git commit time for a single file under `apps/www`.
 * Uses `--` so git never treats the path as a revision (fixes folder-level false positives).
 */
export function gitLastModifiedForFile(filePath: string): Promise<Date | null> {
  const cached = cache.get(filePath);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const relativePath = path.relative(wwwRoot, filePath);

    try {
      const { stdout } = await execFileAsync(
        "git",
        ["log", "-1", "--pretty=%ai", "--", relativePath],
        { cwd: wwwRoot }
      );
      const date = new Date(stdout.trim());
      return Number.isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  })();

  cache.set(filePath, promise);
  return promise;
}
