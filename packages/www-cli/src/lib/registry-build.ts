import { spawnSync } from "node:child_process";
import path from "node:path";

export function runRegistryBuild(wwwRoot: string): void {
  const script = path.join(wwwRoot, "scripts", "build-registry.mts");
  const result = spawnSync(process.execPath, [script], {
    cwd: wwwRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("registry:build failed.");
  }
}
