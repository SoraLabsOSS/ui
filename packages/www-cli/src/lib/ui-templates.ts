import {
  defaultUiDescription,
  frameworkLabel,
  toPascalCase,
  toTitleCase,
  uiDemoComponentName,
  uiDemoRegistryName,
  uiRegistryName,
  uiRegistryTitle,
} from "./naming.js";
import type { UiFramework } from "./paths.js";

export function buildUiScaffoldLabels(
  framework: UiFramework,
  name: string
): {
  demoComponentName: string;
  demoRegistryName: string;
  description: string;
  exportName: string;
  registryName: string;
  registryTitle: string;
  title: string;
} {
  const title = toTitleCase(name);
  const exportName = toPascalCase(name);

  return {
    title,
    description: defaultUiDescription(framework, title),
    exportName,
    registryName: uiRegistryName(framework, name),
    registryTitle: uiRegistryTitle(framework, title),
    demoRegistryName: uiDemoRegistryName(framework, name),
    demoComponentName: uiDemoComponentName(framework, exportName),
  };
}

export function renderUiIndex(
  framework: UiFramework,
  name: string,
  exportName: string
): string {
  const wireUpHint =
    framework === "base"
      ? "Wire up @base-ui/react and replace this scaffold."
      : "Wire up radix-ui primitives and replace this scaffold.";

  return `"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode, Ref } from "react";

export interface ${exportName}Props {
  /** Child content rendered inside the component. */
  children?: ReactNode;
  /** Additional class names merged onto the root element. */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function ${exportName}({ children, className, ref }: ${exportName}Props) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "flex min-h-24 items-center justify-center rounded-lg border border-dashed p-6",
        className
      )}
      data-slot="${name}"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      ref={ref}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
    >
      {children ?? (
        <span className="text-muted-foreground text-sm">
          ${wireUpHint}
        </span>
      )}
    </motion.div>
  );
}
`;
}

export function renderUiRegistryItem(
  framework: UiFramework,
  name: string,
  labels: ReturnType<typeof buildUiScaffoldLabels>
): string {
  const dependencies =
    framework === "base"
      ? ["@base-ui/react", "motion"]
      : ["radix-ui", "motion"];

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: labels.registryName,
    type: "registry:ui",
    title: labels.registryTitle,
    description: labels.description,
    dependencies,
    registryDependencies: ["utils"],
    files: [
      {
        path: `registry/ui/${framework}/${name}/index.tsx`,
        type: "registry:ui",
        target: `components/sora-ui/${framework}/${name}.tsx`,
      },
    ],
    meta: {
      demoProps: {
        [labels.exportName]: {
          className: {
            value: "min-h-32 w-full max-w-md",
          },
        },
      },
    },
  };

  return `${JSON.stringify(item, null, 2)}\n`;
}

export function renderUiMdx(
  framework: UiFramework,
  name: string,
  labels: ReturnType<typeof buildUiScaffoldLabels>
): string {
  const source = frameworkLabel(framework);

  return `---
title: ${labels.title}
description: ${labels.description}
---

<ComponentPreview name="${labels.demoRegistryName}" description="${labels.description}" />

## Installation

<ComponentInstallation name="${labels.registryName}" />

## Usage

\`\`\`tsx
import { ${labels.exportName} } from '@/components/sora-ui/${framework}/${name}';

export default function Page() {
  return <${labels.exportName}>${labels.title}</${labels.exportName}>;
}
\`\`\`

## Props

<TypeTable
  type={{
    className: {
      description: 'Additional class names merged onto the root element.',
      type: 'string',
    },
    children: {
      description: 'Child content rendered inside the component.',
      type: 'ReactNode',
    },
  }}
/>

## Credits

Built on ${source} and Motion. Expand this section when borrowing external UX ideas.
`;
}

export function renderUiDemoIndex(
  framework: UiFramework,
  name: string,
  exportName: string,
  demoComponentName: string
): string {
  return `"use client";

import { ${exportName}, type ${exportName}Props } from "@/registry/ui/${framework}/${name}";

export default function ${demoComponentName}(props: ${exportName}Props) {
  return (
    <div className="flex min-h-48 items-center justify-center p-6">
      <${exportName} className="w-full max-w-md" {...props}>
        Manual demo — customize this layout.
      </${exportName}>
    </div>
  );
}
`;
}

export function renderUiDemoRegistryItem(
  framework: UiFramework,
  name: string,
  labels: ReturnType<typeof buildUiScaffoldLabels>
): string {
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: labels.demoRegistryName,
    type: "registry:ui",
    title: `${labels.title} Demo`,
    description: `Manual demo for ${labels.registryTitle}.`,
    registryDependencies: [`@soralabs/${labels.registryName}`],
    files: [
      {
        path: `registry/demo/ui/${framework}/${name}/index.tsx`,
        type: "registry:ui",
        target: `components/sora-ui/demo/${framework}/${name}.tsx`,
      },
    ],
  };

  return `${JSON.stringify(item, null, 2)}\n`;
}
