"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";
import { index } from "@/__registry__";
import { CodeTabs } from "@/components/docs/code-tabs";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@/registry/primitives/animate/tabs";
import { ComponentFileStructure } from "./component-file-structure";
import { ComponentManualInstallation } from "./component-manual-installation";

export interface ComponentInstallationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  afterSteps?: ReactNode;
  beforeSteps?: ReactNode;
  hideFileStructure?: boolean;
  name: string;
}

export function ComponentInstallation({
  name,
  className,
  beforeSteps,
  afterSteps,
  children,
  hideFileStructure = false,
  ...props
}: ComponentInstallationProps) {
  const component = index[name];

  if (!component) {
    return null;
  }

  const shadcnCommands = {
    npm: `npx shadcn@latest add ${component?.command ?? name}`,
    pnpm: `pnpm dlx shadcn@latest add ${component?.command ?? name}`,
    yarn: `npx shadcn@latest add ${component?.command ?? name}`,
    bun: `bun x --bun shadcn@latest add ${component?.command ?? name}`,
  };

  const soraCliCommands = {
    npm: `npx @soralabsoss/sora-cli@latest add ${name}`,
    pnpm: `pnpm dlx @soralabsoss/sora-cli@latest add ${name}`,
    yarn: `npx @soralabsoss/sora-cli@latest add ${name}`,
    bun: `bun x --bun @soralabsoss/sora-cli@latest add ${name}`,
  };

  return (
    <div className={cn("relative my-4 lg:max-w-[120ch]", className)} {...props}>
      <Tabs
        className="w-full gap-0 overflow-hidden rounded-xl border border-border/60"
        defaultValue="shadcn"
      >
        <div className="flex h-10 items-center border-border/50 border-b px-3">
          <TabsList className="flex items-center gap-0.5">
            <TabsHighlight
              className="h-full rounded-md bg-accent"
              containerClassName="relative isolate flex items-center gap-0.5"
              mode="parent"
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <TabsHighlightItem value="shadcn">
                <TabsTrigger
                  className="relative z-10 h-7 rounded-md px-3 text-muted-foreground text-sm transition-colors data-[state=active]:text-foreground"
                  value="shadcn"
                >
                  shadcn CLI
                </TabsTrigger>
              </TabsHighlightItem>
              <TabsHighlightItem value="sora-cli">
                <TabsTrigger
                  className="relative z-10 h-7 rounded-md px-3 text-muted-foreground text-sm transition-colors data-[state=active]:text-foreground"
                  value="sora-cli"
                >
                  Sora CLI
                </TabsTrigger>
              </TabsHighlightItem>
              <TabsHighlightItem value="manual">
                <TabsTrigger
                  className="relative z-10 h-7 rounded-md px-3 text-muted-foreground text-sm transition-colors data-[state=active]:text-foreground"
                  value="manual"
                >
                  Manual
                </TabsTrigger>
              </TabsHighlightItem>
            </TabsHighlight>
          </TabsList>
        </div>

        <TabsContents>
          <TabsContent className="p-1.5" value="shadcn">
            <CodeTabs className="rounded-lg border-0" codes={shadcnCommands} />
          </TabsContent>
          <TabsContent className="p-1.5" value="sora-cli">
            <CodeTabs className="rounded-lg border-0" codes={soraCliCommands} />
          </TabsContent>
          <TabsContent className="p-4" value="manual">
            <ComponentManualInstallation
              afterSteps={afterSteps}
              beforeSteps={beforeSteps}
              code={component.files?.[0]?.content}
              dependencies={component.dependencies}
              devDependencies={component.devDependencies}
              path={component.files?.[0]?.target}
              registryDependencies={component.registryDependencies}
            >
              {children}
            </ComponentManualInstallation>
          </TabsContent>
        </TabsContents>
      </Tabs>

      {!hideFileStructure && <ComponentFileStructure name={name} />}
    </div>
  );
}
