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

interface RegistryEntry {
  files?: Array<{ target?: string }>;
  registryDependencies?: string[];
}

/**
 * Walks `registryDependencies` for internal (`@soralabs/*`) items — e.g. the
 * shared hooks a primitive installs alongside itself — so the file tree
 * matches everything the CLI actually writes to disk, not just the
 * component's own file.
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
