/**
 * `next dev` cache (Turbopack + Cache Components) has no dev-mode eviction —
 * over multi-day sessions `.next/cache` grows unbounded and can fill the
 * disk / drag CPU down (Windows AV re-scanning it doesn't help). This runs
 * before `dev` starts and drops the cache if it's stale or oversized, so a
 * periodic restart of the dev server is enough to keep it bounded.
 */
import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CACHE_MAX_AGE_DAYS = 3;
const CACHE_MAX_SIZE_MB = 2048;

const wwwRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const cacheDir = path.join(wwwRoot, ".next", "cache");

async function getDirSizeBytes(dir: string): Promise<number> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);

  let total = 0;
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await getDirSizeBytes(entryPath);
    } else {
      total += (await stat(entryPath).catch(() => null))?.size ?? 0;
    }
  }
  return total;
}

async function main(): Promise<void> {
  const stats = await stat(cacheDir).catch(() => null);
  if (!stats) {
    return;
  }

  const ageMs = Date.now() - stats.mtimeMs;
  const maxAgeMs = CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const isStale = ageMs >= maxAgeMs;

  const sizeMb = (await getDirSizeBytes(cacheDir)) / (1024 * 1024);
  const isOversized = sizeMb >= CACHE_MAX_SIZE_MB;

  if (!(isStale || isOversized)) {
    return;
  }

  console.log(
    `[www] .next/cache is ${sizeMb.toFixed(0)}MB (stale=${isStale}, oversized=${isOversized}) — clearing it before dev starts.`
  );
  await rm(cacheDir, { recursive: true, force: true });
}

await main();
