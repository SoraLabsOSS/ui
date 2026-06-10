/** Scroll viewport of the catalog preview panel — demos use `100cqh` against this. */
export const catalogPreviewViewportClassName =
  "@container/preview [container-type:size]";

/** One full “screen” inside the preview panel (not browser `100vh`). */
export const catalogPreviewScreenClassName = "min-h-[100cqh]";

/** Shared chrome row layout. */
export const catalogChromeRowClassName = "flex min-h-14 shrink-0 items-center";

/** Horizontal inset from viewport / column edge. */
export const catalogChromePaddingClassName = "px-6";

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
  catalogChromePaddingClassName,
  "max-lg:pt-4",
].join(" ");

export const catalogPreviewShellClassName = [
  "max-lg:w-full pt-0 pb-6",
  catalogChromePaddingClassName,
].join(" ");

/** Fixed width during expand/collapse so demo layout does not reflow mid-animation. */
export const catalogPreviewShellFixedWidthClassName =
  "lg:w-[var(--catalog-layout-width,100%)]";

export const catalogToolbarRowClassName = [
  catalogChromeRowClassName,
  catalogPanelChromeInsetClassName,
  "justify-end",
].join(" ");
