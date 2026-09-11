import type {
  DiagnosticIssue,
  DoctorOptions,
  DoctorResult,
  IssueCategory,
} from "./types.js";

const CATEGORY_TITLES: Record<IssueCategory, string> = {
  "agent-metadata": "Agent Metadata",
  "meta-json": "Meta JSON Mismatches",
  "demo-props": "demoProps Key Mismatches",
  "registry-docs": "Missing MDX Documentation",
  "registry-skip": "Undocumented Items (Skipped in Build)",
};

interface ColorPalette {
  bold: (s: string) => string;
  cyan: (s: string) => string;
  dim: (s: string) => string;
  green: (s: string) => string;
  red: (s: string) => string;
  yellow: (s: string) => string;
}

function getColors(noColor: boolean | undefined): ColorPalette {
  const disable =
    Boolean(noColor) ||
    process.env.NO_COLOR === "1" ||
    process.env.FORCE_COLOR === "0";

  if (disable) {
    return {
      bold: (s: string) => s,
      dim: (s: string) => s,
      red: (s: string) => s,
      yellow: (s: string) => s,
      green: (s: string) => s,
      cyan: (s: string) => s,
    };
  }

  return {
    bold: (s: string) => `\x1b[1m${s}\x1b[22m`,
    dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
    red: (s: string) => `\x1b[31m${s}\x1b[39m`,
    yellow: (s: string) => `\x1b[33m${s}\x1b[39m`,
    green: (s: string) => `\x1b[32m${s}\x1b[39m`,
    cyan: (s: string) => `\x1b[36m${s}\x1b[39m`,
  };
}

function formatCategoryIssues(
  category: IssueCategory,
  issues: DiagnosticIssue[],
  c: ColorPalette
): string[] {
  const lines: string[] = [];
  const title = CATEGORY_TITLES[category] ?? category;
  lines.push(c.bold(`─── ${title} (${issues.length}) ───`));

  for (const issue of issues) {
    const icon =
      issue.severity === "error" ? c.red("✖ Error:") : c.yellow("▲ Warning:");
    const fileContext = issue.file ? c.dim(`[${issue.file}] `) : "";

    lines.push(`  ${icon} ${fileContext}${issue.message}`);
    if (issue.fix) {
      lines.push(`    ${c.cyan("💡 Fix:")} ${issue.fix}`);
    }
  }
  lines.push("");

  return lines;
}

function formatSummaryLine(result: DoctorResult, c: ColorPalette): string {
  const errorPart =
    result.errorCount > 0
      ? c.red(`${result.errorCount} error${result.errorCount === 1 ? "" : "s"}`)
      : c.green("0 errors");
  const warningPart =
    result.warningCount > 0
      ? c.yellow(
          `${result.warningCount} warning${result.warningCount === 1 ? "" : "s"}`
        )
      : c.green("0 warnings");

  return result.targetComponent
    ? `Summary: ${errorPart}, ${warningPart} for component "${result.targetComponent}".`
    : `Summary: ${errorPart}, ${warningPart} across ${result.stats.registryItemsChecked} registry items and ${result.stats.metaPagesChecked} meta entries.`;
}

export function formatDoctorReport(
  result: DoctorResult,
  options: DoctorOptions = {}
): string {
  const c = getColors(options.noColor);
  const lines: string[] = [];

  if (!options.quiet) {
    const title = result.targetComponent
      ? `www-cli doctor — Component "${result.targetComponent}" Health Check`
      : "www-cli doctor — Registry & Docs Health Check";
    lines.push(c.bold(title));
    lines.push("");
  }

  if (result.issues.length === 0) {
    if (result.targetComponent) {
      lines.push(
        `${c.green("✔")} Component "${result.targetComponent}" is healthy! All checks passed (registry, demoProps, MDX, meta.json).`
      );
    } else {
      lines.push(
        `${c.green("✔")} No issues found across ${result.stats.registryItemsChecked} registry items, ${result.stats.metaPagesChecked} meta pages, and ${result.stats.demoPropsChecked} demoProps.`
      );
    }
    return lines.join("\n");
  }

  const grouped = new Map<IssueCategory, DiagnosticIssue[]>();
  for (const issue of result.issues) {
    const list = grouped.get(issue.category) ?? [];
    list.push(issue);
    grouped.set(issue.category, list);
  }

  for (const [category, categoryIssues] of grouped.entries()) {
    lines.push(...formatCategoryIssues(category, categoryIssues, c));
  }

  lines.push(formatSummaryLine(result, c));

  return lines.join("\n");
}
