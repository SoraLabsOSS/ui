"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Search,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";

export type ComponentStatus =
  | "completed"
  | "in-progress"
  | "planned"
  | "under-consideration";
export type Framework = "react" | "vue" | "js";
export type MotionScore = "S" | "A" | "B" | "C";

export interface RoadmapItem {
  category: "base-ui" | "radix-ui" | "other-headless" | "cross-platform";
  categoryLabel: string;
  description: string;
  docUrl?: string;
  frameworks: Framework[];
  id: string;
  motionScore?: MotionScore;
  name: string;
  phase: number;
  priority?: "High" | "Medium" | "Planned";
  scoreValue?: number;
  status: ComponentStatus;
  tags?: string[];
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  // Phase 1: Base UI (Highest Priority - 13 Core Components)
  {
    id: "base-button",
    name: "Base UI: Button",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "completed",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Accessible button with physics-based spring scaling on hover/tap and CVA variants.",
    docUrl: "/ui/base/button",
    priority: "High",
    tags: ["Core", "Spring Scaling", "Base UI"],
  },
  {
    id: "base-checkbox",
    name: "Base UI: Checkbox",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "completed",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Animated checkbox with SVG path morphing checkmark and elastic pop feedback.",
    docUrl: "/ui/base/checkbox",
    priority: "High",
    tags: ["Forms", "Path Morph", "Base UI"],
  },
  {
    id: "base-dialog",
    name: "Base UI: Dialog",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "completed",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Modal dialog with backdrop blur fade and scale-in spring transition.",
    docUrl: "/ui/base/dialog",
    priority: "High",
    tags: ["Overlays", "Scale Spring", "Base UI"],
  },
  {
    id: "base-accordion",
    name: "Base UI: Accordion",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "in-progress",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Smooth height layout animation with rotating chevron and keyboard navigation.",
    priority: "High",
    tags: ["Disclosure", "Height Morph", "Base UI"],
  },
  {
    id: "base-context-menu",
    name: "Base UI: Context menu",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "A",
    scoreValue: 4,
    description:
      "Pointer-origin scaling context menu with cascaded submenu transitions.",
    priority: "High",
    tags: ["Navigation", "Transform Origin", "Base UI"],
  },
  {
    id: "base-dropdown-menu",
    name: "Base UI: Dropdown menu",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Collision-aware floating dropdown with staggered items and active item pill.",
    priority: "High",
    tags: ["Navigation", "Stagger", "Base UI"],
  },
  {
    id: "base-progress",
    name: "Base UI: Progress",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "B",
    scoreValue: 3,
    description:
      "Elastic filling progress bar with smooth indeterminate shimmer and numeric ticker.",
    priority: "High",
    tags: ["Feedback", "Elastic", "Base UI"],
  },
  {
    id: "base-radio",
    name: "Base UI: Radio",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "A",
    scoreValue: 4,
    description:
      "Radio group with shared layoutId gliding active circle indicator.",
    priority: "High",
    tags: ["Forms", "Layout Morph", "Base UI"],
  },
  {
    id: "base-select",
    name: "Base UI: Select",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Animated select combobox dropdown with floating active pill and filter transitions.",
    priority: "High",
    tags: ["Forms", "Floating UI", "Base UI"],
  },
  {
    id: "base-switch",
    name: "Base UI: Switch",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Inertia stretch switch toggle with rubber-band thumb physics.",
    priority: "High",
    tags: ["Forms", "Rubber Band", "Base UI"],
  },
  {
    id: "base-tabs",
    name: "Base UI: Tabs",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Sliding background indicator pill with cross-fading tab panels.",
    priority: "High",
    tags: ["Navigation", "Shared Layout", "Base UI"],
  },
  {
    id: "base-toast",
    name: "Base UI: Toast",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Stacked toast notification queue with interactive swipe-to-dismiss gesture physics.",
    priority: "High",
    tags: ["Feedback", "Swipe Gesture", "Base UI"],
  },
  {
    id: "base-toggle-group",
    name: "Base UI: Toggle group",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "A",
    scoreValue: 4,
    description:
      "Multi-item toggle group with morphing border bounds and tactile feedback.",
    priority: "High",
    tags: ["Buttons", "Morphing", "Base UI"],
  },
  {
    id: "base-tooltip",
    name: "Base UI: Tooltip",
    category: "base-ui",
    categoryLabel: "Base UI",
    phase: 1,
    status: "planned",
    frameworks: ["react"],
    motionScore: "B",
    scoreValue: 3,
    description:
      "Micro scale-fade tooltip with dynamic arrow position tracking.",
    priority: "High",
    tags: ["Overlays", "Micro Animation", "Base UI"],
  },

