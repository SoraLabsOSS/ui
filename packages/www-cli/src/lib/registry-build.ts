import { spawnSync } from "node:child_process";
import path from "node:path";

export interface RegistryBuildOptions {
  quiet?: boolean;
}

export function runRegistryBuild(
  wwwRoot: string,
  options: RegistryBuildOptions = {}
): void {
  const script = path.join(wwwRoot, "scripts", "build-registry.mts");
  const result = spawnSync(process.execPath, [script], {
    cwd: wwwRoot,
    stdio: options.quiet ? "pipe" : "inherit",
    encoding: options.quiet ? "utf-8" : undefined,
  });

  if (result.status !== 0) {
    const detail =
      options.quiet && typeof result.stderr === "string"
        ? result.stderr.trim()
        : "";
    throw new Error(
      detail ? `registry:build failed.\n${detail}` : "registry:build failed."
    );
  }
}
