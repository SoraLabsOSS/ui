"use client";

import {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/animate-ui/primitives/animate/tabs";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkX,
  ExternalLink,
  Grid2x2,
  Grid3x2,
  List,
  Loader,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface PageData {
  description?: string;
  id: string;
  tag?: string;
  title: string;
  url: string;
}

function getBookmarkedUrls(): string[] {
  const urls: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key?.startsWith("bookmark:") &&
        localStorage.getItem(key) === "true"
      ) {
        urls.push(key.slice(9));
      }
    }
  } catch {
    // ignore localStorage errors
  }
  return urls;
}

type ViewMode = "cards" | "compact" | "list";

const TAG_GRADIENTS: Record<string, string> = {
  components: "from-violet-500/15 via-blue-500/8 to-transparent",
  primitives: "from-emerald-500/15 via-teal-500/8 to-transparent",
  texts: "from-amber-500/15 via-orange-500/8 to-transparent",
  buttons: "from-pink-500/15 via-rose-500/8 to-transparent",
  backgrounds: "from-cyan-500/15 via-sky-500/8 to-transparent",
  docs: "from-slate-500/15 via-gray-500/8 to-transparent",
};

function getTagGradient(tag: string | undefined): string {
  const key = (tag ?? "docs").toLowerCase();
  return TAG_GRADIENTS[key] ?? TAG_GRADIENTS.docs;
}

