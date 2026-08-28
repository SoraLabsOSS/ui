import {
  defaultDescription,
  demoExportName,
  toPascalCase,
  toTitleCase,
} from "./naming.js";
import type { PrimitiveCategory } from "./paths.js";

export function renderPrimitiveIndex(name: string, exportName: string): string {
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
        "flex min-h-32 items-center justify-center rounded-lg border border-dashed p-6",
        className
      )}
      data-slot="${name}"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      ref={ref}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35 }}
    >
      {children ?? (
        <span className="text-muted-foreground text-sm">
          Replace this scaffold with your animation.
        </span>
      )}
    </motion.div>
  );
}
`;
}

export function renderPrimitiveRegistryItem(
  name: string,
  category: PrimitiveCategory,
  exportName: string,
  title: string,
  description: string
): string {
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:ui",
    title,
    description,
    dependencies: ["motion"],
    registryDependencies: ["utils"],
    files: [
      {
        path: `registry/primitives/${category}/${name}/index.tsx`,
        type: "registry:ui",
        target: `components/sora-ui/${category}/${name}.tsx`,
      },
    ],
    meta: {
      demoProps: {
        [exportName]: {
          className: {
            value: "min-h-40 w-full max-w-md",
          },
        },
      },
    },
  };

  return `${JSON.stringify(item, null, 2)}\n`;
}

export function renderMotionMdx(
  name: string,
  category: PrimitiveCategory,
  title: string,
  description: string,
  exportName: string
): string {
  return `---
title: ${title}
description: ${description}
---

<ComponentPreview name="${name}" description="${description}" />

## Installation

<ComponentInstallation name="${name}" />

## Usage

\`\`\`tsx
import { ${exportName} } from '@/components/sora-ui/${category}/${name}';

export function Example() {
  return <${exportName}>Hello from ${title}</${exportName}>;
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
`;
}

export function renderDemoIndex(
  name: string,
  category: PrimitiveCategory,
  exportName: string,
  demoComponentName: string
): string {
  return `"use client";

import { ${exportName} } from "@/registry/primitives/${category}/${name}";

export function ${demoComponentName}() {
  return (
    <div className="flex min-h-48 items-center justify-center p-6">
      <${exportName} className="w-full max-w-md">
        Manual demo — customize this layout.
      </${exportName}>
    </div>
  );
}
`;
}

export function renderDemoRegistryItem(
  name: string,
  category: PrimitiveCategory,
  title: string
): string {
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `demo-${name}`,
    type: "registry:ui",
    title: `${title} Demo`,
    description: `Manual demo for ${title}.`,
    registryDependencies: [`@soralabs/${name}`],
    files: [
      {
        path: `registry/demo/primitives/${category}/${name}/index.tsx`,
        type: "registry:ui",
        target: `components/sora-ui/demo/${category}/${name}.tsx`,
      },
    ],
  };

  return `${JSON.stringify(item, null, 2)}\n`;
}

export function buildScaffoldLabels(name: string): {
  demoExportName: string;
  description: string;
  exportName: string;
  title: string;
} {
  const title = toTitleCase(name);
  return {
    title,
    description: defaultDescription(title),
    exportName: toPascalCase(name),
    demoExportName: demoExportName(name),
  };
}