  // Phase 2: Radix UI (Priority 2 - 15+ Components)
  {
    id: "radix-button",
    name: "Radix: Button",
    category: "radix-ui",
    categoryLabel: "Radix UI",
    phase: 2,
    status: "completed",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description: "Radix primitive slot button with Motion hover scale physics.",
    docUrl: "/ui/radix/button",
    priority: "Medium",
    tags: ["Core", "Radix UI"],
  },
  {
    id: "radix-checkbox",
    name: "Radix: Checkbox",
    category: "radix-ui",
    categoryLabel: "Radix UI",
    phase: 2,
    status: "completed",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description: "Radix checkbox with animated check icon path and focus ring.",
    docUrl: "/ui/radix/checkbox",
    priority: "Medium",
    tags: ["Forms", "Radix UI"],
  },
  {
    id: "radix-dialog",
    name: "Radix: Dialog",
    category: "radix-ui",
    categoryLabel: "Radix UI",
    phase: 2,
    status: "completed",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description: "Radix dialog modal overlay with spring entrance animation.",
    docUrl: "/ui/radix/dialog",
    priority: "Medium",
    tags: ["Overlays", "Radix UI"],
  },
  {
    id: "radix-bottom-sheet",
    name: "Radix: Bottom Sheet",
    category: "radix-ui",
    categoryLabel: "Radix UI",
    phase: 2,
    status: "completed",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Mobile-first draggable bottom sheet drawer with inertia fling dismiss.",
    docUrl: "/ui/radix/bottom-sheet",
    priority: "Medium",
    tags: ["Drawer", "Gestures", "Radix UI"],
  },
  {
    id: "radix-accordion",
    name: "Radix: Accordion",
    category: "radix-ui",
    categoryLabel: "Radix UI",
    phase: 2,
    status: "planned",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description: "Radix accordion with smooth collapsible height animation.",
    priority: "Medium",
    tags: ["Disclosure", "Radix UI"],
  },
  {
    id: "radix-context-dropdown",
    name: "Radix: Context & Dropdown Menu",
    category: "radix-ui",
    categoryLabel: "Radix UI",
    phase: 2,
    status: "planned",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description: "Radix floating menus with spring staggered items.",
    priority: "Medium",
    tags: ["Navigation", "Radix UI"],
  },
  {
    id: "radix-popover-hovercard",
    name: "Radix: Popover & Hover Card",
    category: "radix-ui",
    categoryLabel: "Radix UI",
    phase: 2,
    status: "planned",
    frameworks: ["react"],
    motionScore: "A",
    scoreValue: 4,
    description: "Floating popovers with directional micro spring transitions.",
    priority: "Medium",
    tags: ["Overlays", "Radix UI"],
  },
  {
    id: "radix-tabs-switch-slider",
    name: "Radix: Tabs, Switch & Slider",
    category: "radix-ui",
    categoryLabel: "Radix UI",
    phase: 2,
    status: "planned",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Interactive controls with shared layout sliding indicator and drag physics.",
    priority: "Medium",
    tags: ["Controls", "Radix UI"],
  },
  {
    id: "radix-toast-tooltip",
    name: "Radix: Toast & Tooltip",
    category: "radix-ui",
    categoryLabel: "Radix UI",
    phase: 2,
    status: "planned",
    frameworks: ["react"],
    motionScore: "A",
    scoreValue: 4,
    description: "Accessible notification queue and tooltip hover transitions.",
    priority: "Medium",
    tags: ["Feedback", "Radix UI"],
  },

