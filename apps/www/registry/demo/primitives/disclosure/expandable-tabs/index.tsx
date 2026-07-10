"use client";

import {
  BadgeCheck,
  Brush,
  CalendarClock,
  ChartSpline,
  ChevronRight,
  ClipboardCheck,
  CloudUpload,
  FileText,
  Gauge,
  GitBranch,
  Images,
  Inbox,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  PackageOpen,
  RefreshCw,
  Rocket,
  Siren,
  SwatchBook,
  UploadCloud,
  Users,
  Webhook,
  Workflow,
} from "lucide-react";
import {
  type ExpandableTab,
  ExpandableTabs,
} from "@/registry/primitives/disclosure/expandable-tabs";

function Row({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium text-foreground text-sm transition-colors hover:bg-muted"
      type="button"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function Menu({ rows }: { rows: { icon: LucideIcon; label: string }[] }) {
  return (
    <div className="flex w-68.5 flex-col gap-0.5">
      {rows.map((row) => (
        <Row icon={row.icon} key={row.label} label={row.label} />
      ))}
    </div>
  );
}

const TABS: ExpandableTab[] = [
  {
    id: "launch",
    label: "Launch",
    icon: Rocket,
    content: (
      <Menu
        rows={[
          { icon: FileText, label: "Release Brief" },
          { icon: ClipboardCheck, label: "Launch Checklist" },
          { icon: Megaphone, label: "Campaign Notes" },
          { icon: CalendarClock, label: "Rollout Calendar" },
          { icon: CloudUpload, label: "Ship Build" },
        ]}
      />
    ),
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: Inbox,
    content: (
      <Menu
        rows={[
          { icon: MessageCircle, label: "Client Feedback" },
          { icon: Users, label: "Team Requests" },
          { icon: BadgeCheck, label: "Approval Notes" },
        ]}
      />
    ),
  },
  {
    id: "flows",
    label: "Flows",
    icon: Workflow,
    content: (
      <Menu
        rows={[
          { icon: GitBranch, label: "Trigger Map" },
          { icon: Webhook, label: "Webhook Runs" },
          { icon: RefreshCw, label: "Retry Queue" },
        ]}
      />
    ),
  },
  {
    id: "assets",
    label: "Assets",
    icon: PackageOpen,
    content: (
      <Menu
        rows={[
          { icon: SwatchBook, label: "Brand Kit" },
          { icon: Images, label: "Mockup Library" },
          { icon: Brush, label: "Design Tokens" },
          { icon: UploadCloud, label: "Export Queue" },
        ]}
      />
    ),
  },
  {
    id: "status",
    label: "Status",
    icon: ChartSpline,
    content: (
      <Menu
        rows={[
          { icon: Gauge, label: "Activation" },
          { icon: ChartSpline, label: "Conversion" },
          { icon: Siren, label: "Incidents" },
        ]}
      />
    ),
  },
];

export default function ExpandableTabsExample() {
  return (
    <div className="flex min-h-88 w-full items-end justify-center bg-muted/50 p-8 dark:bg-muted/30">
      <ExpandableTabs
        classNames={{
          content: "bg-card/90",
          toolbar: "border border-border bg-card shadow-sm",
        }}
        tabs={TABS}
      />
    </div>
  );
}
