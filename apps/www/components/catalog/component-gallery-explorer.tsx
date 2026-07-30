"use client";

import {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/animate-ui/primitives/animate/tabs";
import { Grid2x2, Grid3x2, List, Search } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { isRecentlyReleased } from "@/lib/docs/is-recently-released";
import {
  COMPONENT_GALLERY_SECTIONS,
  groupGalleryItemsByCategory,
  isGalleryCatalogItem,
  resolveGalleryCategory,
} from "@/lib/registry/component-gallery-sections";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import { CatalogNavHoverPreview } from "./catalog-nav-hover-preview";
import { GalleryCardPreview } from "./gallery-card-preview";
import { GallerySegmentedTabs } from "./gallery-segmented-tabs";
import { useCatalogHoverPreview } from "./use-catalog-hover-preview";

type SortMode = "default" | "newest";
type ViewMode = "cards" | "compact" | "list";

const VIEW_SLIDE_OFFSET = 20;
const VIEW_BLUR = "8px";
const VIEW_SLIDE_TRANSITION = {
  duration: 0.32,
  ease: [0.19, 1, 0.22, 1] as const,
};

const FILTER_ITEM_STAGGER = 0.05;
const FILTER_ITEM_STAGGER_CAP = 0.35;
const FILTER_ITEM_TRANSITION = {
  duration: 0.5,
  ease: [0.19, 1, 0.22, 1] as const,
};

const FILTER_TRANSITION = {
  duration: 0.48,
  ease: [0.19, 1, 0.22, 1] as const,
};

// New badge chevron animation — top/bottom stroke fade cross-fading in a loop.
const NEW_BADGE_TOP = [0, 0, 0.15, 1, 1, 0.85, 0];
const NEW_BADGE_BOTTOM = [0, 1, 1, 0.85, 0, 0, 0];
const NEW_BADGE_TIMES = [0, 0.22, 0.3, 0.5, 0.72, 0.8, 1];

const newBadgeStrokeTransition = {
  duration: 0.75,
  ease: "easeInOut" as const,
  repeat: Number.POSITIVE_INFINITY,
  times: NEW_BADGE_TIMES,
};

function NewBadge({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null;
}) {
  return (
    <span
      className="flex items-center rounded-lg font-medium text-sm capitalize"
      style={{ color: "var(--accent-pro)" }}
    >
      new
      <svg
        fill="none"
        height="20"
        viewBox="0 0 16 16"
        width="20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>New</title>
        <motion.path
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: NEW_BADGE_BOTTOM }
          }
          d="M5.2168 11.2812L8.3418 8.15625L11.4668 11.2812"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
          transition={
            prefersReducedMotion ? undefined : newBadgeStrokeTransition
          }
        />
        <motion.path
          animate={
            prefersReducedMotion ? { opacity: 1 } : { opacity: NEW_BADGE_TOP }
          }
          d="M5.2168 6.90625L8.3418 3.78125L11.4668 6.90625"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
          transition={
            prefersReducedMotion ? undefined : newBadgeStrokeTransition
          }
        />
      </svg>
    </span>
  );
}

const filterItemVariants = {
  initial: {
    filter: "blur(4px)",
    opacity: 0,
    y: 10,
  },
  animate: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
  },
  exit: {
    filter: "blur(4px)",
    opacity: 0,
    y: -6,
    transition: { duration: 0.36, ease: [0.19, 1, 0.22, 1] },
  },
};

const reducedFilterItemVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const sectionVariants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -12,
  },
};

const viewTransitionVariants = {
  center: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
  },
  enter: {
    filter: `blur(${VIEW_BLUR})`,
    opacity: 0,
    y: VIEW_SLIDE_OFFSET,
  },
  exit: {
    filter: `blur(${VIEW_BLUR})`,
    opacity: 0,
    y: -VIEW_SLIDE_OFFSET,
  },
};

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Newest", value: "newest" },
] as const satisfies readonly { label: string; value: SortMode }[];

function sortItems(
  items: ComponentGalleryItem[],
  sortMode: SortMode
): ComponentGalleryItem[] {
  const sorted = [...items];

  if (sortMode === "newest") {
    return sorted.toSorted((a, b) => {
      const aDate = a.releaseDate ?? "";
      const bDate = b.releaseDate ?? "";
      return bDate.localeCompare(aDate);
    });
  }

  return sorted.toSorted((a, b) => a.title.localeCompare(b.title));
}

