"use client";

import { ProgressiveBlur } from "@workspace/ui/components/ui/progressive-blur";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  ComponentGalleryItem,
  ComponentPageHeaderData,
  ComponentTocItem,
} from "@/lib/registry/types";
import {
  catalogContentGutterClassName,
  catalogDocsHeaderMobileFixedClassName,
  catalogDocsHeaderMobileSpacerClassName,
  catalogPreviewShellClassName,
  catalogPreviewShellFixedWidthClassName,
} from "./catalog-preview-classes";
import { CatalogScrollArea } from "./catalog-scroll-area";
import { ComponentPageDocsHeader } from "./component-page-docs-header";
import { ComponentPageHeader } from "./component-page-header";
import { ComponentPagePreviewPanel } from "./component-page-preview-panel";
import { ComponentPageToc } from "./component-page-toc";
import { useCatalogLayoutReady } from "./use-catalog-layout-ready";

const LG_MEDIA = "(min-width: 1024px)";

const EXPAND_TRANSITION = {
  duration: 0.55,
  ease: [0.32, 0.72, 0, 1] as const,
};

const LAYOUT_FADE_TRANSITION = {
  duration: 0.4,
  ease: [0.32, 0.72, 0, 1] as const,
};

interface ComponentPageLayoutClientProps {
  children: ReactNode;
  githubPath: string;
  header: ComponentPageHeaderData;
  navItems: ComponentGalleryItem[];
  previewName: string;
  registryName: string;
  releaseDate?: string;
  toc: ComponentTocItem[];
}

export function ComponentPageLayoutClient({
  children,
  header,
  githubPath,
  navItems,
  previewName,
  registryName,
  releaseDate,
  toc,
}: ComponentPageLayoutClientProps) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreviewAnimating, setIsPreviewAnimating] = useState(false);
  const { isLargeScreen, isReady: isLayoutReady } =
    useCatalogLayoutReady(layoutRef);

  const useFixedPreviewShellWidth =
    isLargeScreen && (isExpanded || isPreviewAnimating);

  const handleToggleExpanded = useCallback(() => {
    if (window.matchMedia(LG_MEDIA).matches) {
      setIsPreviewAnimating(true);
    }
    setIsExpanded((current) => !current);
  }, []);

  const handlePreviewAnimationComplete = useCallback(() => {
    if (!window.matchMedia(LG_MEDIA).matches) {
      return;
    }
    setIsPreviewAnimating(false);
  }, []);

  useEffect(() => {
    const media = window.matchMedia(LG_MEDIA);

    const handleBreakpointChange = () => {
      if (media.matches) {
        return;
      }

      setIsExpanded(false);
      setIsPreviewAnimating(false);
    };

    media.addEventListener("change", handleBreakpointChange);
    return () => media.removeEventListener("change", handleBreakpointChange);
  }, []);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const hasOpenSheet = document.querySelector(
        '[data-slot="sheet-content"][data-state="open"]'
      );
      if (hasOpenSheet) {
        return;
      }

      if (window.matchMedia(LG_MEDIA).matches) {
        setIsPreviewAnimating(true);
      }
      setIsExpanded(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isExpanded]);

  const useMobileDocumentFlow = !(isLargeScreen || isExpanded);

  const docsContent = (
    <div className="flex w-full justify-center overflow-x-hidden">
      <div
        className={cn(
          "flex w-full min-w-0 max-w-4xl flex-col gap-8 pt-6 pb-24 md:pt-10 lg:gap-10",
          catalogContentGutterClassName
        )}
      >
        <ComponentPageHeader
          data={header}
          githubPath={githubPath}
          releaseDate={releaseDate}
        />

        <div className="grid gap-10">
          <div className="min-w-0">{children}</div>
          <ComponentPageToc items={toc} />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      animate={{ opacity: isLayoutReady ? 1 : 0 }}
      aria-busy={!isLayoutReady}
      className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background max-lg:h-auto max-lg:overflow-visible lg:grid lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)]"
      initial={false}
      ref={layoutRef}
      transition={LAYOUT_FADE_TRANSITION}
    >
      <div
        className={cn(
          "max-lg:order-1 lg:col-start-1 lg:row-start-1",
          !isLayoutReady && "pointer-events-none"
        )}
      >
        <div
          className={cn(
            catalogDocsHeaderMobileFixedClassName,
            isExpanded && "max-lg:hidden"
          )}
        >
          <ComponentPageDocsHeader
            isExpanded={isExpanded}
            navItems={navItems}
            title={header.title}
          />
        </div>
        <div aria-hidden className={catalogDocsHeaderMobileSpacerClassName} />
      </div>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-col max-lg:order-3 max-lg:flex-none lg:col-start-1 lg:row-start-2 lg:min-h-0",
          isExpanded && "pointer-events-none select-none",
          !isLayoutReady && "pointer-events-none"
        )}
      >
        <div className="relative min-h-0 flex-1 max-lg:flex-none">
          {useMobileDocumentFlow ? (
            docsContent
          ) : (
            <CatalogScrollArea className="size-full">
              {docsContent}
            </CatalogScrollArea>
          )}

          <ProgressiveBlur
            backgroundColor="var(--background)"
            blurAmount="12px"
            className="z-[1] max-lg:hidden"
            height="50px"
            maskFadeStart="45%"
            position="top"
          />
          <ProgressiveBlur
            backgroundColor="var(--background)"
            blurAmount="12px"
            className="z-[1] max-lg:hidden"
            height="50px"
            maskFadeStart="45%"
            position="bottom"
          />
        </div>
      </div>

      {/* Keeps the docs column at 50% width while the preview shell is absolute. */}
      <div
        aria-hidden
        className="hidden min-h-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block"
      />

      <motion.div
        animate={
          isLargeScreen
            ? {
                left: isExpanded ? "0%" : "50%",
                width: isExpanded ? "100%" : "50%",
              }
            : undefined
        }
        className={cn(
          "z-20 flex shrink-0 overflow-hidden max-lg:order-2",
          "max-lg:relative max-lg:inset-auto max-lg:h-auto max-lg:w-full max-lg:max-w-full max-lg:shrink-0 max-lg:bg-background max-lg:pb-0",
          "lg:absolute lg:top-0 lg:left-1/2 lg:h-full lg:min-h-[min(420px,55vh)] lg:w-1/2 lg:bg-transparent",
          isExpanded &&
            "max-lg:fixed max-lg:inset-0 max-lg:h-full max-lg:overflow-hidden max-lg:bg-background max-lg:p-6",
          !isLayoutReady && "pointer-events-none"
        )}
        initial={false}
        key={isLargeScreen ? "preview-lg" : "preview-sm"}
        onAnimationComplete={handlePreviewAnimationComplete}
        style={isLargeScreen ? undefined : { left: "auto", width: "auto" }}
        transition={EXPAND_TRANSITION}
      >
        <div
          className={cn(
            "flex min-h-0 w-full flex-col max-lg:h-auto lg:h-full lg:w-full",
            catalogPreviewShellClassName,
            useFixedPreviewShellWidth && catalogPreviewShellFixedWidthClassName
          )}
        >
          <ComponentPagePreviewPanel
            isExpanded={isExpanded}
            onToggleExpanded={handleToggleExpanded}
            previewName={previewName}
            registryName={registryName}
            sticky
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