function CardThumbnail({
  title,
  tag,
  className,
}: {
  title: string;
  tag?: string;
  className?: string;
}) {
  const gradient = getTagGradient(tag);
  const hue =
    title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} bg-muted/60`}
    >
      <div
        className="absolute -top-8 -right-8 h-40 w-40 rounded-full opacity-25 blur-3xl"
        style={{ backgroundColor: `hsl(${hue} 65% 60%)` }}
      />
      <div
        className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: `hsl(${(hue + 60) % 360} 55% 55%)` }}
      />
      <span
        className={`relative z-10 max-w-[75%] text-center font-semibold text-foreground/30 text-lg leading-snug tracking-tight ${className || ""}`}
      >
        {title}
      </span>
    </div>
  );
}

/* ── View toggle group ── */
function ViewToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}) {
  const options = [
    { value: "cards", label: "Cards", Icon: Grid2x2 },
    { value: "compact", label: "Compact", Icon: Grid3x2 },
    { value: "list", label: "List", Icon: List },
  ] as const;

  return (
    <Tabs
      onValueChange={(v) => v && setViewMode(v as ViewMode)}
      value={viewMode}
    >
      <TabsHighlight className="absolute inset-0 rounded-lg bg-background shadow-sm dark:bg-foreground/10">
        <TabsList className="relative flex h-10 shrink-0 items-center rounded-xl bg-muted p-1">
          {options.map(({ value, label, Icon }) => (
            <TabsHighlightItem className="h-full" key={value} value={value}>
              <TabsTrigger
                aria-label={`Display in ${label} mode`}
                className="relative z-10 flex h-full w-10 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 focus-visible:outline-none data-[state=active]:text-foreground"
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

/* ── Filter pill group ── */
function FilterGroup({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <Tabs onValueChange={(v) => v && onChange(v)} value={active}>
      <TabsHighlight className="absolute inset-0 rounded-lg bg-background shadow-sm dark:bg-foreground/10">
        <TabsList className="relative flex h-10 shrink-0 items-center rounded-xl bg-muted p-1">
          {options.map((opt) => (
            <TabsHighlightItem className="h-full" key={opt} value={opt}>
              <TabsTrigger
                className="relative z-10 flex h-full cursor-pointer items-center justify-center rounded-lg px-3.5 text-muted-foreground text-sm transition-all duration-300 focus-visible:outline-none data-[state=active]:font-medium data-[state=active]:text-foreground"
                value={opt}
              >
                {opt}
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsList>
      </TabsHighlight>
    </Tabs>
  );
}

/* ── Card (4/3 aspect ratio thumbnail) ── */
function BookmarkCard({
  page,
  onRemove,
}: {
  page: PageData;
  onRemove: (url: string) => void;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group"
      exit={{ opacity: 0, scale: 0.96 }}
      initial={{ opacity: 0, y: 16 }}
      layout
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <article className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-card p-3 transition-colors duration-200">
        {/* Thumbnail */}
        <div
          className="relative w-full overflow-hidden rounded-xl bg-muted"
          style={{ aspectRatio: "4 / 3" }}
        >
          <CardThumbnail
            className="transition-opacity duration-200 group-hover:opacity-0"
            tag={page.tag}
            title={page.title}
          />

          {/* Hover overlay — CSS only */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
            <Link
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 font-medium text-sm text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20"
              href={page.url}
            >
              View Page
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Remove button */}
          <button
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/80 hover:text-white group-hover:opacity-100"
            onClick={() => onRemove(page.url)}
            title="Remove bookmark"
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center px-4 py-2.5">
          <span className="truncate font-medium text-base text-foreground">
            {page.title}
          </span>
        </div>
      </article>
    </motion.div>
  );
}

/* ── Compact card (smaller thumbnail) ── */
function BookmarkCompactCard({
  page,
  onRemove,
}: {
  page: PageData;
  onRemove: (url: string) => void;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      initial={{ opacity: 0, y: 12 }}
      layout
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link
        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-card p-2 transition-colors duration-200"
        href={page.url}
      >
        <div
          className="relative w-full overflow-hidden rounded-xl bg-muted"
          style={{ aspectRatio: "4 / 3" }}
        >
          <CardThumbnail tag={page.tag} title={page.title} />
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="truncate font-medium text-foreground text-sm">
            {page.title}
          </span>
          <button
            className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-foreground/30 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              onRemove(page.url);
            }}
            title="Remove bookmark"
            type="button"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── List row ── */
function BookmarkListRow({
  page,
  onRemove,
}: {
  page: PageData;
  onRemove: (url: string) => void;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5 transition-all hover:border-foreground/15"
      exit={{ opacity: 0, x: -8 }}
      initial={{ opacity: 0, x: -8 }}
      layout
      transition={{ duration: 0.18 }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground text-sm">
            {page.title}
          </span>
          {page.tag && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-foreground/50 text-xs">
              {page.tag}
            </span>
          )}
        </div>
        {page.description && (
          <p className="line-clamp-1 text-foreground/50 text-xs">
            {page.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Link
          className="flex h-8 items-center gap-1.5 rounded-lg bg-muted px-3 font-medium text-foreground text-sm transition-colors hover:bg-accent"
          href={page.url}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </Link>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onRemove(page.url)}
          title="Remove bookmark"
          type="button"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Content renderer ── */
interface RenderContentProps {
  bookmarks: PageData[];
  filteredBookmarks: PageData[];
  handleRemove: (url: string) => void;
  loading: boolean;
  viewMode: ViewMode;
}

function renderContent({
  loading,
  bookmarks,
  filteredBookmarks,
  viewMode,
  handleRemove,
}: RenderContentProps): React.ReactNode {
  if (loading) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className="flex min-h-[300px] flex-col items-center justify-center gap-3"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        key="loading-state"
      >
        <Loader className="h-7 w-7 animate-spin text-foreground/30" />
        <p className="text-foreground/40 text-sm">Loading bookmarks…</p>
      </motion.div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-foreground/10 border-dashed p-10 text-center"
        exit={{ opacity: 0, scale: 0.97 }}
        initial={{ opacity: 0, scale: 0.97 }}
        key="empty-bookmarks"
        transition={{ duration: 0.3 }}
      >
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-muted text-foreground/30">
          <Bookmark className="h-9 w-9" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-5 w-5 rounded-full bg-blue-500" />
          </span>
        </div>
        <h3 className="mt-5 font-semibold text-xl">No bookmarks yet</h3>
        <p className="mt-2 max-w-xs text-foreground/50 text-sm">
          Save components or documentation pages by clicking the bookmark icon.
        </p>
        <Link
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 font-medium text-foreground text-sm transition-colors hover:bg-accent"
          href="/docs"
        >
          Explore Components
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  if (filteredBookmarks.length === 0) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className="flex min-h-[200px] flex-col items-center justify-center gap-3"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        key="empty-search"
      >
        <BookmarkX className="h-9 w-9 text-foreground/25" />
        <p className="text-foreground/50 text-sm">
          No bookmarks match your search.
        </p>
      </motion.div>
    );
  }

  if (viewMode === "cards") {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        exit={{ opacity: 0, y: -10 }}
        initial={{ opacity: 0, y: 10 }}
        key="cards-container"
        layout
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <AnimatePresence mode="popLayout">
          {filteredBookmarks.map((page) => (
            <BookmarkCard
              key={`cards-${page.url}`}
              onRemove={handleRemove}
              page={page}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (viewMode === "compact") {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        exit={{ opacity: 0, y: -10 }}
        initial={{ opacity: 0, y: 10 }}
        key="compact-container"
        layout
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <AnimatePresence mode="popLayout">
          {filteredBookmarks.map((page) => (
            <BookmarkCompactCard
              key={`compact-${page.url}`}
              onRemove={handleRemove}
              page={page}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 10 }}
      key="list-container"
      layout
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <AnimatePresence mode="popLayout">
        {filteredBookmarks.map((page) => (
          <BookmarkListRow
            key={`list-${page.url}`}
            onRemove={handleRemove}
            page={page}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Page ── */
export default function BookmarkPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<PageData[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  useEffect(() => {
    setIsMounted(true);

    const loadBookmarks = async () => {
      const bookmarkedUrls = getBookmarkedUrls();
      if (bookmarkedUrls.length === 0) {
        setBookmarks([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/static.json");
        if (!res.ok) {
          throw new Error("Failed to fetch search index");
        }
        const data: PageData[] = await res.json();
        setBookmarks(data.filter((page) => bookmarkedUrls.includes(page.url)));
      } catch {
        // ignore fetch errors
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  const handleRemove = (url: string) => {
    try {
      localStorage.removeItem(`bookmark:${url}`);
      setBookmarks((prev) => prev.filter((item) => item.url !== url));
    } catch {
      // ignore localStorage errors
    }
  };

  const allTags = useMemo(() => {
    const tags = new Set(bookmarks.map((b) => b.tag ?? "Docs"));
    return ["All", ...Array.from(tags).sort()];
  }, [bookmarks]);

  const filteredBookmarks = useMemo(
    () =>
      bookmarks.filter((b) => {
        const matchesSearch =
          search.trim() === "" ||
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.description?.toLowerCase().includes(search.toLowerCase());
        const matchesTag =
          activeTag === "All" || (b.tag ?? "Docs") === activeTag;
        return matchesSearch && matchesTag;
      }),
    [bookmarks, search, activeTag]
  );

  /* skeleton */
  if (!isMounted) {
    return (
      <div className="flex flex-col items-center px-6 lg:px-10">
        <div className="flex flex-col items-center justify-center pt-24 sm:pt-32 md:pt-40">
          <div className="mb-4 h-16 w-80 animate-pulse rounded-2xl bg-muted" />
          <div className="h-5 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-12 w-full max-w-7xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                className="animate-pulse rounded-2xl bg-card"
                key={i}
                style={{ aspectRatio: "4 / 3" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 lg:px-10">
      {/* ── Hero ── */}
      <div className="relative flex flex-col items-center justify-center pt-24 sm:pt-30">
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl text-center font-medium text-4xl tracking-tighter sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
        >
          Your Bookmarks
        </motion.h1>
        <motion.p
          animate={{ opacity: 1 }}
          className="mt-3 max-w-xl text-balance text-center text-foreground/50 text-sm sm:text-base md:text-lg"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {bookmarks.length === 0 && !loading
            ? "Nothing saved yet — explore and bookmark components."
            : `${bookmarks.length} item${bookmarks.length === 1 ? "" : "s"} in your collection.`}
        </motion.p>
      </div>

      {/* ── Main content area ── */}
      <div className="flex w-full max-w-7xl flex-col gap-10 py-6 md:gap-16 md:py-10">
        <div className="flex flex-col gap-8 md:gap-12">
          {/* Search + filters */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            {/* Search input */}
            <div className="relative w-full">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-foreground/35" />
              <input
                className="h-10 w-full rounded-xl bg-muted pr-3 pl-10 text-base text-foreground transition-shadow placeholder:text-foreground/35 placeholder:tracking-tight focus:outline-none focus:ring-2 focus:ring-foreground/20"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search… (or just explore)"
                type="text"
                value={search}
              />
            </div>

            {/* Tag filter pills */}
            {/* {allTags.length > 1 && (
              <div className="flex w-full shrink-0 flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
                <FilterGroup
                  active={activeTag}
                  onChange={setActiveTag}
                  options={allTags}
                />
              </div>
            )} */}
          </motion.div>

          {/* ── Section header ── */}
          <motion.div
            animate={{ opacity: 1 }}
            className="flex items-start justify-between gap-3"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-start gap-2">
                <h2 className="text-2xl tracking-tight sm:text-3xl md:text-4xl">
                  Bookmarks
                </h2>
                <span className="mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 font-medium text-foreground/70 text-xs tabular-nums">
                  {filteredBookmarks.length}
                </span>
              </div>
              <p className="text-base text-foreground/50">
                Your saved components and documentation pages
              </p>
            </div>

            <ViewToggle setViewMode={setViewMode} viewMode={viewMode} />
          </motion.div>

          {/* ── Grid / List ── */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {renderContent({
                loading,
                bookmarks,
                filteredBookmarks,
                viewMode,
                handleRemove,
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
