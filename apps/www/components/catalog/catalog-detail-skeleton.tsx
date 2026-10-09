"use client";

import { ProgressiveBlur } from "@workspace/ui/components/ui/progressive-blur";
import { cn } from "@workspace/ui/lib/utils";
import { ComponentPageDocsBreadcrumb } from "./catalog-docs-breadcrumb";
import { ComponentPageCatalogMenuButton } from "./catalog-menu-button";
import {
  catalogDocsHeaderBreadcrumbClassName,
  catalogDocsHeaderClassName,
  catalogDocsHeaderDesktopRowClassName,
  catalogDocsHeaderInsetClassName,
  catalogDocsHeaderMobileFixedClassName,
  catalogDocsHeaderMobileFloatingClassName,
  catalogDocsHeaderMobileSymmetricClassName,
  catalogPreviewMobilePanelClassName,
  catalogPreviewShellClassName,
  catalogPreviewToolbarRowClassName,
  catalogStackedHorizontalGutterClassName,
} from "./catalog-preview-classes";
import { CatalogPreviewLoadingOverlay } from "./catalog-preview-loading";
import { ComponentPagePreviewToolbar } from "./catalog-preview-toolbar";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-accent motion-safe:animate-pulse",
        className
      )}
    />
  );
}

export function CatalogDetailSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-hidden="true"
      className={cn(
        "relative h-full min-h-0 overflow-hidden bg-background",
        "max-lg:flex max-lg:h-auto max-lg:flex-col max-lg:overflow-visible",
        className
      )}
    >
      {/* Header bar overlay (Order 1 on mobile, absolute top-left on desktop) */}
      <div
        className={cn(
          "pointer-events-none max-lg:order-1",
          "lg:absolute lg:top-0 lg:right-1/2 lg:left-0 lg:z-30"
        )}
      >
        <div
          className={cn(
            catalogDocsHeaderMobileFixedClassName,
            catalogDocsHeaderMobileFloatingClassName
          )}
        >
          <header
            className={cn(
              catalogDocsHeaderClassName,
              catalogDocsHeaderInsetClassName,
              catalogDocsHeaderMobileSymmetricClassName,
              "pointer-events-none gap-3 lg:bg-transparent"
            )}
          >
            <div
              className={cn(
                "pointer-events-none flex min-w-0 flex-1 items-center gap-3 lg:gap-2.5",
                catalogDocsHeaderDesktopRowClassName
              )}
            >
              {/* Spacer matching mobile menu button */}
              <div aria-hidden className="size-11 shrink-0 lg:hidden" />

              {/* Desktop menu toggle button */}
              <div className="pointer-events-auto hidden items-center lg:flex">
                <ComponentPageCatalogMenuButton variant="morph" />
              </div>

              {/* Desktop breadcrumb */}
              <ComponentPageDocsBreadcrumb
                className={cn(
                  catalogDocsHeaderBreadcrumbClassName,
                  "pointer-events-auto max-lg:hidden"
                )}
              />
            </div>

            {/* Mobile toolbar */}
            <div className="flex items-center gap-1 lg:hidden">
              <ComponentPagePreviewToolbar
                className="pointer-events-auto"
                isLoadingPreview
              />
            </div>
          </header>
        </div>
      </div>

      {/* Right panel: Preview Panel (Order 2 on mobile, right 50% on desktop) */}
      <div
        className={cn(
          "z-20 flex shrink-0 overflow-hidden max-lg:z-0 max-lg:order-2",
          "max-lg:!left-0 max-lg:!w-full max-lg:relative max-lg:inset-auto max-lg:h-auto max-lg:max-w-full max-lg:shrink-0 max-lg:overflow-visible max-lg:bg-background max-lg:pb-0",
          "lg:absolute lg:top-0 lg:left-1/2 lg:h-full lg:min-h-[min(420px,55vh)] lg:w-1/2 lg:bg-transparent"
        )}
      >
        <div
          className={cn(
            "flex w-full flex-col max-lg:h-auto max-lg:min-h-min lg:h-full lg:min-h-0 lg:w-full",
            catalogPreviewShellClassName
          )}
        >
          <div
            className={cn(
              "relative flex w-full flex-col border border-border/50 bg-secondary",
              "rounded-2xl max-lg:rounded-3xl",
              "max-lg:flex-none max-lg:overflow-hidden lg:min-h-0 lg:flex-1 lg:overflow-hidden",
              catalogPreviewMobilePanelClassName,
              "max-lg:min-h-[500px] lg:h-full"
            )}
          >
            {/* Desktop preview toolbar */}
            <div
              className={cn(catalogPreviewToolbarRowClassName, "max-lg:hidden")}
            >
              <ComponentPagePreviewToolbar
                className="pointer-events-auto"
                hasSourceCode
                isLoadingPreview
              />
            </div>

            {/* Preview viewport content */}
            <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-background max-lg:h-full max-lg:rounded-3xl lg:h-full lg:min-h-[520px] lg:rounded-b-2xl">
              <CatalogPreviewLoadingOverlay />
            </div>
          </div>
        </div>
      </div>

      {/* Left panel: Docs Panel (Order 3 on mobile, left 50% on desktop) */}
      <div
        className={cn(
          "max-lg:order-3 max-lg:flex-none",
          "relative min-h-0 min-w-0",
          "lg:absolute lg:inset-0 lg:z-0 lg:h-full lg:overflow-hidden lg:pr-[50%]"
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

        <div className="min-h-0 min-w-0 max-lg:block lg:h-full lg:overflow-hidden">
          <div className="[scrollbar-width:none] lg:h-full lg:overflow-y-auto lg:pt-12 [&::-webkit-scrollbar]:hidden">
            <div className="flex w-full min-w-0 justify-center">
              <div
                className={cn(
                  "flex w-full min-w-0 max-w-4xl flex-col gap-6 pt-8 pb-3 md:gap-10 md:pt-14 md:pb-6",
                  catalogStackedHorizontalGutterClassName
                )}
              >
                {/* Header Skeleton */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-16" />
                    <div className="flex w-full flex-row items-start justify-between gap-4">
                      <Skeleton className="h-9 w-3/5 sm:h-10 md:h-11" />
                      <div className="flex shrink-0 gap-1.5">
                        <Skeleton className="size-8 rounded-lg" />
                        <Skeleton className="size-8 rounded-lg" />
                      </div>
                    </div>
                    <Skeleton className="mt-2 h-5 w-4/5" />
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="mt-1 h-4 w-32" />
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-28 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                  </div>
                </div>

                {/* Docs Body Skeleton */}
                <div className="flex flex-col gap-8 pt-4 pb-10">
                  {/* Installation section */}
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-7 w-32 md:h-8" />
                    <Skeleton className="h-9 w-48 rounded-lg" />
                    <Skeleton className="h-28 w-full rounded-xl" />
                  </div>

                  {/* Usage section */}
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-7 w-24 md:h-8" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="mt-2 h-64 w-full rounded-xl" />
                  </div>

                  {/* Props section */}
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-7 w-20 md:h-8" />
                    <div className="flex flex-col divide-y divide-border/40 rounded-xl border border-border/40">
                      <div className="flex items-center justify-between p-3">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Skeleton */}
                <div className="-mt-2 mb-7 flex w-full flex-col-reverse justify-between gap-4 lg:flex-row lg:items-center">
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
