"use client";

import {
  FileTree,
  type FileTreeElement,
} from "@workspace/ui/components/unlumen-ui/file-tree";
import { cn } from "@workspace/ui/lib/utils";
import { useMemo } from "react";
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

  if (dep in SHADCN_DEP_TARGETS) {
    return SHADCN_DEP_TARGETS[dep] ?? null;
  }

  return `components/ui/${dep}.tsx`;
}

/**
 * Walks `registryDependencies` for internal (`@soralabs/*`) items — e.g. the
 * shared hooks a primitive installs alongside itself — so the file tree
 * matches everything the CLI actually writes to disk, not just the
 * component's own file. Plain shadcn deps (e.g. `button`) map to their
 * standard `components/ui/<name>.tsx` install target.
 */
function getRegistryInstallTargets(name: string): string[] {
  const targets: string[] = [];
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

    for (const file of entry.files ?? []) {
      if (file.target) {
        targets.push(file.target);
      }
    }

    for (const dep of entry.registryDependencies ?? []) {
      if (dep.startsWith(SORALABS_DEP_PREFIX)) {
        queue.push(dep.slice(SORALABS_DEP_PREFIX.length));
        continue;
      }

      if (dep in index) {
        queue.push(dep);
        continue;
      }

      const shadcnTarget = getShadcnDepTarget(dep);
      if (shadcnTarget && !targets.includes(shadcnTarget)) {
        targets.push(shadcnTarget);
      }
    }
  }

  return targets;
}

export function ComponentFileStructure({
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
}
