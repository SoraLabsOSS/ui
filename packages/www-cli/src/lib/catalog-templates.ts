import { toPascalCase, toTitleCase } from "./naming.js";
import type { PrimitiveCategory } from "./paths.js";

export interface CatalogScaffoldLabels {
  description: string;
  exportName: string;
  registryName: string;
  slug: string;
  title: string;
}

export function buildCatalogLabels(
  slug: string,
  registryName?: string
): CatalogScaffoldLabels {
  const title = toTitleCase(slug);
  return {
    slug,
    title,
    description: `${title} layout showcase for animated experiences.`,
    exportName: toPascalCase(slug),
    registryName: registryName?.trim() || slug,
  };
}

export interface RenderCatalogMdxOptions {
  authorName?: string;
  authorUrl?: string;
  category?: PrimitiveCategory | string;
  description: string;
  exportName: string;
  registryName: string;
  slug: string;
  title: string;
}

export function renderCatalogMdx(options: RenderCatalogMdxOptions): string {
  const authorName = options.authorName ?? "Sora UI";
  const authorUrl = options.authorUrl ?? "https://github.com/SoraLabsOSS/ui";
  const category = options.category ?? "effects";

  return `---
title: ${options.title}
description: ${options.description}
category: ${category}
author:
  name: ${authorName}
  url: ${authorUrl}
registryName: ${options.registryName}
---

## Installation

<ComponentInstallation name="${options.registryName}" />

## Usage

Place the layout showcase inside a relatively positioned container.

\`\`\`tsx
import { ${options.exportName} } from "@/components/sora-ui/${category}/${options.registryName}";

export default function ${options.exportName}Demo() {
  return (
    <section className="relative min-h-screen">
      <${options.exportName} />
    </section>
  );
}
\`\`\`
`;
}