function filterItems(
  items: ComponentGalleryItem[],
  search: string
): ComponentGalleryItem[] {
  const query = search.trim().toLowerCase();

  return items.filter((item) => {
    if (!isGalleryCatalogItem(item)) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.slug.toLowerCase().includes(query)
    );
  });
}

function GalleryAnimatedItem({
  children,
  index,
  prefersReducedMotion,
}: {
  children: ReactNode;
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const variants = prefersReducedMotion
    ? reducedFilterItemVariants
    : filterItemVariants;

  return (
    <motion.div
      animate="animate"
      exit="exit"
      initial="initial"
      layout
      transition={{
        ...FILTER_ITEM_TRANSITION,
        delay: prefersReducedMotion
          ? 0
          : Math.min(index * FILTER_ITEM_STAGGER, FILTER_ITEM_STAGGER_CAP),
        layout: {
          duration: 0.45,
          ease: [0.19, 1, 0.22, 1],
        },
      }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

function GalleryCard({
  item,
  prefersReducedMotion,
  priority = false,
}: {
  item: ComponentGalleryItem;
  prefersReducedMotion: boolean | null;
  priority?: boolean;
}) {
  const category = resolveGalleryCategory(item);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  // Computed after mount — isRecentlyReleased() reads Date.now(), which is not
  // allowed during a client render without a Suspense boundary.
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setIsNew(isRecentlyReleased(item.releaseDate));
  }, [item.releaseDate]);

  return (
    <div>
      <Link
        className="block"
        href={item.href}
        onBlur={() => {
          setIsPreviewActive(false);
        }}
        onFocus={() => {
          setIsPreviewActive(true);
        }}
        onMouseEnter={() => {
          setIsPreviewActive(true);
        }}
        onMouseLeave={() => {
          setIsPreviewActive(false);
        }}
      >
        <div className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-3 transition-colors duration-200 hover:border-foreground/15">
          <div
            className="relative w-full overflow-hidden rounded-xl bg-muted"
            style={{ aspectRatio: "4 / 3" }}
          >
            <GalleryCardPreview
              active={isPreviewActive}
              category={category}
              preview={item.cardPreview}
              priority={priority}
              title={item.title}
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <span className="truncate font-medium text-base text-foreground">
              {item.title}
            </span>
            {isNew ? (
              <NewBadge prefersReducedMotion={prefersReducedMotion} />
            ) : null}
          </div>
        </div>
      </Link>
    </div>
  );
}

function GalleryCompactCard({
  item,
  priority = false,
}: {
  item: ComponentGalleryItem;
  priority?: boolean;
}) {
  const category = resolveGalleryCategory(item);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  return (
    <div>
      <Link
        className="block"
        href={item.href}
        onBlur={() => {
          setIsPreviewActive(false);
        }}
        onFocus={() => {
          setIsPreviewActive(true);
        }}
        onMouseEnter={() => {
          setIsPreviewActive(true);
        }}
        onMouseLeave={() => {
          setIsPreviewActive(false);
        }}
      >
        <div className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-2 transition-colors duration-200 hover:border-foreground/15">
          <div
            className="relative w-full overflow-hidden rounded-xl bg-muted"
            style={{ aspectRatio: "4 / 3" }}
          >
            <GalleryCardPreview
              active={isPreviewActive}
              category={category}
              preview={item.cardPreview}
              priority={priority}
              title={item.title}
            />
          </div>
          <div className="flex items-center px-3 py-2">
            <span className="truncate font-medium text-foreground text-sm">
              {item.title}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function GalleryListRow({
  item,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
}: {
  item: ComponentGalleryItem;
  onPointerEnter?: (
    item: ComponentGalleryItem,
    event: React.MouseEvent<HTMLElement>
  ) => void;
  onPointerLeave?: () => void;
  onPointerMove?: (event: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <Link
      className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5 transition-all hover:border-foreground/15"
      href={item.href}
      onMouseEnter={(event) => {
        onPointerEnter?.(item, event);
      }}
      onMouseLeave={onPointerLeave}
      onMouseMove={onPointerMove}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground text-sm">
            {item.title}
          </span>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-foreground/50 text-xs capitalize">
            {resolveGalleryCategory(item)}
          </span>
        </div>
        {item.description ? (
          <p className="line-clamp-1 text-foreground/50 text-xs">
            {item.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function GallerySectionItems({
  isFirstSection,
  items,
  listHoverHandlers,
  prefersReducedMotion,
  viewMode,
}: {
  isFirstSection: boolean;
  items: ComponentGalleryItem[];
  listHoverHandlers?: {
    onPointerEnter: (
      item: ComponentGalleryItem,
      event: React.MouseEvent<HTMLElement>
    ) => void;
    onPointerLeave: () => void;
    onPointerMove: (event: React.MouseEvent<HTMLElement>) => void;
  };
  prefersReducedMotion: boolean | null;
  viewMode: ViewMode;
}) {
  const variants = prefersReducedMotion
    ? {
        center: { opacity: 1 },
        enter: { opacity: 0 },
        exit: { opacity: 0 },
      }
    : viewTransitionVariants;

  let content: ReactNode;

  if (viewMode === "list") {
    content = (
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <GalleryAnimatedItem
              index={index}
              key={item.slug}
              prefersReducedMotion={prefersReducedMotion}
            >
              <GalleryListRow
                item={item}
                onPointerEnter={listHoverHandlers?.onPointerEnter}
                onPointerLeave={listHoverHandlers?.onPointerLeave}
                onPointerMove={listHoverHandlers?.onPointerMove}
              />
            </GalleryAnimatedItem>
          ))}
        </AnimatePresence>
      </div>
    );
  } else if (viewMode === "compact") {
    content = (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <GalleryAnimatedItem
              index={index}
              key={item.slug}
              prefersReducedMotion={prefersReducedMotion}
            >
              <GalleryCompactCard
                item={item}
                priority={isFirstSection && index < 4}
              />
            </GalleryAnimatedItem>
          ))}
        </AnimatePresence>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <GalleryAnimatedItem
              index={index}
              key={item.slug}
              prefersReducedMotion={prefersReducedMotion}
            >
              <GalleryCard
                item={item}
                prefersReducedMotion={prefersReducedMotion}
                priority={isFirstSection && index < 3}
              />
            </GalleryAnimatedItem>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-clip">
      <AnimatePresence mode="wait">
        <motion.div
          animate="center"
          exit="exit"
          initial="enter"
          key={viewMode}
          transition={VIEW_SLIDE_TRANSITION}
          variants={variants}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ViewToggle({
  setViewMode,
  viewMode,
}: {
  setViewMode: (mode: ViewMode) => void;
  viewMode: ViewMode;
}) {
  const options = [
    { value: "cards", label: "Cards", Icon: Grid2x2 },
    { value: "compact", label: "Compact", Icon: Grid3x2 },
    { value: "list", label: "List", Icon: List },
  ] as const;

  return (
    <Tabs
      onValueChange={(value) => {
        setViewMode(value as ViewMode);
      }}
      value={viewMode}
    >
      <TabsHighlight className="absolute inset-0 rounded-lg bg-background shadow-sm dark:bg-foreground/10">
        <TabsList className="relative flex h-10 shrink-0 items-center rounded-xl bg-muted p-1">
          {options.map(({ value, label, Icon }) => (
            <TabsHighlightItem className="h-full" key={value} value={value}>
              <TabsTrigger
                aria-label={`Display in ${label.toLowerCase()} mode`}
                className="relative z-10 flex h-full w-10 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline-none data-[state=active]:text-foreground data-[state=inactive]:text-foreground/45"
                title={label}
                value={value}
              >
                <Icon className="h-4 w-4" />
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsList>
      </TabsHighlight>
    </Tabs>
  );
}

interface ComponentGalleryExplorerProps {
  items: ComponentGalleryItem[];
}

export function ComponentGalleryExplorer({
  items,
}: ComponentGalleryExplorerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const filteredItems = useMemo(
    () => sortItems(filterItems(items, search), sortMode),
    [items, search, sortMode]
  );

  const {
    clearHoverPreview,
    hoverPosition,
    hoverPreview,
    onItemPointerEnter,
    onItemPointerLeave,
    onItemPointerMove,
  } = useCatalogHoverPreview(filteredItems);

  useEffect(() => {
    if (viewMode !== "list") {
      clearHoverPreview();
    }
  }, [viewMode, clearHoverPreview]);

  // Reset flyout when filters change so stale previews do not linger.
  // biome-ignore lint/correctness/useExhaustiveDependencies: search and sortMode drive intentional reset
  useEffect(() => {
    clearHoverPreview();
  }, [search, sortMode]);

  const listHoverHandlers = useMemo(
    () =>
      viewMode === "list"
        ? {
            onPointerEnter: onItemPointerEnter,
            onPointerLeave: onItemPointerLeave,
            onPointerMove: onItemPointerMove,
          }
        : undefined,
    [viewMode, onItemPointerEnter, onItemPointerLeave, onItemPointerMove]
  );

  const groupedItems = useMemo(
    () => groupGalleryItemsByCategory(filteredItems),
    [filteredItems]
  );

  const visibleSections = useMemo(
    () =>
      COMPONENT_GALLERY_SECTIONS.filter((section) => {
        const sectionItems = groupedItems.get(section.id);
        return sectionItems && sectionItems.length > 0;
      }),
    [groupedItems]
  );

  const hasResults = visibleSections.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 py-10">
      <div className="flex flex-col gap-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row">
          <div className="relative w-full">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
              strokeWidth={2.5}
            />
            <input
              className="h-10 w-full rounded-xl bg-muted pr-2 pl-10 text-base text-foreground transition-shadow placeholder:text-foreground/35 placeholder:tracking-tight focus:outline-none focus:ring-2 focus:ring-foreground/20"
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search... (or just explore)"
              type="search"
              value={search}
            />
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
            <GallerySegmentedTabs
              onChange={setSortMode}
              options={SORT_OPTIONS}
              value={sortMode}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {hasResults ? (
            <motion.div
              animate="animate"
              className="flex flex-col gap-24"
              exit="exit"
              initial="initial"
              key="gallery-results"
              transition={FILTER_TRANSITION}
              variants={
                prefersReducedMotion
                  ? {
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      exit: { opacity: 0 },
                    }
                  : sectionVariants
              }
            >
              <AnimatePresence mode="popLayout">
                {visibleSections.map((section, index) => {
                  const sectionItems = groupedItems.get(section.id) ?? [];

                  return (
                    <motion.section
                      animate="animate"
                      className="flex flex-col gap-6"
                      exit="exit"
                      id={section.id}
                      initial="initial"
                      key={section.id}
                      layout
                      transition={FILTER_TRANSITION}
                      variants={
                        prefersReducedMotion
                          ? {
                              initial: { opacity: 0 },
                              animate: { opacity: 1 },
                              exit: { opacity: 0 },
                            }
                          : sectionVariants
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="inline-flex items-start gap-2">
                            <h2 className="text-4xl tracking-tight">
                              {section.title}
                            </h2>
                            <span className="mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 font-medium text-foreground/70 text-xs tabular-nums">
                              {sectionItems.length}
                            </span>
                          </div>
                          <p className="text-base text-foreground/50">
                            {section.description}
                          </p>
                        </div>

                        {index === 0 ? (
                          <ViewToggle
                            setViewMode={setViewMode}
                            viewMode={viewMode}
                          />
                        ) : null}
                      </div>

                      <GallerySectionItems
                        isFirstSection={index === 0}
                        items={sectionItems}
                        listHoverHandlers={listHoverHandlers}
                        prefersReducedMotion={prefersReducedMotion}
                        viewMode={viewMode}
                      />
                    </motion.section>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-[240px] flex-col items-center justify-center gap-2 text-center"
              exit={{ opacity: 0, y: -8 }}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              key="gallery-empty"
              transition={FILTER_TRANSITION}
            >
              <p className="font-medium text-foreground text-lg tracking-tight">
                No components found
              </p>
              <p className="max-w-md text-foreground/50 text-sm">
                Try a different search term or sort order.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CatalogNavHoverPreview position={hoverPosition} preview={hoverPreview} />
    </div>
  );
}
