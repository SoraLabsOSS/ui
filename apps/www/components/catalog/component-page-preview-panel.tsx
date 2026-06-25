"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { index } from "@/__registry__";
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
import { ComponentPageSourcePanel } from "./component-page-source-panel";
import { useCatalogStackedLayout } from "./use-catalog-stacked-layout";

interface ComponentPagePreviewPanelProps {
  className?: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  previewName: string;
  registryName: string;
  sticky?: boolean;
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
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const isStacked = useCatalogStackedLayout();
  const { setToolbar } = useCatalogMobileChrome();

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

  const handleToggleSource = useCallback(() => {
    if (isSourceOpen) {
      setIsSourceOpen(false);
      return;
    }

    if (isExpanded) {
      onToggleExpanded();
    }
    setIsSourceOpen(true);
  }, [isExpanded, isSourceOpen, onToggleExpanded]);

  const handleToggleExpanded = useCallback(() => {
    setIsSourceOpen(false);
    onToggleExpanded();
  }, [onToggleExpanded]);

  const handleCloseSource = useCallback(() => {
    setIsSourceOpen(false);
  }, []);

  const previewToolbar = useMemo(
    () => (
      <ComponentPagePreviewToolbar
        hasSourceCode
        isExpanded={isExpanded}
        isSourceOpen={isSourceOpen}
        onRestart={handleRestart}
        onToggleExpanded={handleToggleExpanded}
        onToggleSource={handleToggleSource}
      />
    ),
    [
      handleRestart,
      handleToggleExpanded,
      handleToggleSource,
      isExpanded,
      isSourceOpen,
    ]
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

      <ComponentPageSourcePanel
        onClose={handleCloseSource}
        open={isSourceOpen}
        registryName={registryName}
      />
    </div>
  );
}
