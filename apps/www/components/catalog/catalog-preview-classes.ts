/** Scroll viewport of the catalog preview panel — demos use `100cqh` against this. */
export const catalogPreviewViewportClassName =
  "@container/preview [container-type:size]";

/** One full “screen” inside the preview panel (not browser `100vh`). */
export const catalogPreviewScreenClassName = "min-h-[100cqh]";

/** Preview panel height on stacked (mobile) layout — full viewport, scroll inside. */
export const catalogPreviewMobilePanelClassName =
  "max-lg:h-[100dvh] max-lg:min-h-[100dvh]";

/** Shared chrome row layout. */
export const catalogChromeRowClassName = "flex min-h-14 shrink-0 items-center";

/** Horizontal inset from viewport / column edge. */
export const catalogChromePaddingClassName = "px-6";

/** Shared horizontal inset — preview, docs, and header align on stacked layout. */
export const catalogContentGutterClassName = "px-4 sm:px-8 md:px-12 lg:px-6";

/** Centered content width on stacked layout — matches the docs column. */
export const catalogStackedContentClassName =
  "max-lg:mx-auto max-lg:w-full max-lg:min-w-0 max-lg:max-w-4xl";

/** Top inset for docs header + preview toolbar (symmetric). */
export const catalogChromeTopInsetClassName = "pt-4";

/** Inset from the preview panel border (chrome inside panel). */
export const catalogPanelChromeInsetClassName = "px-4 pt-4";

/** Docs header left offset on desktop: shell padding + panel inset (matches toolbar). */
export const catalogDocsHeaderInsetClassName = "lg:pl-10";

/** Floating chrome toolbar surface (docs header + preview toolbar). */
export const catalogChromeToolbarClassName =
  "flex w-fit items-center gap-0.5 rounded-2xl bg-background p-1";

/** Icon button inside catalog chrome toolbars. */
export const catalogChromeToolbarButtonClassName =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-transparent text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

/** Vertical rule between toolbar control groups. */
export const catalogChromeToolbarDividerClassName =
  "mx-0.5 h-5 w-px shrink-0 bg-border/60";

/** Docs header — fixed height/padding across expand/collapse on desktop. */
export const catalogDocsHeaderClassName = [
  "relative z-30 flex min-h-14 shrink-0 items-center max-lg:pb-3",
  catalogChromeTopInsetClassName,
  catalogContentGutterClassName,
  "max-lg:pt-4",
].join(" ");

/** Fixed chrome on stacked layout — min-h-14 + pt-4 + pb-3. */
export const catalogDocsHeaderMobileHeight = "5.25rem";

/** Reserves space so content does not sit under the fixed mobile header. */
export const catalogDocsHeaderMobileSpacerClassName =
  "max-lg:min-h-[5.25rem] max-lg:shrink-0 lg:hidden";

/** Fixed chrome on stacked layout — stays visible while page scrolls. */
export const catalogDocsHeaderMobileFixedClassName = [
  "max-lg:fixed max-lg:inset-x-0 max-lg:top-(--fd-banner-height) max-lg:z-40",
  "max-lg:border-border/40 max-lg:border-b",
  "max-lg:bg-background/95 max-lg:backdrop-blur-md",
  "max-lg:supports-[backdrop-filter]:bg-background/80",
  "lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none",
].join(" ");

export const catalogPreviewShellClassName = [
  "w-full pt-0",
  "max-lg:pb-6",
  catalogStackedContentClassName,
  catalogContentGutterClassName,
].join(" ");

/** Fixed width during expand/collapse so demo layout does not reflow mid-animation. */
export const catalogPreviewShellFixedWidthClassName =
  "lg:w-[var(--catalog-layout-width,100%)]";

export const catalogToolbarRowClassName = [
  catalogChromeRowClassName,
  catalogPanelChromeInsetClassName,
  "justify-end",
].join(" ");
