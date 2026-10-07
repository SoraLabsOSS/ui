"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown, Loader } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { previewComponents } from "@/__registry__/preview";
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

  const exampleUrl = `/examples/catalog/${registryName}`;

  const preview = useMemo(() => {
    const Component =
      previewComponents[`demo-${previewName}`] ??
      previewComponents[previewName] ??
      previewComponents[`demo-${registryName}`] ??
      previewComponents[registryName] ??
      null;

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
  }, [previewName, registryName]);

  const handleRestart = useCallback(() => {
    setPreviewKey((current) => current + 1);
  }, []);

  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(
      "[data-catalog-scroll-root]"
    );
    if (!scroller) {
      return;
    }

    const handleScroll = () => {
      setIsScrolledDown(scroller.scrollTop > 60);
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToDocs = useCallback(() => {
    const scroller = document.querySelector<HTMLElement>(
      "[data-catalog-scroll-root]"
    );
    const docsPanel = document.querySelector<HTMLElement>(
      "[data-catalog-docs-panel]"
    );
    if (scroller && docsPanel) {
      const targetTop = docsPanel.offsetTop;
      scroller.scrollTo({
        top: Math.max(0, targetTop - 56),
        behavior: "smooth",
      });
    } else if (docsPanel) {
      docsPanel.scrollIntoView({ behavior: "smooth" });
    }
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
        exampleUrl={exampleUrl}
        hasSourceCode
        isExpanded={isExpanded}
        isSourceOpen={isSourceOpen}
        onRestart={handleRestart}
        onToggleExpanded={handleToggleExpanded}
        onToggleSource={handleToggleSource}
      />
    ),
    [
      exampleUrl,
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

  const remountKey = `${registryName}-${previewKey}`;

  const previewBody = (
    <div className="relative w-full max-lg:px-0 lg:px-0">
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

      {/* Mobile Jump to Docs Pill */}
      {isStacked && !isExpanded && (
        <button
          aria-label="Scroll to documentation"
          className={cn(
            "pointer-events-auto fixed bottom-4 left-1/2 z-20 -translate-x-1/2 lg:hidden",
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5",
            "border border-border/40 bg-background/85 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl",
            "font-medium text-foreground/85 text-xs transition-all duration-300",
            "hover:bg-background hover:text-foreground active:scale-95",
            isScrolledDown
              ? "pointer-events-none translate-y-3 opacity-0"
              : "translate-y-0 opacity-100"
          )}
          onClick={handleScrollToDocs}
          type="button"
        >
          <span>Documentation</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex w-full flex-col border border-border/50 bg-secondary",
        "rounded-2xl max-lg:rounded-3xl",
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
