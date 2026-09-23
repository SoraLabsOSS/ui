"use client";

import {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/primitives/animate/tabs";
import {
  ArrowUpRight,
  ExternalLink,
  Grid2x2,
  Grid3x2,
  List,
  Loader,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookmarkEmptyState,
  BookmarkSearchEmptyState,
} from "@/components/bookmark/bookmark-empty-state";
import { isAuthEnabled } from "@/env";
import type { BookmarkPageData } from "@/lib/bookmarks/resolve-pages";
import { useBookmarkPages } from "@/lib/bookmarks/use-bookmark-pages";

type ViewMode = "cards" | "compact" | "list";

const TAG_GRADIENTS: Record<string, string> = {
  catalog: "from-violet-500/15 via-blue-500/8 to-transparent",
  components: "from-violet-500/15 via-blue-500/8 to-transparent",
  motion: "from-emerald-500/15 via-teal-500/8 to-transparent",
  primitives: "from-emerald-500/15 via-teal-500/8 to-transparent",
  texts: "from-amber-500/15 via-orange-500/8 to-transparent",
  buttons: "from-pink-500/15 via-rose-500/8 to-transparent",
  backgrounds: "from-cyan-500/15 via-sky-500/8 to-transparent",
  docs: "from-slate-500/15 via-gray-500/8 to-transparent",
  ui: "from-indigo-500/15 via-sky-500/8 to-transparent",
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
  error: Error | null;
  filteredBookmarks: BookmarkPageData[];
  handleRemove: (url: string) => void;
  loading: boolean;
  onRetry: () => void;
  removingUrl: string | null;
  viewMode: ViewMode;
}

function renderContent({
  loading,
  error,
  bookmarks,
  filteredBookmarks,
  viewMode,
  handleRemove,
  onRetry,
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

  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-foreground/60 text-sm">
          Could not load your bookmarks. Please try again.
        </p>
        <button
          className="rounded-lg bg-foreground px-4 py-2 font-medium text-background text-sm transition-opacity hover:opacity-80"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      </div>
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
  const signInUrl = `/auth/sign-in?redirectTo=${encodeURIComponent("/library")}`;

  return (
    <BookmarkEmptyState
      cta={{ href: signInUrl, label: "Sign in", variant: "inverted" }}
      description="Your saved Sora UI pages are synced to your account. Sign in to view your library."
      eyebrow="Account"
      title="Sign in to view your library"
    />
  );
}

function AuthDisabledState(): React.ReactNode {
  return (
    <BookmarkEmptyState
      cta={{ href: "/docs", label: "Explore components", variant: "accent" }}
      description="My Library is unavailable while authentication is disabled."
      eyebrow="Unavailable"
      title="My Library is temporarily disabled"
    />
  );
}

/* ── Page ── */
export default function BookmarkPage() {
  const authEnabled = isAuthEnabled();
  const {
    isAuthenticated,
    error,
    isRemoving,
    loading,
    pages: bookmarks,
    refetch,
    removeBookmark,
    removingUrl,
    sessionPending,
  } = useBookmarkPages();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeTab, setActiveTab] = useState<"lists" | "saves" | "opened">(
    "lists"
  );
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

  let bookmarkContent: React.ReactNode;
  if (!authEnabled) {
    bookmarkContent = <AuthDisabledState />;
  } else if (showGuestState) {
    bookmarkContent = <GuestState />;
  } else {
    bookmarkContent = renderContent({
      loading,
      error,
      bookmarks,
      filteredBookmarks,
      viewMode,
      handleRemove,
      onRetry: refetch,
      removingUrl: activeRemovingUrl,
    });
  }

  const listContent = (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 2xl:grid-cols-4">
      <li>
        <button
          aria-label="Create a list (coming soon)"
          className="flex aspect-[4/3] w-full cursor-not-allowed flex-col items-center justify-center gap-1.5 rounded-[14px] border border-border/70 border-dashed text-muted-foreground/50"
          disabled
          title="Lists are coming soon"
          type="button"
        >
          <Plus className="size-[22px]" strokeWidth={1.5} />
          <span className="font-medium text-xs">New list</span>
        </button>
      </li>
    </ul>
  );

  let activeContent: React.ReactNode;
  if (activeTab === "lists") {
    activeContent = listContent;
  } else if (activeTab === "opened") {
    activeContent = (
      <div className="flex min-h-48 items-center justify-center text-muted-foreground text-sm">
        No opened pages yet.
      </div>
    );
  } else {
    activeContent = (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium text-lg">All saves</h2>
          <ViewToggle setViewMode={setViewMode} viewMode={viewMode} />
        </div>
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">{bookmarkContent}</AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full bg-background">
      <main className="space-y-8 px-5 pt-[18px] pb-5 max-md:px-3">
        <div className="flex flex-wrap items-center gap-3 px-2 pt-1">
          <div className="min-w-[180px] flex-1">
            <h1 className="font-medium text-2xl tracking-tight">Bookmarks</h1>
            <p className="mt-0.5 h-[18px] text-[13px] text-muted-foreground">
              {bookmarks.length} {bookmarks.length === 1 ? "save" : "saves"} ·
              no lists yet
            </p>
          </div>
          <input
            className="hidden h-8 w-[190px] rounded-lg border border-input bg-background px-3 text-foreground text-sm shadow-black/5 shadow-sm transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 md:block"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              activeTab === "lists" ? "Search lists" : "Search saves"
            }
            value={search}
          />
          <button
            className="inline-flex h-8 shrink-0 cursor-not-allowed items-center gap-1.5 rounded-md bg-primary px-3 font-medium text-primary-foreground text-xs disabled:opacity-100"
            disabled
            title="Lists are coming soon"
            type="button"
          >
            <Plus className="size-3.5" />
            New list
          </button>
        </div>

        <fieldset
          aria-label="Bookmark views"
          className="mx-2 flex w-max items-center gap-1 rounded-full bg-muted p-1"
        >
          <legend className="sr-only">Bookmark views</legend>
          {(
            [
              ["lists", "Lists"],
              ["saves", "All saves"],
              ["opened", "Opened"],
            ] as const
          ).map(([tab, label]) => (
            <button
              aria-pressed={activeTab === tab}
              className={`h-7 rounded-full border px-4 text-[13px] transition-colors ${activeTab === tab ? "border-border/60 bg-background font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {label}
            </button>
          ))}
        </fieldset>

        {activeContent}
      </main>
    </div>
  );
}
