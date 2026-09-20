import type { InferSchema, ToolMetadata } from "xmcp";
import { z } from "zod";
import {
  type AgentMetadata,
  getItemSource,
  RegistryFetchError,
  type RegistryItem,
} from "../registry/sora-registry-source";

export const schema = {
  components: z
    .array(z.string().min(1))
    .min(1)
    .max(12)
    .describe(
      "Installable Sora registry names to compose together (e.g. ['base-dialog', 'base-button'] or ['button', 'dialog'])."
    ),
  cwd: z
    .string()
    .optional()
    .describe("Monorepo target workspace if applicable (e.g. 'packages/ui')"),
};

export const metadata: ToolMetadata = {
  name: "validate_composition",
  description:
    "Validate a proposed Sora UI composition: checks for Base UI vs Radix UI foundation mismatches, modal overlay collisions, RTL/bidirectional motion requirements, dependencies, and agent metadata guardrails.",
  annotations: {
    title: "Validate UI Composition",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

const DIRECTIONAL_ITEMS = new Set([
  "base-context-menu",
  "base-dropdown-menu",
  "radix-context-menu",
  "radix-dropdown-menu",
  "base-accordion",
  "radix-accordion",
  "stagger-button",
  "sliding-chip-button",
  "tilt-slide-transition",
  "infinite-scrolling-images",
  "scroll-chapters",
]);

const MODAL_OVERLAYS = new Set([
  "base-dialog",
  "base-alert-dialog",
  "radix-dialog",
  "radix-alert-dialog",
]);

const SORALABS_SCOPE_PREFIX_REGEX = /^@soralabs\//;

async function resolveItem(rawName: string): Promise<RegistryItem | null> {
  const name = rawName.trim().replace(SORALABS_SCOPE_PREFIX_REGEX, "");
  const direct = await getItemSource(name);
  if (direct) {
    return direct;
  }
  if (!(name.startsWith("base-") || name.startsWith("radix-"))) {
    return await getItemSource(`base-${name}`);
  }
  return null;
}

function checkFoundationMismatch(items: RegistryItem[]): string[] {
  const baseItems = items.filter(
    (i) =>
      i.name.startsWith("base-") || i.dependencies?.includes("@base-ui/react")
  );
  const radixItems = items.filter(
    (i) =>
      i.name.startsWith("radix-") ||
      i.dependencies?.includes("radix-ui") ||
      i.dependencies?.some((d) => d.startsWith("@radix-ui/"))
  );

  if (baseItems.length > 0 && radixItems.length > 0) {
    return [
      `⚠️ **Heterogeneous UI Foundations**: Composition mixes Base UI (${baseItems.map((i) => i.name).join(", ")}) and Radix UI (${radixItems.map((i) => i.name).join(", ")}).`,
      "  - Base UI components use the `render={<Component />}` pattern.",
      "  - Radix UI components use the `asChild` Slot pattern.",
      "  - Mixing both increases bundle size with two separate primitive runtimes.",
      "  - **Recommendation**: Unify on either Base UI (Phase 1 focus) or Radix UI for consistency.",
    ];
  }
  return [];
}

function checkOverlayCollisions(items: RegistryItem[]): string[] {
  const modals = items.filter((i) => MODAL_OVERLAYS.has(i.name));
  if (modals.length > 1) {
    return [
      `⚠️ **Multiple Modal Overlays Detected** (${modals.map((i) => i.name).join(", ")}):`,
      "  - Avoid nesting DialogContent directly inside DialogContent.",
      "  - Ensure separate portal roots and independently managed open states.",
      "  - Synchronize focus restoration and ESC key dismissal order.",
    ];
  }
  return [];
}

function checkRtlAdvice(items: RegistryItem[]): string[] {
  const directional = items.filter((i) => DIRECTIONAL_ITEMS.has(i.name));
  if (directional.length > 0) {
    return [
      `🌐 **Bidirectional (RTL) Guidelines** (detected on ${directional.map((i) => i.name).join(", ")}):`,
      "  - Use Tailwind CSS logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `border-s-*`, `border-e-*`, `start-*`, `end-*`) instead of `left-*`, `right-*`, `pl-*`, `pr-*`.",
      "  - Directional sliding animations (`x: -20` vs `x: 20`) require transform direction inversion when `dir='rtl'` is active.",
      "  - Popovers, context menus, and cascaded submenus should flip horizontal alignment in RTL locales.",
    ];
  }
  return [];
}

function checkDependencies(
  items: RegistryItem[],
  names: Set<string>
): string[] {
  return items.flatMap((item) =>
    (item.registryDependencies ?? []).flatMap((dep) => {
      if (!dep.startsWith("@soralabs/")) {
        return [];
      }
      const name = dep.slice("@soralabs/".length);
      return names.has(name)
        ? []
        : [
            `${item.name} expects registry dependency ${name}; include it or let shadcn install it transitively.`,
          ];
    })
  );
}

function collectAgentMetadata(items: RegistryItem[]): string[] {
  return items.flatMap((item) => {
    const agent = item.meta?.agentMetadata as AgentMetadata | undefined;
    if (!agent || typeof agent !== "object") {
      return [`${item.name}: No published agent metadata.`];
    }
    return [
      ...(agent.intent ? [`${item.name} intent: ${agent.intent}`] : []),
      ...(agent.motionEngine
        ? [`${item.name} motion: ${agent.motionEngine}`]
        : []),
      ...(agent.a11yConstraints ?? []).map((c) => `${item.name} a11y: ${c}`),
      ...(agent.compositionRules ?? []).map((r) => `${item.name} rule: ${r}`),
      ...(agent.compositionRecipes ?? []).map(
        (rc) => `${item.name} recipe: ${rc}`
      ),
    ];
  });
}

export default async function validateComposition({
  components,
  cwd,
}: InferSchema<typeof schema>) {
  try {
    const items = await Promise.all(
      components.map((name) => resolveItem(name))
    );
    const missing = components.filter((_, index) => !items[index]);
    if (missing.length > 0) {
      return `Unknown registry components: ${missing.join(", ")}. Call get_component_info without a name to list valid items.`;
    }

    const resolved = items.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );
    const uniqueItems = Array.from(
      new Map(resolved.map((item) => [item.name, item])).values()
    );
    const resolvedNames = uniqueItems.map((item) => item.name);
    const namesSet = new Set(resolvedNames);

    const foundationWarnings = checkFoundationMismatch(uniqueItems);
    const overlayWarnings = checkOverlayCollisions(uniqueItems);
    const rtlAdvice = checkRtlAdvice(uniqueItems);
    const dependencyWarnings = checkDependencies(uniqueItems, namesSet);
    const metadataRules = collectAgentMetadata(uniqueItems);

    const cwdFlag = cwd ? ` --cwd "${cwd}"` : "";
    const installCmd = `npx shadcn@latest add ${resolvedNames.map((name) => `@soralabs/${name}`).join(" ")}${cwdFlag} --yes`;

    const sections = [
      "# Composition Validation Report",
      `Requested components: ${components.join(", ")}`,
      `Resolved registry items: ${resolvedNames.join(", ")}`,
      "",
      "## Installation Command",
      `\`${installCmd}\``,
    ];

    if (foundationWarnings.length > 0) {
      sections.push(
        "",
        "## Foundation Compatibility",
        foundationWarnings.join("\n")
      );
    }

    if (overlayWarnings.length > 0) {
      sections.push(
        "",
        "## Overlay & Focus Warnings",
        overlayWarnings.join("\n")
      );
    }

    if (rtlAdvice.length > 0) {
      sections.push("", "## RTL & Internationalization", rtlAdvice.join("\n"));
    }

    sections.push(
      "",
      "## Dependency Checks",
      dependencyWarnings.length > 0
        ? dependencyWarnings.map((w) => `- ${w}`).join("\n")
        : "- All internal registry dependencies resolved."
    );

    sections.push(
      "",
      "## Agent Metadata & Guardrails",
      metadataRules.length > 0
        ? metadataRules.map((r) => `- ${r}`).join("\n")
        : "- No component metadata published."
    );

    sections.push(
      "",
      "Use these guidelines when generating UI code. This tool does not create or modify files."
    );

    return sections.join("\n");
  } catch (error) {
    if (error instanceof RegistryFetchError) {
      return `Composition validation failed: ${error.message}`;
    }
    throw error;
  }
}
