/**
 * `next dev` cache (Turbopack + Cache Components) has no dev-mode eviction —
 * within a single session it can balloon to multiple GB and drag disk/CPU
 * down (Windows AV re-scanning it doesn't help). The exact cache path has
 * moved between Next versions (`.next/cache` vs `.next/dev/cache`), so
 * instead of chasing it this drops the whole `.next` dir before every `dev`
 * start — state never carries over between sessions.
 */
import { rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const wwwRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const nextDir = path.join(wwwRoot, ".next");

async function main(): Promise<void> {
  const stats = await stat(nextDir).catch(() => null);
  if (!stats) {
    return;
  }

  console.log("[www] clearing .next before dev starts.");
  await rm(nextDir, { recursive: true, force: true });
}

await main();
