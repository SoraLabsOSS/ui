"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/ui/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { index } from "@/__registry__";
import { DynamicCodeBlock } from "@/components/docs/dynamic-codeblock";
import { useCatalogMobileChrome } from "./catalog-mobile-chrome-context";
import {
  catalogPreviewMobilePanelClassName,
  catalogPreviewMobileViewportClassName,
  catalogPreviewScreenClassName,
  catalogPreviewToolbarRowClassName,
  catalogPreviewViewportClassName,
} from "./catalog-preview-classes";
import { CatalogScrollArea } from "./catalog-scroll-area";
import { ComponentPagePreviewToolbar } from "./component-page-preview-toolbar";
import { useCatalogStackedLayout } from "./use-catalog-stacked-layout";

type RegistryIndexEntry = (typeof index)[string];

interface ComponentPagePreviewPanelProps {
  className?: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  previewName: string;
  registryName: string;
  sticky?: boolean;
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

export function ComponentPagePreviewPanel({
  previewName,
  registryName,
  className,
  isExpanded,
  onToggleExpanded,
  sticky = true,
}: ComponentPagePreviewPanelProps) {
  const [previewKey, setPreviewKey] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(false);
  const isStacked = useCatalogStackedLayout();
  const { setToolbar } = useCatalogMobileChrome();

  const usageCodeMeta = useMemo(() => {
    const entry = resolveUsageCodeEntry(previewName, registryName);
    const file = entry?.files?.[0];

    return {
      staticContent: file?.content ?? null,
      title: file?.target?.split("/").pop() ?? `${previewName}.tsx`,
    };
  }, [previewName, registryName]);

  const preview = useMemo(() => {
    const Component = index[previewName]?.component;

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

    return <Component />;
  }, [previewName]);

  const handleRestart = useCallback(() => {
    setPreviewKey((current) => current + 1);
  }, []);

  const previewToolbar = useMemo(
    () => (
      <ComponentPagePreviewToolbar
        isExpanded={isExpanded}
        onOpenSource={() => setSourceOpen(true)}
        onRestart={handleRestart}
        onToggleExpanded={onToggleExpanded}
      />
    ),
    [handleRestart, isExpanded, onToggleExpanded]
  );

  useEffect(() => {
    if (!isStacked || isExpanded) {
      setToolbar(null);
      return;
    }

    setToolbar(previewToolbar);
    return () => setToolbar(null);
  }, [isExpanded, isStacked, previewToolbar, setToolbar]);

  const remountKey = `${previewKey}`;

  const previewBody = (
    <div className="w-full max-lg:px-0 lg:px-0">
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
          "relative flex w-full flex-col rounded-2xl border border-border/50 bg-secondary",
          "max-lg:flex-none max-lg:overflow-visible lg:min-h-0 lg:flex-1 lg:overflow-hidden",
          catalogPreviewMobilePanelClassName,
          sticky && "lg:h-full",
          className
        )}
      >
        <div className={cn(catalogPreviewToolbarRowClassName, "max-lg:hidden")}>
          {previewToolbar}
        </div>

        {isStacked && !isExpanded ? (
          <div className={catalogPreviewMobileViewportClassName}>
            {previewBody}
          </div>
        ) : (
          <CatalogScrollArea
            className="min-h-0 flex-1 lg:h-full"
            hideScrollbar
            viewportClassName={catalogPreviewViewportClassName}
          >
            {previewBody}
          </CatalogScrollArea>
        )}
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
              code={usageCodeMeta.staticContent ?? undefined}
              lang="tsx"
              title={usageCodeMeta.title}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