  // Phase 3: Other Headless UI Libraries (Planned)
  {
    id: "react-aria-suite",
    name: "React Aria Components Integration",
    category: "other-headless",
    categoryLabel: "Other Headless UI",
    phase: 3,
    status: "planned",
    frameworks: ["react"],
    motionScore: "S",
    scoreValue: 5,
    description:
      "Adobe's enterprise-grade accessible components infused with Sora Motion spring physics.",
    priority: "Planned",
    tags: ["React Aria", "Headless", "Accessibility"],
  },
  {
    id: "ark-ui-suite",
    name: "Ark UI (Zag.js) Adapter",
    category: "other-headless",
    categoryLabel: "Other Headless UI",
    phase: 3,
    status: "under-consideration",
    frameworks: ["react", "vue"],
    motionScore: "A",
    scoreValue: 4,
    description:
      "State machine-driven headless components with universal motion presets.",
    priority: "Planned",
    tags: ["Ark UI", "Zag.js", "Multi-Framework"],
  },
  {
    id: "headless-ui-ariakit",
    name: "Ariakit & Headless UI Modules",
    category: "other-headless",
    categoryLabel: "Other Headless UI",
    phase: 3,
    status: "under-consideration",
    frameworks: ["react"],
    motionScore: "B",
    scoreValue: 3,
    description:
      "Clean adapters for Tailwind Headless UI and Ariakit primitives.",
    priority: "Planned",
    tags: ["Ariakit", "Headless UI"],
  },

  // Phase 4: Cross-Platform & Ecosystem
  {
    id: "multi-platform-expansion",
    name: "Multi-Platform: Vue 3 & Vanilla JavaScript",
    category: "cross-platform",
    categoryLabel: "Cross-Platform",
    phase: 4,
    status: "planned",
    frameworks: ["vue", "js"],
    motionScore: "A",
    scoreValue: 4,
    description:
      "Dedicated component ports for Vue 3 (Motion for Vue) and vanilla JS web components.",
    priority: "Planned",
    tags: ["Vue 3", "Vanilla JS", "Cross-Platform"],
  },
];

const MOTIONSCORE_BENCHMARKS = [
  {
    tier: "S",
    count: 5,
    label: "S-Tier • Compositor Only",
    color:
      "border-[oklch(0.88_0.18_96)/40] bg-[oklch(0.88_0.18_96)/10] text-[#b88600] dark:text-[oklch(0.88_0.18_96)]",
    description:
      "Animations run entirely on the GPU compositor thread (transform, opacity). Zero main-thread interruption.",
  },
  {
    tier: "A",
    count: 2,
    label: "A-Tier • Main-Thread Composited",
    color:
      "border-[oklch(0.76_0.15_155)/40] bg-[oklch(0.76_0.15_155)/10] text-emerald-600 dark:text-[oklch(0.76_0.15_155)]",
    description:
      "Animations change composited values from the main thread with smooth micro-interaction orchestration.",
  },
  {
    tier: "B",
    count: 3,
    label: "B-Tier • Measured Animation",
    color:
      "border-[oklch(0.68_0.18_255)/40] bg-[oklch(0.68_0.18_255)/10] text-blue-600 dark:text-[oklch(0.68_0.18_255)]",
    description:
      "S or A-tier animations requiring upfront DOM measurements (e.g. FLIP layout morphing, elastic progress).",
  },
  {
    tier: "C",
    count: 3,
    label: "C-Tier • Paint Triggering",
    color:
      "border-[oklch(0.64_0.18_302)/40] bg-[oklch(0.64_0.18_302)/10] text-purple-600 dark:text-[oklch(0.64_0.18_302)]",
    description:
      "Animations trigger paint operations (colors, shadows, SVG paths, and theme transitions).",
  },
  {
    tier: "D / F",
    count: 0,
    label: "D/F • Layout & Thrashing (0%)",
    color:
      "border-[oklch(0.67_0.22_26.43)/40] bg-[oklch(0.67_0.22_26.43)/10] text-red-600 dark:text-[oklch(0.67_0.22_26.43)]",
    description:
      "Zero tolerance in Sora UI: No layout recalculations or synchronous DOM thrashing allowed.",
  },
];

