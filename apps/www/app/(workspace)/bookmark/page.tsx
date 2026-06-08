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
import {
  BookmarkEmptyState,
  BookmarkSearchEmptyState,
} from "@/components/bookmark/bookmark-empty-state";
import type { BookmarkPageData } from "@/lib/bookmarks/resolve-pages";
import { useBookmarkPages } from "@/lib/bookmarks/use-bookmark-pages";

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
    { value: "cards", label: "Cards", Icon: Grid2x2, disabled: true },
    { value: "compact", label: "Compact", Icon: Grid3x2, disabled: true },
    { value: "list", label: "List", Icon: List, disabled: false },
  ] as const;

  return (
    <Tabs
      onValueChange={(v) => {
        if (v === "list") {
          setViewMode("list");
        }
      }}
      value={viewMode}
    >
      <TabsHighlight className="absolute inset-0 rounded-lg bg-background shadow-sm dark:bg-foreground/10">
        <TabsList className="relative flex h-10 shrink-0 items-center rounded-xl bg-muted p-1">
          {options.map(({ value, label, Icon, disabled }) => (
            <TabsHighlightItem className="h-full" key={value} value={value}>
              <TabsTrigger
                aria-disabled={disabled}
                aria-label={`Display in ${label} mode`}
                className="relative z-10 flex h-full w-10 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 data-[state=active]:text-foreground"
                disabled={disabled}
                title={disabled ? `${label} (coming soon)` : label}
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

/* ── Card (4/3 aspect ratio thumbnail) ── */
function BookmarkCard({
  page,
  onRemove,
}: {
  page: BookmarkPageData;
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
      <Link
        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-card p-3 transition-colors duration-200"
        href={page.url}
      >
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

          {/* Hover overlay — visual only; whole card is the link */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 font-medium text-sm text-white ring-1 ring-white/20 backdrop-blur-sm">
              View Page
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>

          {/* Remove button */}
          <button
            className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/80 hover:text-white group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(page.url);
            }}
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
      </Link>
    </motion.div>
  );
}

/* ── Compact card (smaller thumbnail) ── */
function BookmarkCompactCard({
  page,
  onRemove,
}: {
  page: BookmarkPageData;
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
              e.stopPropagation();
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
  isRemoving,
  page,
  onRemove,
}: {
  isRemoving: boolean;
  page: BookmarkPageData;
  onRemove: (url: string) => void;
}) {
  return (
    <motion.div
      animate={{ opacity: isRemoving ? 0.55 : 1, x: 0 }}
      aria-busy={isRemoving}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5 transition-all hover:border-foreground/15"
      exit={{ opacity: 0, x: -8 }}
      initial={{ opacity: 0, x: -8 }}
      layout
      transition={{ duration: 0.18 }}
    >
      <Link className="flex min-w-0 flex-1 flex-col gap-0.5" href={page.url}>
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
      </Link>
      <div className="flex items-center gap-2">
        <Link
          className="flex h-8 items-center gap-1.5 rounded-lg bg-muted px-3 font-medium text-foreground text-sm transition-colors hover:bg-accent max-sm:sr-only"
          href={page.url}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </Link>
        <button
          aria-busy={isRemoving}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRemoving}
          onClick={() => onRemove(page.url)}
          title={isRemoving ? "Removing bookmark…" : "Remove bookmark"}
          type="button"
        >
          {isRemoving ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Content renderer ── */
interface RenderContentProps {
  bookmarks: BookmarkPageData[];
  filteredBookmarks: BookmarkPageData[];
  handleRemove: (url: string) => void;
  loading: boolean;
  removingUrl: string | null;
  viewMode: ViewMode;
}

function renderContent({
  loading,
  bookmarks,
  filteredBookmarks,
  viewMode,
  handleRemove,
  removingUrl,
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
      <div key="empty-bookmarks">
        <BookmarkEmptyState
          cta={{
            href: "/docs",
            label: "Explore components",
            variant: "accent",
          }}
          description="Save components or documentation pages by clicking the bookmark icon on any docs page."
          eyebrow="Your collection"
          title="No bookmarks yet"
        />
      </div>
    );
  }

  if (filteredBookmarks.length === 0) {
    return (
      <div key="empty-search">
        <BookmarkSearchEmptyState />
      </div>
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
      className="flex flex-col gap-4"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 10 }}
      key="list-container"
      layout
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <AnimatePresence mode="popLayout">
        {filteredBookmarks.map((page) => (
          <BookmarkListRow
            isRemoving={removingUrl === page.url}
            key={`list-${page.url}`}
            onRemove={handleRemove}
            page={page}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function GuestState(): React.ReactNode {
  const signInUrl = `/auth/sign-in?redirectTo=${encodeURIComponent("/bookmark")}`;

  return (
    <BookmarkEmptyState
      cta={{ href: signInUrl, label: "Sign in", variant: "inverted" }}
      description="Your saved components and docs are synced to your account. Sign in to see your collection."
      eyebrow="Account"
      title="Sign in to view bookmarks"
    />
  );
}

/* ── Page ── */
export default function BookmarkPage() {
  const {
    isAuthenticated,
    isRemoving,
    loading,
    pages: bookmarks,
    removeBookmark,
    removingUrl,
    sessionPending,
  } = useBookmarkPages();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [pendingRemoveUrl, setPendingRemoveUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!removingUrl) {
      setPendingRemoveUrl(null);
    }
  }, [removingUrl]);

  const handleRemove = (url: string) => {
    if (isRemoving) {
      return;
    }

    setPendingRemoveUrl(url);
    removeBookmark(url);
  };

  const activeRemovingUrl = pendingRemoveUrl ?? removingUrl;

  const filteredBookmarks = useMemo(
    () =>
      bookmarks.filter((b) => {
        const matchesSearch =
          search.trim() === "" ||
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.description?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
      }),
    [bookmarks, search]
  );

  const showGuestState = !(sessionPending || isAuthenticated);

  const heroSubtitle = (() => {
    if (showGuestState) {
      return "Sign in to sync and access your saved pages.";
    }

    if (bookmarks.length === 0 && !loading) {
      return "Nothing saved yet — explore and bookmark components.";
    }

    return `${bookmarks.length} item${bookmarks.length === 1 ? "" : "s"} in your collection.`;
  })();

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
          {heroSubtitle}
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
              {showGuestState ? (
                <GuestState />
              ) : (
                renderContent({
                  loading,
                  bookmarks,
                  filteredBookmarks,
                  viewMode,
                  handleRemove,
                  removingUrl: activeRemovingUrl,
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
