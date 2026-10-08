"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown, Loader, MousePointerClick } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCatalogMobileChrome } from "./catalog-mobile-chrome-context";
import {
  catalogPreviewMobilePanelClassName,
  catalogPreviewToolbarRowClassName,
} from "./catalog-preview-classes";
import { ComponentPagePreviewToolbar } from "./catalog-preview-toolbar";
import { ComponentPageSourcePanel } from "./catalog-source-panel";
import { useCatalogStackedLayout } from "./use-catalog-stacked-layout";

interface ComponentPagePreviewPanelProps {
  className?: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  previewName: string;
  registryName: string;
  sticky?: boolean;
}

const mobileDockTransition = {
  type: "spring",
  bounce: 0,
  duration: 0.28,
} as const;

export function ComponentPagePreviewPanel({
  previewName: _previewName,
  registryName,
  className,
  isExpanded,
  onToggleExpanded,
  sticky = true,
}: ComponentPagePreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const isStacked = useCatalogStackedLayout();
  const { setToolbar } = useCatalogMobileChrome();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const [isDocsHeaderVisible, setIsDocsHeaderVisible] = useState(false);

  useEffect(() => {
    if (!isStacked) {
      return;
    }

    const scroller = document.querySelector<HTMLElement>(
      "[data-catalog-scroll-root]"
    );

    const updateVisibility = () => {
      const target = document.querySelector<HTMLElement>(
        "[data-catalog-docs-header]"
      );
      if (!target) {
        return;
      }
      const rect = target.getBoundingClientRect();
      // Hide dock as soon as the "component" header in docs enters viewport
      const isSeen = rect.top <= window.innerHeight;
      setIsDocsHeaderVisible(isSeen);
      if (isSeen) {
        setIsInteracting(false);
      }
    };

    updateVisibility();

    scroller?.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("scroll", updateVisibility, { passive: true });

    let observer: IntersectionObserver | null = null;
    const target = document.querySelector<HTMLElement>(
      "[data-catalog-docs-header]"
    );
    if (target && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        () => {
          updateVisibility();
        },
        { threshold: 0 }
      );
      observer.observe(target);
    }

    return () => {
      scroller?.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("scroll", updateVisibility);
      observer?.disconnect();
    };
  }, [isStacked]);

  // When interacting with demo on mobile, contain scroll chaining so swipes don't drag the outer page
  useEffect(() => {
    if (!(isInteracting && isStacked)) {
      return;
    }
    const scroller = document.querySelector<HTMLElement>(
      "[data-catalog-scroll-root]"
    );
    if (!scroller) {
      return;
    }
    const prevOverscroll = scroller.style.overscrollBehavior;
    scroller.style.overscrollBehavior = "contain";
    return () => {
      scroller.style.overscrollBehavior = prevOverscroll;
    };
  }, [isInteracting, isStacked]);

  const handleScrollToDocs = useCallback(() => {
    setIsInteracting(false);
    const scroller = document.querySelector<HTMLElement>(
      "[data-catalog-scroll-root]"
    );
    const docsHeader = document.querySelector<HTMLElement>(
      "[data-catalog-docs-header]"
    );
    const docsPanel = document.querySelector<HTMLElement>(
      "[data-catalog-docs-panel]"
    );
    const target = docsHeader || docsPanel;
    if (scroller && target) {
      const targetTop = target.offsetTop;
      scroller.scrollTo({
        top: Math.max(0, targetTop - 56),
        behavior: "smooth",
      });
    } else if (target) {
      target.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div
      className={cn(
        "relative flex w-full flex-col border border-border/50 bg-secondary",
        "rounded-2xl max-lg:rounded-3xl",
        "max-lg:flex-none max-lg:overflow-hidden lg:min-h-0 lg:flex-1 lg:overflow-hidden",
        catalogPreviewMobilePanelClassName,
        sticky && "lg:h-full",
        className
      )}
    >
      <div className={cn(catalogPreviewToolbarRowClassName, "max-lg:hidden")}>
        {previewToolbar}
      </div>

      <div className="relative w-full flex-1 overflow-hidden bg-background max-lg:h-full max-lg:rounded-3xl lg:h-full lg:min-h-[520px] lg:rounded-b-2xl">
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-secondary/80 text-muted-foreground text-sm backdrop-blur-sm max-lg:rounded-3xl lg:rounded-none lg:rounded-b-2xl">
            <Loader className="size-4 animate-spin" />
            Loading preview...
          </div>
        )}
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Native iframe onLoad state tracking. */}
        <iframe
          className={cn(
            "size-full border-0 bg-background max-lg:rounded-3xl lg:rounded-none lg:rounded-b-2xl",
            isStacked && !isExpanded && !isInteracting
              ? "pointer-events-none"
              : "pointer-events-auto"
          )}
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

      {/* Mobile floating actions (Jump to Docs & Toggle Interaction) */}
      {mounted &&
        isStacked &&
        !isExpanded &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center lg:hidden">
            <AnimatePresence>
              {!isDocsHeaderVisible && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="pointer-events-auto flex items-center gap-2"
                  exit={{ opacity: 0, y: 16 }}
                  initial={{ opacity: 0, y: 16 }}
                  key="catalog-mobile-dock"
                  layout
                  transition={mobileDockTransition}
                >
                  <motion.button
                    aria-label={
                      isInteracting
                        ? "Lock interaction to scroll page"
                        : "Touch to interact with demo"
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5",
                      "border font-medium text-xs transition-colors duration-200 active:scale-95",
                      "shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl",
                      isInteracting
                        ? "border-foreground/20 bg-foreground text-background shadow-md hover:bg-foreground/90 dark:border-white/20"
                        : "border-border/60 bg-background/90 text-foreground/90 hover:bg-background hover:text-foreground dark:border-white/10 dark:bg-[#121212]/90"
                    )}
                    layout
                    onClick={() => setIsInteracting((current) => !current)}
                    transition={mobileDockTransition}
                    type="button"
                  >
                    <motion.span
                      className="inline-flex shrink-0 items-center justify-center"
                      layout="position"
                      transition={mobileDockTransition}
                    >
                      <MousePointerClick className="size-3.5" />
                    </motion.span>
                    <motion.span
                      className="inline-flex items-center overflow-hidden"
                      layout="position"
                      transition={mobileDockTransition}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          key={isInteracting ? "scroll" : "interact"}
                          transition={{ duration: 0.14, ease: "easeOut" }}
                        >
                          {isInteracting ? "Scroll" : "Interact"}
                        </motion.span>
                      </AnimatePresence>
                    </motion.span>
                  </motion.button>

                  <motion.button
                    aria-label="Scroll to documentation"
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5",
                      "border border-border/60 bg-background/90 text-foreground/90 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl",
                      "font-medium text-xs transition-colors duration-200 active:scale-95",
                      "hover:bg-background hover:text-foreground dark:border-white/10 dark:bg-[#121212]/90"
                    )}
                    layout
                    onClick={handleScrollToDocs}
                    transition={mobileDockTransition}
                    type="button"
                  >
                    <motion.span
                      className="inline-flex shrink-0 items-center justify-center"
                      layout="position"
                      transition={mobileDockTransition}
                    >
                      Documentation
                    </motion.span>
                    <motion.span
                      className="inline-flex shrink-0 items-center justify-center"
                      layout="position"
                      transition={mobileDockTransition}
                    >
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </motion.span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body
        )}

      <ComponentPageSourcePanel
        onClose={handleCloseSource}
        open={isSourceOpen}
        registryName={registryName}
      />
    </div>
  );
}