function getStatusLabel(status: ComponentStatus): string {
  if (status === "completed") {
    return "Completed";
  }
  if (status === "in-progress") {
    return "In Progress";
  }
  return "Planned";
}

function StatusNodeIcon({ status }: { status: ComponentStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="size-3 md:size-3.5" />;
  }
  if (status === "in-progress") {
    return <Flame className="size-3 md:size-3.5" />;
  }
  return <Clock className="size-3 md:size-3.5" />;
}

function RoadmapCard({
  item,
  index,
  shouldReduceMotion,
}: {
  item: RoadmapItem;
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const isCompleted = item.status === "completed";
  const isInProgress = item.status === "in-progress";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col gap-3 rounded-xl border bg-background p-5 shadow-sm transition-all duration-200 hover:border-foreground/30 hover:shadow-md"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
      key={item.id}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <div
        className={cn(
          "absolute top-6 -left-7 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border md:-left-11 md:size-6",
          isCompleted && "border-emerald-500 bg-emerald-500 text-white",
          isInProgress &&
            "animate-pulse border-primary bg-primary text-primary-foreground",
          !(isCompleted || isInProgress) &&
            "border-muted-foreground/40 bg-background text-muted-foreground"
        )}
      >
        <StatusNodeIcon status={item.status} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-base text-foreground tracking-tight">
            {item.name}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium text-[11px]",
              isCompleted &&
                "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              isInProgress &&
                "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
              !(isCompleted || isInProgress) && "bg-muted text-muted-foreground"
            )}
          >
            {getStatusLabel(item.status)}
          </span>
          <span className="rounded border bg-accent/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            Phase {item.phase} • {item.categoryLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {item.motionScore && (
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 font-bold font-mono text-xs",
                item.motionScore === "S" &&
                  "border-[oklch(0.88_0.18_96)/40] bg-[oklch(0.88_0.18_96)/10] text-[#b88600] dark:text-[oklch(0.88_0.18_96)]",
                item.motionScore === "A" &&
                  "border-[oklch(0.76_0.15_155)/40] bg-[oklch(0.76_0.15_155)/10] text-emerald-600 dark:text-[oklch(0.76_0.15_155)]",
                item.motionScore === "B" &&
                  "border-[oklch(0.68_0.18_255)/40] bg-[oklch(0.68_0.18_255)/10] text-blue-600 dark:text-[oklch(0.68_0.18_255)]",
                item.motionScore === "C" &&
                  "border-[oklch(0.64_0.18_302)/40] bg-[oklch(0.64_0.18_302)/10] text-purple-600 dark:text-[oklch(0.64_0.18_302)]"
              )}
              title={`MotionScore: Tier ${item.motionScore} (${item.scoreValue}/5)`}
            >
              Tier {item.motionScore}
            </span>
          )}

          {item.frameworks.map((fw) => (
            <span
              className="rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase"
              key={fw}
            >
              {fw}
            </span>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        {item.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tags?.map((tag) => (
            <span
              className="rounded-md bg-accent/50 px-2 py-0.5 text-[11px] text-muted-foreground"
              key={tag}
            >
              #{tag}
            </span>
          ))}
        </div>

        {item.docUrl && (
          <Link
            className="inline-flex items-center gap-1 font-medium text-primary text-xs hover:underline"
            href={item.docUrl}
          >
            <span>View Documentation</span>
            <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export function RoadmapTimeline() {
  const shouldReduceMotion = useReducedMotion();
  const searchInputId = useId();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [activeFramework, setActiveFramework] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredItems = useMemo(
    () =>
      ROADMAP_ITEMS.filter((item) => {
        if (activeCategory !== "all" && item.category !== activeCategory) {
          return false;
        }
        if (activeStatus !== "all" && item.status !== activeStatus) {
          return false;
        }
        if (
          activeFramework !== "all" &&
          !item.frameworks.includes(activeFramework as Framework)
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesDesc = item.description.toLowerCase().includes(q);
          const matchesTags = item.tags?.some((t) =>
            t.toLowerCase().includes(q)
          );
          const matchesCategory = item.categoryLabel.toLowerCase().includes(q);
          if (!(matchesName || matchesDesc || matchesTags || matchesCategory)) {
            return false;
          }
        }
        return true;
      }),
    [activeCategory, activeStatus, activeFramework, searchQuery]
  );

  const stats = useMemo(() => {
    const total = ROADMAP_ITEMS.length;
    const completed = ROADMAP_ITEMS.filter(
      (i) => i.status === "completed"
    ).length;
    const inProgress = ROADMAP_ITEMS.filter(
      (i) => i.status === "in-progress"
    ).length;
    const planned = ROADMAP_ITEMS.filter(
      (i) => i.status === "planned" || i.status === "under-consideration"
    ).length;
    const baseUiTotal = ROADMAP_ITEMS.filter(
      (i) => i.category === "base-ui"
    ).length;
    const baseUiCompleted = ROADMAP_ITEMS.filter(
      (i) => i.category === "base-ui" && i.status === "completed"
    ).length;
    const radixUiTotal = ROADMAP_ITEMS.filter(
      (i) => i.category === "radix-ui"
    ).length;
    const radixUiCompleted = ROADMAP_ITEMS.filter(
      (i) => i.category === "radix-ui" && i.status === "completed"
    ).length;
    return {
      total,
      completed,
      inProgress,
      planned,
      baseUiTotal,
      baseUiCompleted,
      radixUiTotal,
      radixUiCompleted,
    };
  }, []);

  return (
    <div className="not-prose my-8 flex flex-col gap-10">
      {/* Priority Strategy Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/30 p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
              <Sparkles className="size-3.5" /> Release Strategy & Priority
            </span>
            <span className="font-mono text-muted-foreground text-xs">
              Phase 1: Base UI • Phase 2: Radix UI • Phase 3: Other Headless
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-2xl text-foreground tracking-tight">
              Base UI First, Radix UI Next, Multi-Headless Architecture
            </h3>
            <p className="mt-2 max-w-3xl text-muted-foreground text-sm leading-relaxed">
              We are prioritizing all{" "}
              <strong>13 core Base UI animated components</strong> to deliver a
              complete, modern, accessible foundation. Radix UI animation
              primitives follow in Phase 2, with React Aria, Ark UI, and
              multi-framework expansions scheduled next.
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border bg-background/60 p-3.5 backdrop-blur-sm">
              <div className="text-muted-foreground text-xs">
                Base UI Progress (Phase 1)
              </div>
              <div className="mt-1 font-bold text-foreground text-xl">
                {stats.baseUiCompleted} / {stats.baseUiTotal}
                <span className="ml-1.5 font-normal text-muted-foreground text-xs">
                  (
                  {Math.round(
                    (stats.baseUiCompleted / stats.baseUiTotal) * 100
                  )}
                  %)
                </span>
              </div>
            </div>
            <div className="rounded-xl border bg-background/60 p-3.5 backdrop-blur-sm">
              <div className="text-muted-foreground text-xs">
                Radix UI Suite (Phase 2)
              </div>
              <div className="mt-1 font-bold text-foreground text-xl">
                {stats.radixUiCompleted} / {stats.radixUiTotal}
              </div>
            </div>
            <div className="rounded-xl border bg-background/60 p-3.5 backdrop-blur-sm">
              <div className="text-muted-foreground text-xs">
                Target Frameworks
              </div>
              <div className="mt-1 font-bold text-foreground text-xl">
                React • JS • Vue
              </div>
            </div>
            <div className="rounded-xl border bg-background/60 p-3.5 backdrop-blur-sm">
              <div className="text-muted-foreground text-xs">Open Source</div>
              <div className="mt-1 font-bold text-emerald-500 text-xl">
                100% Free / MIT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MotionScore Benchmark Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg">
            MotionScore™ Quality Framework
          </h3>
          <p className="text-muted-foreground text-xs">
            Every Sora UI component is benchmarked against strict physics,
            accessibility, and performance metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {MOTIONSCORE_BENCHMARKS.map((benchmark) => (
            <div
              className={cn(
                "flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:border-foreground/30",
                benchmark.color
              )}
              key={benchmark.tier}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-2xl tracking-tighter">
                    {benchmark.tier}
                  </span>
                  <span className="rounded-md border bg-background/80 px-2 py-0.5 font-mono text-xs">
                    Tier {benchmark.tier}
                  </span>
                </div>
                <div className="mt-2 font-semibold text-sm">
                  {benchmark.label}
                </div>
              </div>
              <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                {benchmark.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="flex flex-col gap-4 rounded-xl border bg-accent/20 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-lg border bg-background py-2 pr-4 pl-9 text-foreground text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              id={searchInputId}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components (e.g. Accordion, Dialog, Tabs, Switch)..."
              type="text"
              value={searchQuery}
            />
            {searchQuery && (
              <button
                aria-label="Clear search query"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-xs hover:text-foreground"
                onClick={() => setSearchQuery("")}
                type="button"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 font-medium text-muted-foreground text-xs">
              <Filter className="size-3" /> Status:
            </span>
            {(
              [
                { label: "All", value: "all" },
                { label: "Completed", value: "completed" },
                { label: "In Progress", value: "in-progress" },
                { label: "Planned", value: "planned" },
              ] as const
            ).map((status) => (
              <button
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs transition-colors",
                  activeStatus === status.value
                    ? "bg-foreground font-medium text-background"
                    : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                key={status.value}
                onClick={() => setActiveStatus(status.value)}
                type="button"
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-t pt-3">
          <span className="mr-1 text-muted-foreground text-xs">Category:</span>
          {(
            [
              { label: "All UI Components", value: "all" },
              { label: "Phase 1: Base UI", value: "base-ui" },
              { label: "Phase 2: Radix UI", value: "radix-ui" },
              { label: "Phase 3: Other Headless", value: "other-headless" },
              { label: "Phase 4: Cross-Platform", value: "cross-platform" },
            ] as const
          ).map((cat) => (
            <button
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs transition-colors",
                activeCategory === cat.value
                  ? "border-primary bg-primary font-medium text-primary-foreground"
                  : "border-transparent bg-background/60 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              type="button"
            >
              {cat.label}
            </button>
          ))}

          {/* Platform chips */}
          <div className="ml-auto flex items-center gap-1 pt-1 sm:pt-0">
            <span className="mr-1 text-muted-foreground text-xs">
              Platform:
            </span>
            {(
              [
                { label: "All", value: "all" },
                { label: "React", value: "react" },
                { label: "Vue", value: "vue" },
                { label: "JS", value: "js" },
              ] as const
            ).map((plat) => (
              <button
                className={cn(
                  "rounded px-2 py-0.5 font-mono text-xs transition-colors",
                  activeFramework === plat.value
                    ? "bg-foreground font-semibold text-background"
                    : "bg-accent/60 text-muted-foreground hover:text-foreground"
                )}
                key={plat.value}
                onClick={() => setActiveFramework(plat.value)}
                type="button"
              >
                {plat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative flex flex-col gap-6 pl-4 before:absolute before:top-2 before:bottom-2 before:left-1.5 before:w-0.5 before:bg-border md:pl-8 md:before:left-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground text-sm">
            No components match your search and filter criteria. Try resetting
            filters.
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <RoadmapCard
              index={index}
              item={item}
              key={item.id}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))
        )}
      </div>

      {/* 100% Free & Open Source Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-neutral-900 to-neutral-950 p-6 text-white md:p-8 dark:border-neutral-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-medium text-emerald-300 text-xs">
              <Sparkles className="size-3.5" /> 100% Free & Open Source
            </div>
            <h4 className="font-bold text-xl tracking-tight">
              Free forever • MIT Licensed • Community Driven
            </h4>
            <p className="max-w-2xl text-neutral-300 text-sm leading-relaxed">
              Every Base UI, Radix UI, and Motion primitive is completely free
              to use in personal and commercial projects. Copy-paste source code
              directly into your app.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 font-medium text-neutral-950 text-sm shadow-sm transition-colors hover:bg-neutral-200"
              href="/catalog"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
