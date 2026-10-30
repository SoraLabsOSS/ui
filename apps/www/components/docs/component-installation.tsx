"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { index, loadComponentHtml, loadComponentSource } from "@/__registry__";
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
  const [manualCode, setManualCode] = useState<string | undefined>(undefined);
  const [manualHtml, setManualHtml] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("shadcn");
  const component = index[name];
  const containerRef = useRef<HTMLDivElement>(null);

  const loadSource = useCallback(() => {
    Promise.all([loadComponentSource(name), loadComponentHtml(name)]).then(
      ([code, html]) => {
        if (code) {
          setManualCode(code);
        }
        if (html) {
          setManualHtml(html);
        }
      }
    );
  }, [name]);

  // Pre-load component source in background on mount and cancel stale requests on name change
  useEffect(() => {
    let canceled = false;
    setManualCode(undefined);
    setManualHtml(undefined);

    Promise.all([loadComponentSource(name), loadComponentHtml(name)]).then(
      ([code, html]) => {
        if (canceled) {
          return;
        }
        if (code) {
          setManualCode(code);
        }
        if (html) {
          setManualHtml(html);
        }
      }
    );

    return () => {
      canceled = true;
    };
  }, [name]);

  const commandTarget = component?.command ?? name;

  const shadcnCommands = useMemo(
    () => ({
      npm: `npx shadcn@latest add ${commandTarget}`,
      pnpm: `pnpm dlx shadcn@latest add ${commandTarget}`,
      yarn: `yarn dlx shadcn@latest add ${commandTarget}`,
      bun: `bun x --bun shadcn@latest add ${commandTarget}`,
    }),
    [commandTarget]
  );

  const soraCliCommands = useMemo(
    () => ({
      npm: `npx @soralabs/cli@latest add ${name}`,
      pnpm: `pnpm dlx @soralabs/cli@latest add ${name}`,
      yarn: `yarn dlx @soralabs/cli@latest add ${name}`,
      bun: `bun x --bun @soralabs/cli@latest add ${name}`,
    }),
    [name]
  );

  if (!component) {
    return null;
  }

  return (
    <div
      className={cn("relative my-4 lg:max-w-[120ch]", className)}
      ref={containerRef}
      {...props}
    >
      <Tabs
        className="w-full gap-0 overflow-hidden rounded-xl border border-border/60"
        onValueChange={(val) => {
          if (val === "manual") {
            loadSource();
          }
          setActiveTab(val);
        }}
        value={activeTab}
      >
        <div className="flex h-10 items-center border-border/50 border-b px-3">
          <TabsList className="flex items-center gap-0.5">
            <TabsHighlight
              className="h-full rounded-md bg-accent"
              containerClassName="relative isolate flex items-center gap-0.5"
              mode="parent"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
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
                  onFocus={loadSource}
                  onMouseEnter={loadSource}
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
              code={manualCode}
              dependencies={component.dependencies}
              devDependencies={component.devDependencies}
              html={manualHtml}
              isActive={activeTab === "manual"}
              path={component.files?.[0]?.target}
              registryDependencies={component.registryDependencies}
              shouldRenderCode={true}
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
