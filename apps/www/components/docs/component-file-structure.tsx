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

function getRegistryInstallTargets(name: string): string[] {
  const component = index[name] as
    | { files?: Array<{ target?: string }> }
    | undefined;
  if (!component?.files?.length) {
    return [];
  }

  return component.files
    .map((file: { target?: string }) => file.target)
    .filter((target): target is string => Boolean(target));
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
