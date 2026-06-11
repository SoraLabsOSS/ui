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
export const catalogContentGutterClassName = "px-4 sm:px-8 md:px-16";

/** Centered content width on stacked layout — matches the docs column. */
export const catalogStackedContentClassName =
  "max-lg:mx-auto max-lg:w-full max-lg:min-w-0 max-lg:max-w-4xl";

/** Top inset for docs header + preview toolbar (symmetric). */
export const catalogChromeTopInsetClassName = "pt-6";

/** Inset from the preview panel border (chrome inside panel). */
export const catalogPanelChromeInsetClassName = "px-4 pt-4";

/** Docs header on desktop — transparent overlay, no extra inset. */
export const catalogDocsHeaderInsetClassName = "";

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

/** Fixed chrome on stacked layout — min-h-14 + pt-4 + pb-3. */
export const catalogDocsHeaderMobileHeight = "5.25rem";

/** Reserves space so content does not sit under the fixed mobile header. */
export const catalogDocsHeaderMobileSpacerClassName =
  "max-lg:min-h-[5.25rem] max-lg:shrink-0 lg:hidden";

/** Fixed chrome on stacked layout — stays visible while page scrolls. */
export const catalogDocsHeaderMobileFixedClassName = [
  "max-lg:fixed max-lg:inset-x-0 max-lg:top-(--fd-banner-height) max-lg:z-[60]",
  "max-lg:border-border/40 max-lg:border-b",
  "max-lg:bg-background/95 max-lg:backdrop-blur-md",
  "max-lg:supports-[backdrop-filter]:bg-background/80",
  "max-lg:transition-[background-color,border-color,backdrop-filter] max-lg:duration-450 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)]",
  "lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:backdrop-blur-none",
].join(" ");

/** When the catalog flyout is open — snap chrome away; menu button stays clickable above overlay. */
export const catalogDocsHeaderMobileMenuOpenClassName = [
  "max-lg:z-[90] max-lg:pointer-events-none max-lg:!transition-none",
  "max-lg:border-transparent max-lg:bg-transparent max-lg:backdrop-blur-none",
  "max-lg:supports-[backdrop-filter]:bg-transparent",
].join(" ");

/** Menu toggle stays above the flyout overlay on stacked layout. */
export const catalogMenuButtonMobileOpenClassName =
  "max-lg:pointer-events-auto max-lg:relative max-lg:z-10";

/** Preview shell gutter — reference uses `p-4` on desktop, content gutters on mobile only. */
export const catalogPreviewShellGutterClassName =
  "px-4 pb-6 sm:px-8 md:px-16 lg:p-4";

export const catalogPreviewShellClassName = [
  "w-full pt-0",
  catalogStackedContentClassName,
  catalogPreviewShellGutterClassName,
].join(" ");

/** Fixed width during expand/collapse so demo layout does not reflow mid-animation. */
export const catalogPreviewShellFixedWidthClassName =
  "lg:w-[var(--catalog-layout-width,100%)]";

/** Above scrollable demo content; stays below docs header (header is left-column only on lg). */
export const catalogPreviewToolbarRowClassName = [
  catalogChromeRowClassName,
  catalogPanelChromeInsetClassName,
  "relative z-10 shrink-0 justify-end",
].join(" ");

/** Dimmed overlay behind the flyout catalog menu (must stay below the aside panel). */
export const catalogSidebarBackdropClassName = [
  "fixed inset-0 bg-background/50 backdrop-blur-[2px]",
  "max-lg:pointer-events-auto max-lg:z-[80]",
  "lg:z-10 lg:bg-background/40",
].join(" ");

/** Flyout catalog sidebar (Skiper-style rail), toggled from the menu button. */
export const catalogDesktopSidebarAsideClassName = [
  "fixed top-(--fd-banner-height) h-[calc(100dvh-var(--fd-banner-height))]",
  "pointer-events-auto left-0",
  "w-[min(20rem,calc(100vw-0.5rem))] p-3",
  "max-lg:z-[81] lg:z-20 lg:left-2 lg:w-[320px] lg:p-4 lg:pr-2 lg:pl-2",
].join(" ");

export const catalogDesktopSidebarPanelClassName =
  "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-muted";

/** Top inset inside the flyout list — clears fixed header / menu row. */
export const catalogDesktopSidebarScrollInsetClassName =
  "pt-20 pb-8 max-lg:pb-6";
