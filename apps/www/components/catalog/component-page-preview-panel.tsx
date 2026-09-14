"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCatalogMobileChrome } from "./catalog-mobile-chrome-context";
import {
  catalogPreviewMobilePanelClassName,
  catalogPreviewToolbarRowClassName,
} from "./catalog-preview-classes";
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
  previewName: _previewName,
  registryName,
  className,
  isExpanded,
  onToggleExpanded,
  sticky = true,
}: ComponentPagePreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const isStacked = useCatalogStackedLayout();
  const { setToolbar } = useCatalogMobileChrome();
  const { resolvedTheme } = useTheme();

  const exampleUrl = `/examples/catalog/${registryName}`;

  const handleRestart = useCallback(() => {
    setIframeLoaded(false);
    setPreviewKey((current) => current + 1);
  }, []);

  // Synchronize live theme toggle directly with the iframe DOM and via postMessage
  const syncIframeTheme = useCallback(
    (theme?: string) => {
      const activeTheme = theme || resolvedTheme || "dark";
      const isDark = activeTheme === "dark";
      try {
        const doc = iframeRef.current?.contentDocument;
        if (doc?.documentElement) {
          doc.documentElement.classList.toggle("dark", isDark);
          doc.documentElement.classList.toggle("light", !isDark);
          doc.documentElement.style.colorScheme = activeTheme;
        }
      } catch {
        // Cross-origin fallback
      }

      try {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "sora-catalog-theme-change", theme: activeTheme },
          "*"
        );
      } catch {
        // Ignore
      }
    },
    [resolvedTheme]
  );

  useEffect(() => {
    syncIframeTheme(resolvedTheme);
  }, [resolvedTheme, syncIframeTheme]);

  // Listen for iframe readiness or dismiss loading overlay after fallback timeout
  useEffect(() => {
    if (previewKey < 0) {
      return;
    }
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "sora-catalog-preview-ready") {
        setIframeLoaded(true);
        syncIframeTheme(resolvedTheme);
      }
    }

    // Check if iframe is already loaded
    try {
      if (
        iframeRef.current?.contentDocument?.readyState === "complete" &&
        iframeRef.current.contentDocument.location.pathname !== "blank"
      ) {
        setIframeLoaded(true);
        syncIframeTheme(resolvedTheme);
      }
    } catch {
      // Cross-origin
    }

    // Safety timeout: dismiss loading overlay after 1.2s so it never gets stuck
    const safetyTimer = setTimeout(() => {
      setIframeLoaded(true);
      syncIframeTheme(resolvedTheme);
    }, 1200);

    window.addEventListener("message", handleMessage);
    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener("message", handleMessage);
    };
  }, [previewKey, resolvedTheme, syncIframeTheme]);

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

      <div className="relative min-h-[520px] w-full flex-1 overflow-hidden rounded-b-2xl bg-background max-lg:h-[72dvh] lg:h-full">
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-secondary/80 text-muted-foreground text-sm backdrop-blur-sm">
            <Loader className="size-4 animate-spin" />
            Loading preview...
          </div>
        )}
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Native iframe onLoad state tracking. */}
        <iframe
          className="size-full border-0 bg-background"
          key={`${registryName}-${previewKey}`}
          onLoad={() => {
            setIframeLoaded(true);
            syncIframeTheme(resolvedTheme);
          }}
          ref={iframeRef}
          src={exampleUrl}
          title={`${registryName} preview`}
        />
      </div>

      <ComponentPageSourcePanel
        onClose={handleCloseSource}
        open={isSourceOpen}
        registryName={registryName}
      />
    </div>
  );
}
