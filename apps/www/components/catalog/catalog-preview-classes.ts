import { cn } from "@workspace/ui/lib/utils";

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

/** Shared chrome row layout (mobile / stacked). */
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

/** Shared chrome height — `p-1.5` + `size-8` cell = 2.75rem (44px). */
export const catalogChromeToolbarHeightClassName = "h-11";

/** Shared dock surface (border, fill, shadow). */
export const catalogChromeToolbarSurfaceClassName = [
  "rounded-2xl border border-border/40",
  "bg-background/75 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl",
  "dark:border-white/[0.06] dark:bg-[#121212]/80",
].join(" ");

/** Floating chrome toolbar surface (docs header + preview toolbar). */
export const catalogChromeToolbarClassName = [
  "flex w-fit select-none items-center gap-1 p-1.5",
  catalogChromeToolbarHeightClassName,
  catalogChromeToolbarSurfaceClassName,
].join(" ");

/** Standalone menu toggle chip (sidebar) — bordered pill, not inverted on open. */
export const catalogMenuToggleChipClassName = [
  "flex size-8 shrink-0 items-center justify-center rounded-2xl border border-border/40",
  "bg-zinc-200/65 text-foreground/65 shadow-sm backdrop-blur-xl",
  "dark:border-white/[0.06] dark:bg-zinc-800/75",
].join(" ");

/**
 * Single-action chrome — square dock matching preview toolbar baseline height.
 * Icon size matches toolbar cells; padding is distributed by flex centering.
 */
export const catalogChromeToolbarSoloClassName = [
  "flex aspect-square w-11 shrink-0 items-center justify-center",
  catalogChromeToolbarHeightClassName,
  catalogChromeToolbarSurfaceClassName,
  "text-foreground/65 transition-all ease-in-out active:scale-95",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
].join(" ");

/** Open solo dock — subtle emphasis, matches chip open tone. */
export const catalogChromeToolbarSoloOpenClassName =
  "border-foreground/15 bg-zinc-300/35 dark:border-white/12 dark:bg-zinc-700/50";

/** Open menu — subtle emphasis without full foreground invert. */
export const catalogMenuToggleChipOpenClassName =
  "border-foreground/15 bg-zinc-300/90 text-foreground dark:border-white/12 dark:bg-zinc-700/90 dark:text-foreground";

/** Icon cell inside catalog chrome toolbars. */
export const catalogChromeToolbarCellClassName =
  "flex size-8 shrink-0 items-center justify-center rounded-2xl bg-zinc-200/65 text-foreground/65 dark:bg-zinc-800/75";

/** Active icon cell — inverted surface like componentry preview controls. */
export const catalogChromeToolbarCellActiveClassName =
  "bg-foreground text-background dark:bg-zinc-100 dark:text-zinc-900";

/** Icon button inside a toolbar cell. */
export const catalogChromeToolbarIconClassName =
  "flex size-full items-center justify-center rounded-2xl text-current transition-all ease-in-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4";

/** Desktop menu toggle — icon only, no chip/dock surface. */
export const catalogMenuTogglePlainClassName = [
  "flex h-8 w-8 shrink-0 items-center justify-center rounded",
  "text-zinc-500 transition-colors duration-200 hover:text-zinc-900",
  "dark:text-zinc-400 dark:hover:text-zinc-100",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
].join(" ");

export const catalogMenuTogglePlainOpenClassName =
  "text-zinc-900 dark:text-zinc-100";

/** @deprecated Use catalogChromeToolbarCellClassName + catalogChromeToolbarIconClassName */
export const catalogChromeToolbarButtonClassName = cn(
  catalogChromeToolbarCellClassName,
  catalogChromeToolbarIconClassName
);

/** Docs header — fixed height/padding across expand/collapse on desktop. */
export const catalogDocsHeaderClassName = [
  "relative z-30 flex shrink-0 items-center",
  "min-h-14 pt-6",
  catalogStackedContentClassName,
  catalogStackedHorizontalGutterClassName,
  "max-lg:pt-4",
  "lg:mx-0 lg:max-w-none lg:min-h-0 lg:px-6 lg:pt-4",
].join(" ");

/** Desktop docs chrome row — same `min-h-14` band as preview toolbar row. */
export const catalogDocsHeaderDesktopRowClassName =
  "lg:min-h-14 lg:items-center";

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

/** Fixed chrome on stacked layout — stays visible while page scrolls.
 * Keep below AI chat (`z-[100]` in `components/ai/search.tsx`). */
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

/** Desktop flyout open — parent column is `lg:z-[120]`; keep header in flow. */
export const catalogDocsHeaderDesktopMenuOpenClassName = "lg:relative";

