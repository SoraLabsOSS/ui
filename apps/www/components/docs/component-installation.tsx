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
import {
  index,
  loadComponentFiles,
  loadComponentHtml,
  loadComponentSource,
} from "@/__registry__";
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
import {
  ComponentManualInstallation,
  type ManualInstallFile,
} from "./component-manual-installation";

interface ComponentData {
  code?: string;
  files?: ManualInstallFile[];
  html?: string;
}

const componentDataCache = new Map<string, Promise<ComponentData>>();

function fetchComponentData(name: string): Promise<ComponentData> {
  const cached = componentDataCache.get(name);
  if (cached) {
    return cached;
  }

  const promise = Promise.all([
    loadComponentSource(name),
    loadComponentHtml(name),
    loadComponentFiles(name),
  ])
    .then(([code, html, files]) => ({
      code: code ?? undefined,
      html: html ?? undefined,
      files: files ?? [],
    }))
    .catch((err) => {
      componentDataCache.delete(name);
      throw err;
    });

  componentDataCache.set(name, promise);
  return promise;
}

export interface ComponentInstallationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  afterSteps?: ReactNode;
  beforeSteps?: ReactNode;
  hideFileStructure?: boolean;
  name: string;
}

type LoadStatus = "idle" | "loading" | "loaded" | "error";

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
  const [manualFiles, setManualFiles] = useState<ManualInstallFile[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("shadcn");
  const component = index[name];
  const currentNameRef = useRef(name);
  currentNameRef.current = name;
  const loadStateRef = useRef<{ name: string; status: LoadStatus }>({
    name,
    status: "idle",
  });

  const loadSource = useCallback(() => {
    const requestedName = name;
    if (
      loadStateRef.current.name === requestedName &&
      (loadStateRef.current.status === "loading" ||
        loadStateRef.current.status === "loaded")
    ) {
      return;
    }

    loadStateRef.current = { name: requestedName, status: "loading" };
    setLoadStatus("loading");
    setLoadError(null);

    fetchComponentData(requestedName)
      .then((data) => {
        if (currentNameRef.current !== requestedName) {
          return;
        }
        loadStateRef.current = { name: requestedName, status: "loaded" };
        setLoadStatus("loaded");
        if (data.code !== undefined) {
          setManualCode(data.code);
        }
        if (data.html !== undefined) {
          setManualHtml(data.html);
        }
        if (data.files) {
          setManualFiles(data.files);
        }
      })
      .catch((err) => {
        if (currentNameRef.current !== requestedName) {
          return;
        }
        loadStateRef.current = { name: requestedName, status: "error" };
        setLoadStatus("error");
        setLoadError(
          err instanceof Error ? err.message : "Failed to load component source"
        );
      });
  }, [name]);

  const prevNameRef = useRef(name);
  // Reset state when component name changes
  useEffect(() => {
    if (prevNameRef.current !== name) {
      prevNameRef.current = name;
      currentNameRef.current = name;
      loadStateRef.current = { name, status: "idle" };
      setManualCode(undefined);
      setManualHtml(undefined);
      setManualFiles([]);
      setLoadStatus("idle");
      setLoadError(null);
    }
  }, [name]);

  // Automatically trigger lazy loading if user switches directly to manual tab
  useEffect(() => {
    if (activeTab === "manual" && loadStatus === "idle") {
      loadSource();
    }
  }, [activeTab, loadStatus, loadSource]);

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

  let manualContent: ReactNode = null;
  if (loadStatus === "loading") {
    manualContent = (
      <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
        Loading installation files...
      </div>
    );
  } else if (loadStatus === "error") {
    manualContent = (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-sm">
        <p className="text-destructive">{loadError}</p>
        <button
          className="cursor-pointer text-primary text-xs underline"
          onClick={loadSource}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  } else {
    manualContent = (
      <ComponentManualInstallation
        afterSteps={afterSteps}
        beforeSteps={beforeSteps}
        code={manualCode}
        dependencies={component.dependencies}
        devDependencies={component.devDependencies}
        fileGroups={component.fileGroups}
        files={manualFiles}
        html={manualHtml}
        isActive={activeTab === "manual"}
        path={component.files?.[0]?.target}
        registryDependencies={component.registryDependencies}
        shouldRenderCode={true}
      >
        {children}
      </ComponentManualInstallation>
    );
  }

  return (
    <div className={cn("relative my-4 lg:max-w-[120ch]", className)} {...props}>
      <Tabs
        className="w-full gap-0 overflow-hidden rounded-xl border border-border/60"
        onValueChange={setActiveTab}
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

        <TabsContents animateHeight keepMounted={false} lazyMount>
          <TabsContent className="p-1.5" value="shadcn">
            <CodeTabs className="rounded-lg border-0" codes={shadcnCommands} />
          </TabsContent>
          <TabsContent className="p-1.5" value="sora-cli">
            <CodeTabs className="rounded-lg border-0" codes={soraCliCommands} />
          </TabsContent>
          <TabsContent className="p-4" value="manual">
            {manualContent}
          </TabsContent>
        </TabsContents>
      </Tabs>

      {!hideFileStructure && <ComponentFileStructure name={name} />}
    </div>
  );
}
