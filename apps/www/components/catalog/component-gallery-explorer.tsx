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
import { type ReactNode, useMemo, useRef, useState } from "react";
import {
  COMPONENT_GALLERY_SECTIONS,
  groupGalleryItemsByCategory,
  isGalleryCatalogItem,
  resolveGalleryCategory,
} from "@/lib/registry/component-gallery-sections";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import { GalleryCardThumbnail } from "./gallery-card-thumbnail";
import { GallerySegmentedTabs } from "./gallery-segmented-tabs";

type SortMode = "default" | "newest";
type ViewMode = "cards" | "compact" | "list";

const VIEW_SLIDE_OFFSET = 20;
const VIEW_BLUR = "8px";
const VIEW_SLIDE_TRANSITION = {
  duration: 0.32,
  ease: [0.19, 1, 0.22, 1] as const,
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

function GalleryCard({ item }: { item: ComponentGalleryItem }) {
  const category = resolveGalleryCategory(item);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePreviewHover = (playing: boolean) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (playing) {
      video.play().catch(() => {
        /* autoplay blocked */
      });
      return;
    }

    video.pause();
    video.currentTime = 0;
  };

  return (
    <div>
      <Link
        className="block"
        href={item.href}
        onMouseEnter={() => {
          handlePreviewHover(true);
        }}
        onMouseLeave={() => {
          handlePreviewHover(false);
        }}
      >
        <div className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-3 transition-colors duration-200 hover:border-foreground/15">
          <div
            className="relative w-full overflow-hidden rounded-xl bg-muted"
            style={{ aspectRatio: "4 / 3" }}
          >
            {item.previewVideo ? (
              <video
                className="absolute inset-0 size-full object-cover"
                loop
                muted
                playsInline
                preload="none"
                ref={videoRef}
                src={item.previewVideo}
              />
            ) : (
              <GalleryCardThumbnail category={category} title={item.title} />
            )}
          </div>

          <div className="flex items-center px-4 py-2.5">
            <span className="truncate font-medium text-base text-foreground">
              {item.title}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function GalleryCompactCard({ item }: { item: ComponentGalleryItem }) {
  const category = resolveGalleryCategory(item);

  return (
    <div>
      <Link className="block" href={item.href}>
        <div className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-2 transition-colors duration-200">
          <div
            className="relative w-full overflow-hidden rounded-xl bg-muted"
            style={{ aspectRatio: "4 / 3" }}
          >
            <GalleryCardThumbnail category={category} title={item.title} />
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

function GalleryListRow({ item }: { item: ComponentGalleryItem }) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5 transition-all hover:border-foreground/15">
      <Link className="flex min-w-0 flex-1 flex-col gap-0.5" href={item.href}>
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
      </Link>
    </div>
  );
}

function GallerySectionItems({
  items,
  prefersReducedMotion,
  viewMode,
}: {
  items: ComponentGalleryItem[];
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
        {items.map((item) => (
          <GalleryListRow item={item} key={item.slug} />
        ))}
      </div>
    );
  } else if (viewMode === "compact") {
    content = (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <GalleryCompactCard item={item} key={item.slug} />
        ))}
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <GalleryCard item={item} key={item.slug} />
        ))}
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

        {hasResults ? (
          <div className="flex flex-col gap-24">
            {visibleSections.map((section, index) => {
              const sectionItems = groupedItems.get(section.id) ?? [];

              return (
                <section
                  className="flex flex-col gap-6"
                  id={section.id}
                  key={section.id}
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
                    items={sectionItems}
                    prefersReducedMotion={prefersReducedMotion}
                    viewMode={viewMode}
                  />
                </section>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 text-center">
            <p className="font-medium text-foreground text-lg tracking-tight">
              No components found
            </p>
            <p className="max-w-md text-foreground/50 text-sm">
              Try a different search term or sort order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
