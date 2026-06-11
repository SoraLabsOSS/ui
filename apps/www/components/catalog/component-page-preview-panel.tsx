"use client";

import { type Binds, Tweakpane } from "@workspace/ui/components/docs/tweakpane";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/ui/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { index } from "@/__registry__";
import { DynamicCodeBlock } from "@/components/docs/dynamic-codeblock";
import {
  extractPropsForCodegen,
  generateUsageExampleCode,
  installImportPathFromTarget,
} from "@/lib/docs/generate-usage-example-code";
import {
  catalogPreviewMobilePanelClassName,
  catalogPreviewScreenClassName,
  catalogPreviewToolbarRowClassName,
  catalogPreviewViewportClassName,
} from "./catalog-preview-classes";
import { CatalogScrollArea } from "./catalog-scroll-area";
import { ComponentPagePreviewToolbar } from "./component-page-preview-toolbar";

type RegistryIndexEntry = (typeof index)[string];

interface ComponentPagePreviewPanelProps {
  className?: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  previewName: string;
  registryName: string;
  sticky?: boolean;
}

function resolveDemoProps(name: string): Record<string, unknown> {
  const entry = index[name] as RegistryIndexEntry | undefined;
  const direct = entry?.component?.demoProps;
  if (direct && Object.keys(direct).length > 0) {
    return direct;
  }

  for (const dep of entry?.registryDependencies ?? []) {
    const inherited = (index[dep] as RegistryIndexEntry | undefined)?.component
      ?.demoProps;
    if (inherited && Object.keys(inherited).length > 0) {
      return inherited;
    }
  }

  return {};
}

