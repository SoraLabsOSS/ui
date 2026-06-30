"use client";

import {
  FileTree,
  type FileTreeElement,
} from "@workspace/ui/components/unlumen-ui/file-tree";
import { cn } from "@workspace/ui/lib/utils";

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
