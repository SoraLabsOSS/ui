export type IssueSeverity = "error" | "warning";

export type IssueCategory =
  | "meta-json"
  | "demo-props"
  | "registry-docs"
  | "registry-skip";

export interface DiagnosticIssue {
  category: IssueCategory;
  file?: string;
  fix?: string;
  message: string;
  severity: IssueSeverity;
}

export interface DoctorStats {
  demoPropsChecked: number;
  mdxFilesChecked: number;
  metaPagesChecked: number;
  registryItemsChecked: number;
}

export interface DoctorResult {
  errorCount: number;
  issues: DiagnosticIssue[];
  passed: boolean;
  stats: DoctorStats;
  targetComponent?: string;
  warningCount: number;
}

export interface DoctorOptions {
  all?: boolean;
  noColor?: boolean;
  quiet?: boolean;
  strict?: boolean;
  targetName?: string;
}
