"use client";

import {
  FileTree,
  type FileTreeElement,
} from "@workspace/ui/components/file-tree";
import { cn } from "@workspace/ui/lib/utils";
import { memo, useMemo } from "react";
import { index } from "@/__registry__";
import { buildInstallFileTree } from "@/lib/registry/build-install-file-tree";

interface ComponentFileStructureProps {
  className?: string;
  name: string;
}

const SORALABS_DEP_PREFIX = "@soralabs/";

/** Shadcn deps that install outside `components/ui` (or nowhere visible). */
const SHADCN_DEP_TARGETS: Record<string, string | null> = {
  utils: null,
};

interface RegistryEntry {
  files?: Array<{ target?: string }>;
  registryDependencies?: string[];
}

/**
 * Maps a plain shadcn dep (e.g. `button`) to its standard install target,
 * or null when it installs outside `components/ui` / has no visible file.
 */
function getShadcnDepTarget(dep: string): string | null {
  // Skip URL-based deps; only bare names resolve to the shadcn registry.
  if (dep.includes("/") || dep.includes(":")) {
    return null;
  }

  if (Object.hasOwn(SHADCN_DEP_TARGETS, dep)) {
    return SHADCN_DEP_TARGETS[dep] ?? null;
  }

  return `components/ui/${dep}.tsx`;
}

function appendRegistryInstallTargets(
  entry: RegistryEntry,
  queue: string[],
  targets: Set<string>
) {
  for (const file of entry.files ?? []) {
    if (file.target) {
      targets.add(file.target);
    }
  }

  for (const dep of entry.registryDependencies ?? []) {
    if (dep.startsWith(SORALABS_DEP_PREFIX)) {
      queue.push(dep.slice(SORALABS_DEP_PREFIX.length));
    } else if (Object.hasOwn(index, dep)) {
      queue.push(dep);
    } else {
      const shadcnTarget = getShadcnDepTarget(dep);
      if (shadcnTarget) {
        targets.add(shadcnTarget);
      }
    }
  }
}

/**
 * Walks `registryDependencies` for internal (`@soralabs/*`) items — e.g. the
 * shared hooks a primitive installs alongside itself — so the file tree
 * matches everything the CLI actually writes to disk, not just the
 * component's own file. Plain shadcn deps (e.g. `button`) map to their
 * standard `components/ui/<name>.tsx` install target.
 */
function getRegistryInstallTargets(name: string): string[] {
  const targets = new Set<string>();
  const visited = new Set<string>();
  const queue = [name];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }
    visited.add(current);

    const entry = (index as Record<string, RegistryEntry | undefined>)[current];
    if (!entry) {
      continue;
    }

    appendRegistryInstallTargets(entry, queue, targets);
  }

  return Array.from(targets);
}

export const ComponentFileStructure = memo(function ComponentFileStructure({
  name,
  className,
}: ComponentFileStructureProps) {
  const elements = useMemo<FileTreeElement[]>(
    () => buildInstallFileTree(getRegistryInstallTargets(name)),
    [name]
  );

  if (elements.length === 0) {
    return null;
  }

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h3 className="font-medium text-foreground text-lg tracking-tight">
        File Structure
      </h3>
      <FileTree
        className="bg-muted/30"
        defaultOpenIds={[elements[0]?.id ?? "your-project"]}
        elements={elements}
        highlightColor="var(--code-highlight)"
      />
    </section>
  );
});

const INSTALLATION_PROJECT_TREE: FileTreeElement[] = [
  {
    id: "your-project",
    name: "your-project",
    type: "folder",
    defaultOpen: true,
    children: [
      {
        id: "your-project/app",
        name: "app",
        type: "folder",
        defaultOpen: true,
        children: [
          {
            id: "your-project/app/page.tsx",
            name: "page.tsx",
            type: "file",
          },
        ],
      },
      {
        id: "your-project/components",
        name: "components",
        type: "folder",
        defaultOpen: true,
        children: [
          {
            id: "your-project/components/sora-ui",
            name: "sora-ui",
            type: "folder",
            defaultOpen: true,
            children: [
              {
                id: "your-project/components/sora-ui/texts",
                name: "texts",
                type: "folder",
                defaultOpen: true,
                children: [
                  {
                    id: "your-project/components/sora-ui/texts/text-effect.tsx",
                    name: "text-effect.tsx",
                    type: "file",
                    highlight: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "your-project/lib",
        name: "lib",
        type: "folder",
        defaultOpen: true,
        children: [
          {
            id: "your-project/lib/utils.ts",
            name: "utils.ts",
            type: "file",
            highlight: true,
          },
        ],
      },
      {
        id: "your-project/components.json",
        name: "components.json",
        type: "file",
        highlight: true,
      },
    ],
  },
];

interface InstallationFileStructureProps {
  className?: string;
}

export function InstallationFileStructure({
  className,
}: InstallationFileStructureProps) {
  return (
    <section className={cn("not-prose my-8 flex flex-col gap-3", className)}>
      <h2 className="font-semibold text-2xl tracking-tight">
        Project structure
      </h2>
      <p className="text-fd-muted-foreground text-sm leading-relaxed">
        After <code className="text-fd-foreground">shadcn init</code>,
        registering <code className="text-fd-foreground">@soralabs</code>, and
        adding a primitive, your app typically looks like this. Highlighted
        files are created or updated by the CLI.
      </p>
      <FileTree
        className="bg-muted/30"
        defaultOpenIds={["your-project"]}
        elements={INSTALLATION_PROJECT_TREE}
        highlightColor="var(--code-highlight)"
      />
    </section>
  );
}