function resolveUsageCodeEntry(
  previewName: string,
  registryName: string
): RegistryIndexEntry | undefined {
  const autoDemoName = `demo-${registryName}`;
  const autoEntry = index[autoDemoName] as RegistryIndexEntry | undefined;
  if (autoEntry?.files?.[0]?.content) {
    return autoEntry;
  }

  const previewEntry = index[previewName] as RegistryIndexEntry | undefined;
  if (previewEntry?.files?.[0]?.content) {
    return previewEntry;
  }

  return index[registryName] as RegistryIndexEntry | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenFirstLevel<T>(input: Record<string, any>): T {
  return Object.values(input).reduce(
    (acc, current) => ({ ...acc, ...current }),
    {} as T
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapValues(obj: Record<string, any>): Record<string, any> {
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    if ("value" in obj) {
      return obj.value;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        result[key] = unwrapValues(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

export function ComponentPagePreviewPanel({
  previewName,
  registryName,
  className,
  isExpanded,
  onToggleExpanded,
  sticky = true,
}: ComponentPagePreviewPanelProps) {
  const [binds, setBinds] = useState<Binds | null>(null);
  const [componentProps, setComponentProps] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const previousPropsSnapshot = useRef<string | null>(null);

  const demoPropsConfig = useMemo(
    () => resolveDemoProps(previewName),
    [previewName]
  );

  const usageCodeMeta = useMemo(() => {
    const entry = resolveUsageCodeEntry(previewName, registryName);
    const file = entry?.files?.[0];

    return {
      staticContent: file?.content ?? null,
      title: file?.target?.split("/").pop() ?? `${previewName}.tsx`,
      installTarget: (index[registryName] as RegistryIndexEntry | undefined)
        ?.files?.[0]?.target,
    };
  }, [previewName, registryName]);

  const displayCode = useMemo(() => {
    const { installTarget, staticContent } = usageCodeMeta;

    if (
      Object.keys(demoPropsConfig).length > 0 &&
      componentProps &&
      installTarget
    ) {
      const extracted = extractPropsForCodegen(demoPropsConfig, componentProps);
      if (extracted) {
        return generateUsageExampleCode({
          componentName: extracted.componentName,
          importPath: installImportPathFromTarget(installTarget),
          props: extracted.props,
        });
      }
    }

    return staticContent;
  }, [demoPropsConfig, componentProps, usageCodeMeta]);

  const preview = useMemo(() => {
    const Component = index[previewName]?.component;
    if (Object.keys(demoPropsConfig).length !== 0) {
      if (componentProps === null) {
        setComponentProps(unwrapValues(demoPropsConfig));
      }
      if (binds === null) {
        setBinds(demoPropsConfig as Binds);
      }
    }

    if (!Component) {
      return (
        <p className="text-muted-foreground text-sm">
          Preview for{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {previewName}
          </code>{" "}
          is not available.
        </p>
      );
    }

    return <Component {...flattenFirstLevel(componentProps ?? {})} />;
  }, [previewName, componentProps, binds, demoPropsConfig]);

  useEffect(() => {
    if (!binds) {
      return;
    }
    setComponentProps(unwrapValues(binds));
  }, [binds]);

  useEffect(() => {
    if (componentProps === null) {
      return;
    }

    const snapshot = JSON.stringify(componentProps);

    if (previousPropsSnapshot.current === null) {
      previousPropsSnapshot.current = snapshot;
      return;
    }

    if (previousPropsSnapshot.current === snapshot) {
      return;
    }

    previousPropsSnapshot.current = snapshot;
    setPreviewKey((current) => current + 1);
  }, [componentProps]);

  const handleRestart = useCallback(() => {
    if (binds) {
      setBinds({ ...demoPropsConfig } as Binds);
      setComponentProps(unwrapValues(demoPropsConfig));
    }
    setPreviewKey((current) => current + 1);
  }, [binds, demoPropsConfig]);

  const remountKey = `${previewKey}`;

  const previewBody = (
    <div className="w-full px-6 md:px-10 lg:px-0">
      <div
        className="w-full"
        key={remountKey}
        onClickCapture={(event) => {
          const anchor = (event.target as HTMLElement).closest("a[href]");
          if (anchor) {
            event.preventDefault();
          }
        }}
      >
        <Suspense
          fallback={
            <div
              className={cn(
                catalogPreviewScreenClassName,
                "flex w-full items-center justify-center gap-2 text-muted-foreground text-sm"
              )}
            >
              <Loader className="size-4 animate-spin" />
              Loading preview...
            </div>
          }
        >
          {preview}
        </Suspense>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "relative flex w-full flex-1 flex-col overflow-hidden rounded-2xl border border-border/50 bg-secondary",
          catalogPreviewMobilePanelClassName,
          "lg:min-h-0",
          sticky && "lg:h-full",
          className
        )}
      >
        <div className={catalogPreviewToolbarRowClassName}>
          <ComponentPagePreviewToolbar
            controlsOpen={controlsOpen}
            isExpanded={isExpanded}
            onOpenSource={() => setSourceOpen(true)}
            onRestart={handleRestart}
            onToggleControls={() => setControlsOpen((open) => !open)}
            onToggleExpanded={onToggleExpanded}
          />
        </div>

        <CatalogScrollArea
          className="min-h-0 flex-1"
          viewportClassName={catalogPreviewViewportClassName}
        >
          {previewBody}
        </CatalogScrollArea>

        {controlsOpen && binds ? (
          <div className="border-border/50 border-t bg-background p-3">
            <Tweakpane binds={binds} onBindsChange={setBinds} />
          </div>
        ) : null}
      </div>

      <Sheet onOpenChange={setSourceOpen} open={sourceOpen}>
        <SheetContent
          className="w-full overflow-y-auto sm:max-w-2xl"
          side="right"
        >
          <SheetHeader>
            <SheetTitle>Source</SheetTitle>
            <SheetDescription>
              Demo implementation for {registryName}.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 [&_pre]:max-h-[70vh]">
            <DynamicCodeBlock
              code={displayCode ?? undefined}
              lang="tsx"
              title={usageCodeMeta.title}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
