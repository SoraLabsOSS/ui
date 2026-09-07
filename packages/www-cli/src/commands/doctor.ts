import { formatDoctorReport } from "../lib/doctor/format-report.js";
import { runDoctorAudit } from "../lib/doctor/index.js";
import type { DoctorOptions } from "../lib/doctor/types.js";
import { findRepoRoot, getWwwRoot } from "../lib/paths.js";

export async function runDoctor(options: DoctorOptions = {}): Promise<boolean> {
  const repoRoot = findRepoRoot();
  const wwwRoot = getWwwRoot(repoRoot);

  if (!(options.targetName || options.all)) {
    console.error(
      "Please specify a component name to check, or pass --all to audit the entire registry.\n\n" +
        "Examples:\n" +
        "  bun run doctor text-effect\n" +
        "  bun run doctor base/accordion\n" +
        "  bun run doctor --all"
    );
    process.exitCode = 1;
    return false;
  }

  const result = await runDoctorAudit(wwwRoot, options);
  const output = formatDoctorReport(result, options);

  if (output) {
    if (result.errorCount > 0) {
      console.error(output);
    } else {
      console.log(output);
    }
  }

  if (!result.passed) {
    process.exitCode = 1;
    return false;
  }

  return true;
}
