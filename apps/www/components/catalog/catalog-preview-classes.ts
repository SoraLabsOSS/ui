/** Scroll viewport — size container so demos can use `100cqh` inside a fixed-height panel. */
export const catalogPreviewViewportClassName =
  "@container/preview [container-type:size]";

/** One full “screen” inside the preview panel (not browser `100vh`). */
export const catalogPreviewScreenClassName =
  "min-h-[100cqh] max-lg:min-h-[70dvh]";

/**
 * Fixed-height demo shell inside the catalog preview scroll viewport (desktop).
 * On stacked mobile layout, height grows with demo content — page scrolls on
 * `[data-catalog-scroll-root]`.
 */
export const catalogPreviewDemoShellClassName = [
  catalogPreviewScreenClassName,
  "w-full lg:h-[100cqh]",
  "max-lg:h-auto max-lg:min-h-[70dvh]",
].join(" ");

/** Preview panel on stacked layout — grows with demo content; page scrolls instead. */
export const catalogPreviewMobilePanelClassName = "max-lg:h-auto";

/** Shared chrome row layout. */
export const catalogChromeRowClassName = "flex min-h-14 shrink-0 items-center";

/** Horizontal inset from viewport / column edge (desktop chrome rows). */
export const catalogChromePaddingClassName = "px-6";

/** Shared horizontal inset — preview, docs, and header on stacked layout. */
export const catalogStackedHorizontalGutterClassName = "px-4 sm:px-8 md:px-16";

/** @deprecated Use catalogStackedHorizontalGutterClassName */
export const catalogContentGutterClassName =
  catalogStackedHorizontalGutterClassName;

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
  "flex w-fit items-center gap-0.5 rounded-2xl bg-background max-lg:bg-secondary p-1";

/** Icon button inside catalog chrome toolbars. */
export const catalogChromeToolbarButtonClassName =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-transparent text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-lg:text-foreground [&_svg]:size-4";

/** Docs header — fixed height/padding across expand/collapse on desktop. */
export const catalogDocsHeaderClassName = [
  "relative z-30 flex min-h-14 shrink-0 items-center",
  catalogChromeTopInsetClassName,
  catalogStackedContentClassName,
  catalogStackedHorizontalGutterClassName,
  "max-lg:pt-4",
  "lg:mx-0 lg:max-w-none lg:px-6",
].join(" ");

/** Fixed mobile chrome row — `pt-4` + `min-h-14`. */
export const catalogDocsHeaderMobileHeight = "4.5rem";

/** Scroll offset so in-flow sections clear the fixed mobile header when scrolled into view. */
export const catalogDocsHeaderMobileScrollPaddingClassName =
  "max-lg:scroll-pt-[4.5rem]";

/**
 * Inset inside the preview panel so demo content clears the fixed header chips.
 * The panel background extends under the transparent header instead of a blank spacer.
 */
export const catalogPreviewMobileChromeInsetClassName = "max-lg:pt-[4.5rem]";

/**
 * Stacked layout viewport — no size containment so demo content sets panel height
 * (`container-type: size` ignores descendant block size).
 */
export const catalogPreviewMobileViewportClassName = [
  "w-full min-w-0",
  catalogPreviewMobileChromeInsetClassName,
].join(" ");

/** Fixed chrome on stacked layout — stays visible while page scrolls. */
export const catalogDocsHeaderMobileFixedClassName = [
  "max-lg:fixed max-lg:inset-x-0 max-lg:top-(--fd-banner-height) max-lg:z-[60]",
  "max-lg:border-border/40 max-lg:border-b",
  "max-lg:bg-background/95 max-lg:backdrop-blur-md",
  "max-lg:supports-[backdrop-filter]:bg-background/80",
  "max-lg:transition-[background-color,border-color,backdrop-filter] max-lg:duration-450 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)]",
  "lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:backdrop-blur-none",
].join(" ");

/** Stacked layout — floating menu chip instead of a full-width chrome bar. */
export const catalogDocsHeaderMobileFloatingClassName = [
  "max-lg:border-0 max-lg:bg-transparent max-lg:backdrop-blur-none",
  "max-lg:supports-[backdrop-filter]:bg-transparent",
].join(" ");

