export interface DryRunPlan {
  files: string[];
  metaUpdates: string[];
  title: string;
}

export function printDryRunPlan(plan: DryRunPlan): void {
  console.log(`Dry run — ${plan.title}`);
  console.log("");
  console.log("Files:");
  for (const file of plan.files) {
    console.log(`  + ${file}`);
  }

  if (plan.metaUpdates.length > 0) {
    console.log("");
    console.log("Meta:");
    for (const line of plan.metaUpdates) {
      console.log(`  + ${line}`);
    }
  }

  console.log("");
  console.log("Re-run without --dry-run to write these files.");
}
