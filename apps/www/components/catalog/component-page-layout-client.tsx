"use client";

import { Footer } from "@workspace/ui/components/docs/footer";
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
import type { NeighborNavItem } from "@/components/docs/neighbor-nav-buttons";
import type {
  ComponentGalleryItem,
  ComponentPageHeaderData,
  ComponentTocItem,
} from "@/lib/registry/types";
import { useCatalogMenu } from "./catalog-menu-context";
import {
  catalogContentGutterClassName,
  catalogDocsHeaderDesktopMenuOpenClassName,
  catalogDocsHeaderMobileFixedClassName,
  catalogDocsHeaderMobileFloatingClassName,
  catalogDocsHeaderMobileMenuOpenClassName,
  catalogPreviewShellClassName,
  catalogPreviewShellFixedWidthClassName,
} from "./catalog-preview-classes";
import { CatalogScrollArea } from "./catalog-scroll-area";
import { ComponentPageDocsHeader } from "./component-page-docs-header";
import { ComponentPageHeader } from "./component-page-header";
import { ComponentPagePreviewPanel } from "./component-page-preview-panel";
import { ComponentPageToc } from "./component-page-toc";
import { useCatalogLayoutReady } from "./use-catalog-layout-ready";
import { useCatalogStackedLayout } from "./use-catalog-stacked-layout";

const LG_MEDIA = "(min-width: 1024px)";

const EXPAND_TRANSITION = {
  duration: 0.55,
  ease: [0.32, 0.72, 0, 1] as const,
};

interface ComponentPageLayoutClientProps {
  children: ReactNode;
  githubPath: string;
  header: ComponentPageHeaderData;
  navItems: ComponentGalleryItem[];
  nextNav?: NeighborNavItem;
  previewName: string;
  previousNav?: NeighborNavItem;
  registryName: string;
  releaseDate?: string;
  toc: ComponentTocItem[];
}

export function ComponentPageLayoutClient({
  children,
  header,
  githubPath,
  navItems,
  nextNav,
  previewName,
  previousNav,
  registryName,
  releaseDate,
  toc,
}: ComponentPageLayoutClientProps) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreviewAnimating, setIsPreviewAnimating] = useState(false);
  const [isBreakpointTransition, setIsBreakpointTransition] = useState(false);
  const { isLargeScreen, isReady: isLayoutReady } =
    useCatalogLayoutReady(layoutRef);
  const isStacked = useCatalogStackedLayout();
  const { open: isCatalogMenuOpen } = useCatalogMenu();

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
    setIsBreakpointTransition(true);
    const id = requestAnimationFrame(() => setIsBreakpointTransition(false));
    return () => cancelAnimationFrame(id);
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

  const docsContent = (
    <div className="flex w-full min-w-0 justify-center">
      <div
        className={cn(
          "flex w-full min-w-0 max-w-4xl flex-col gap-6 py-8 pb-4 md:gap-10 md:py-14",
          catalogContentGutterClassName
        )}
      >
        <ComponentPageHeader
          data={header}
          githubPath={githubPath}
          nextNav={nextNav}
          previousNav={previousNav}
          releaseDate={releaseDate}
        />

        <div className="min-w-0">{children}</div>

        <ComponentPageToc className="lg:hidden" items={toc} />

        <Footer />
      </div>
    </div>
  );

  return (
    <div
      aria-busy={!isLayoutReady}
      className={cn(
        "relative h-full min-h-0 overflow-hidden bg-background",
        "max-lg:flex max-lg:h-auto max-lg:flex-col max-lg:overflow-visible"
      )}
      ref={layoutRef}
    >
      <div
        className={cn(
          "max-lg:order-1",
          "lg:absolute lg:top-0 lg:right-1/2 lg:left-0 lg:z-30",
          !isLayoutReady && "pointer-events-none"
        )}
      >
        <div
          className={cn(
            catalogDocsHeaderMobileFixedClassName,
            catalogDocsHeaderMobileFloatingClassName,
            isCatalogMenuOpen && catalogDocsHeaderMobileMenuOpenClassName,
            isCatalogMenuOpen && catalogDocsHeaderDesktopMenuOpenClassName,
            isExpanded && "max-lg:hidden"
          )}
        >
          <ComponentPageDocsHeader
            isExpanded={isExpanded}
            navItems={navItems}
            title={header.title}
          />
        </div>
      </div>

      <div
        className={cn(
          "max-lg:order-3 max-lg:flex-none",
          "relative min-h-0 min-w-0",
          "lg:absolute lg:inset-0 lg:z-0 lg:h-full lg:overflow-hidden lg:pr-[50%]",
          isExpanded &&
            "pointer-events-none select-none lg:opacity-0 lg:transition-opacity lg:duration-550 lg:ease-[cubic-bezier(0.32,0.72,0,1)]",
          !isLayoutReady && "pointer-events-none"
        )}
      >
        <ProgressiveBlur
          backgroundColor="var(--background)"
          blurAmount="12px"
          className="z-10 max-lg:hidden"
          height="100px"
          maskFadeStart="45%"
          position="top"
        />
        <ProgressiveBlur
          backgroundColor="var(--background)"
          blurAmount="12px"
          className="z-10 max-lg:hidden"
          height="70px"
          maskFadeStart="45%"
          position="bottom"
        />

        {isStacked ? (
          <div className="min-h-0 min-w-0">{docsContent}</div>
        ) : (
          <CatalogScrollArea
            className="min-h-0 min-w-0 lg:h-full"
            hideScrollbar
            viewportClassName="lg:pt-12"
          >
            {docsContent}
          </CatalogScrollArea>
        )}
      </div>

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
          "z-20 flex shrink-0 overflow-hidden max-lg:z-0 max-lg:order-2",
          "max-lg:relative max-lg:inset-auto max-lg:h-auto max-lg:w-full max-lg:max-w-full max-lg:shrink-0 max-lg:overflow-visible max-lg:bg-background max-lg:pb-0",
          "lg:absolute lg:top-0 lg:left-1/2 lg:h-full lg:min-h-[min(420px,55vh)] lg:w-1/2 lg:bg-transparent",
          isExpanded &&
            "max-lg:fixed max-lg:inset-0 max-lg:h-full max-lg:overflow-hidden max-lg:bg-background max-lg:p-6",
          !isLayoutReady && "pointer-events-none"
        )}
        initial={false}
        onAnimationComplete={handlePreviewAnimationComplete}
        style={isLargeScreen ? undefined : { left: "auto", width: "auto" }}
        transition={
          isBreakpointTransition ? { duration: 0 } : EXPAND_TRANSITION
        }
      >
        <div
          className={cn(
            "flex w-full flex-col max-lg:h-auto max-lg:min-h-min lg:h-full lg:min-h-0 lg:w-full",
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
    </div>
  );
}