/** Floating chrome chips stay clickable while the flyout overlay is open. */
export const catalogMobileChromeInteractiveClassName =
  "max-lg:pointer-events-auto";

/** Fixed mobile menu chip layer (`document.body`). Position only — z-index is
 * applied separately so the idle/open layers never fight in the stylesheet. */
export const catalogMobileMenuChipFixedClassName = [
  "pointer-events-auto fixed",
  "top-[calc(var(--fd-banner-height)+1rem)]",
  "left-4 sm:left-8 md:left-16",
].join(" ");

/** Idle chip — above header toolbar (`z-[60]`), below AI chat (`z-[100]`). */
export const catalogMobileMenuChipIdleLayerClassName = "z-[90]";

/** Open chip — above the flyout aside (`z-[111]`) so the toggle stays clickable. */
export const catalogMobileMenuChipMenuOpenLayerClassName = "z-[120]";

/**
 * Cursor-following nav preview — above the flyout aside (`z-[111]`),
 * below the open menu chip (`z-[120]`).
 */
export const catalogNavHoverPreviewLayerClassName = [
  "pointer-events-none fixed top-0 left-0 z-[115] w-56",
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
export const catalogDocsHeaderBreadcrumbClassName =
  "flex h-full min-w-0 flex-1 items-center truncate";

/** Preview shell gutter — 8px top/x on mobile; asymmetric inset on desktop for tighter center gap. */
export const catalogPreviewShellGutterClassName = [
  "max-lg:px-2 max-lg:pt-2 max-lg:pb-6",
  "lg:pt-4 lg:pb-4 lg:pr-4 lg:pl-1.5",
].join(" ");

/** Source panel gutter — mirrors preview shell so the center gap stays tight. */
export const catalogSourcePanelGutterClassName = [
  "max-lg:px-2 max-lg:pt-2 max-lg:pb-6",
  "lg:pt-4 lg:pb-4 lg:pl-4 lg:pr-1.5",
].join(" ");

/**
 * Mobile source sheet — above AI chat (`z-[100]`), below catalog flyout
 * (`z-[110]`). Height is capped under the header so `</>` stays visible.
 */
export const catalogSourcePanelMobileLayerClassName = "max-lg:z-[105]";

/** Desktop split view — overlays the preview column. */
export const catalogSourcePanelDesktopLayerClassName = "lg:z-70";

/**
 * Mobile sheet height — cap below the fixed header so short viewports do not
 * bury the preview toolbar (`catalogDocsHeaderMobileHeight`).
 */
export const catalogSourcePanelMobileHeightClassName =
  "max-lg:h-[min(80dvh,calc(100dvh-var(--fd-banner-height)-4.5rem))]";

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
 * Mobile toolbar lives in the docs header via portal context.
 */
export const catalogPreviewToolbarRowClassName = [
  catalogChromeRowClassName,
  catalogPanelChromeInsetClassName,
  "pointer-events-none z-20 justify-end",
  "lg:absolute lg:top-0 lg:right-2 lg:left-auto lg:w-auto lg:px-0 lg:pt-0",
].join(" ");

/**
 * Dimmed overlay behind the flyout catalog menu.
 * Above AI chat (`z-[100]`) at every breakpoint so Ask AI cannot sit on
 * the backdrop. Aside is `z-[111]`; open chrome is `z-[120]`.
 */
export const catalogSidebarBackdropClassName = [
  "fixed inset-0 z-[110] bg-background/50 backdrop-blur-[2px]",
  "pointer-events-auto",
  "lg:bg-background/40",
].join(" ");

/** Flyout catalog sidebar (Skiper-style rail), toggled from the menu button. */
export const catalogDesktopSidebarAsideClassName = [
  "fixed top-(--fd-banner-height) h-[calc(100dvh-var(--fd-banner-height))]",
  "pointer-events-auto left-0 z-[111]",
  "w-[min(20rem,calc(100vw-0.5rem))] p-3",
  "lg:left-2 lg:w-[320px] lg:p-4 lg:pr-2 lg:pl-2",
].join(" ");

export const catalogDesktopSidebarPanelClassName = [
  "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl",
  "bg-white/35 backdrop-blur-xl backdrop-saturate-150 dark:bg-[#080808]/30",
  "supports-[backdrop-filter]:bg-white/35 dark:supports-[backdrop-filter]:bg-[#080808]/30",
].join(" ");

/** Top inset inside the flyout list — clears fixed header / menu row. */
export const catalogDesktopSidebarScrollInsetClassName =
  "pt-20 pb-8 max-lg:pb-6";
