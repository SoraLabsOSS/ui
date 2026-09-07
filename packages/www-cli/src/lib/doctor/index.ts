import { checkDemoProps } from "./check-demo-props.js";
import { checkMetaJson } from "./check-meta-json.js";
import { checkRegistryDocs } from "./check-registry-docs.js";
import { checkTargetComponent } from "./check-target-component.js";
import type {
  DiagnosticIssue,
  DoctorOptions,
  DoctorResult,
  DoctorStats,
} from "./types.js";

/**
 * Runs doctor health checks against the www project directory.
 * If options.targetName is specified, runs targeted checks for that component.
 */
export async function runDoctorAudit(
  wwwRoot: string,
  options: DoctorOptions = {}
): Promise<DoctorResult> {
  if (options.targetName) {
    return checkTargetComponent(wwwRoot, options.targetName, options);
  }

  const [metaResult, demoResult, registryResult] = await Promise.all([
    checkMetaJson(wwwRoot),
    checkDemoProps(wwwRoot),
    checkRegistryDocs(wwwRoot),
  ]);

  const issues: DiagnosticIssue[] = [
    ...metaResult.issues,
    ...demoResult.issues,
    ...registryResult.issues,
  ];

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  const passed = options.strict
    ? errorCount === 0 && warningCount === 0
    : errorCount === 0;

  const stats: DoctorStats = {
    demoPropsChecked: demoResult.demoPropsChecked,
    mdxFilesChecked: metaResult.mdxFilesChecked,
    metaPagesChecked: metaResult.metaPagesChecked,
    registryItemsChecked: registryResult.registryItemsChecked,
  };

  return {
    issues,
    stats,
    errorCount,
    warningCount,
    passed,
  };
}