/** When the catalog flyout is open — chrome bar stays under the aside overlay. */
export const catalogDocsHeaderMobileMenuOpenClassName = [
  "max-lg:pointer-events-none max-lg:!transition-none",
  "max-lg:border-transparent max-lg:bg-transparent max-lg:backdrop-blur-none",
  "max-lg:supports-[backdrop-filter]:bg-transparent",
].join(" ");

/** Desktop flyout open — keep docs header chrome above the aside panel. */
export const catalogDocsHeaderDesktopMenuOpenClassName =
  "lg:relative lg:z-[25]";

/** Floating chrome chips stay clickable while the flyout overlay is open. */
export const catalogMobileChromeInteractiveClassName =
  "max-lg:pointer-events-auto";

/**
 * Fixed mobile menu chip layer (`document.body`).
 * Above the flyout aside (`z-[81]`); toolbar stays in the header (`z-[60]`).
 */
export const catalogMobileMenuChipFixedClassName = [
  "pointer-events-auto fixed z-[90]",
  "top-[calc(var(--fd-banner-height)+1rem)]",
  "left-4 sm:left-8 md:left-16",
].join(" ");

/** @deprecated Use catalogMobileMenuChipFixedClassName */
export const catalogMobileMenuChipOpenClassName =
  catalogMobileMenuChipFixedClassName;

/** @deprecated Use catalogMobileChromeInteractiveClassName */
export const catalogMenuButtonMobileOpenClassName =
  catalogMobileChromeInteractiveClassName;

/** Stacked layout — menu left, preview toolbar right. */
export const catalogDocsHeaderMobileSymmetricClassName =
  "max-lg:w-full max-lg:justify-between";

/** Menu toggle slot — independent from breadcrumb for stacked layout tuning. */
export const catalogDocsHeaderMenuClassName = "shrink-0";

/** Breadcrumb slot — desktop docs header only. */
export const catalogDocsHeaderBreadcrumbClassName = "min-w-0 flex-1 truncate";

/** Preview shell gutter — 8px top/x on mobile; `p-4` on desktop. */
export const catalogPreviewShellGutterClassName = [
  "max-lg:px-2 max-lg:pt-2 max-lg:pb-6",
  "lg:p-4",
].join(" ");

export const catalogPreviewShellClassName = [
  "w-full",
  catalogStackedContentClassName,
  catalogPreviewShellGutterClassName,
].join(" ");

/** Fixed width during expand/collapse so demo layout does not reflow mid-animation. */
export const catalogPreviewShellFixedWidthClassName =
  "lg:w-[var(--catalog-layout-width,100%)]";

/**
 * Desktop preview toolbar — overlays the scroll viewport (not in flex flow).
 * `top-2 right-2` inside the panel offsets the shell `lg:p-4` to match docs header `pt-6 px-6`.
 * Mobile toolbar lives in the docs header via portal context.
 */
export const catalogPreviewToolbarRowClassName = [
  catalogChromeRowClassName,
  catalogPanelChromeInsetClassName,
  "pointer-events-none z-10 justify-end",
  "lg:absolute lg:top-0 lg:right-2 lg:left-auto lg:w-auto lg:px-0 lg:pt-0",
].join(" ");

/**
 * Dimmed overlay behind the flyout catalog menu.
 * Desktop `z-[21]` sits above the preview column (`z-20`) but below the aside + docs header.
 */
export const catalogSidebarBackdropClassName = [
  "fixed inset-0 bg-background/50 backdrop-blur-[2px]",
  "pointer-events-auto",
  "max-lg:z-[80]",
  "lg:z-[21] lg:bg-background/40",
].join(" ");

/** Flyout catalog sidebar (Skiper-style rail), toggled from the menu button. */
export const catalogDesktopSidebarAsideClassName = [
  "fixed top-(--fd-banner-height) h-[calc(100dvh-var(--fd-banner-height))]",
  "pointer-events-auto left-0",
  "w-[min(20rem,calc(100vw-0.5rem))] p-3",
  "max-lg:z-[81] lg:z-[22] lg:left-2 lg:w-[320px] lg:p-4 lg:pr-2 lg:pl-2",
].join(" ");

export const catalogDesktopSidebarPanelClassName =
  "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-muted";

/** Top inset inside the flyout list — clears fixed header / menu row. */
export const catalogDesktopSidebarScrollInsetClassName =
  "pt-20 pb-8 max-lg:pb-6";
