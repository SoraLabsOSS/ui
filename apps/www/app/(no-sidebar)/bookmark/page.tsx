"use client";

import { cn } from "@workspace/ui/lib/utils";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { ArrowRight, Bookmark, Loader, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
        urls.push(key.slice(9)); // Remove "bookmark:" prefix
      }
    }
  } catch (error) {
    console.error("Error reading localStorage keys:", error);
  }
  return urls;
}

export default function BookmarkPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<PageData[]>([]);

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
        const filtered = data.filter((page) =>
          bookmarkedUrls.includes(page.url)
        );
        setBookmarks(filtered);
      } catch (error) {
        console.error("Error loading bookmarks details:", error);
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
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  if (!isMounted) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pt-24 pb-6 md:px-6 md:pt-28 md:pb-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div className="h-40 animate-pulse rounded-xl bg-muted" key={i} />
          ))}
        </div>
      </div>
    );
  }

  let mainContent: React.ReactNode;
  if (loading) {
    mainContent = (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Loading bookmarks...</p>
      </div>
    );
  } else if (bookmarks.length === 0) {
    mainContent = (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border border-dashed p-8 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground">
          <Bookmark className="h-8 w-8" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
          </span>
        </div>
        <h3 className="mt-4 font-semibold text-lg">No bookmarks yet</h3>
        <p className="mt-2 max-w-xs text-muted-foreground text-sm">
          Save components or guide pages you frequently visit by clicking the
          bookmark icon.
        </p>
        <div className="mt-6">
          <Link
            className={cn(
              buttonVariants({
                color: "secondary",
                size: "sm",
              }),
              "gap-2"
            )}
            href="/docs"
          >
            Explore Components
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  } else {
    mainContent = (
      <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" layout>
        <AnimatePresence mode="popLayout">
          {bookmarks.map((page) => (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30 hover:shadow-md"
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              initial={{ opacity: 0, scale: 0.95 }}
              key={page.url}
              layout
              transition={{ duration: 0.2 }}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground text-xs transition-colors hover:bg-secondary/80">
                    {page.tag || "Docs"}
                  </span>
                  <button
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemove(page.url)}
                    title="Remove bookmark"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-3 font-semibold text-base text-foreground tracking-tight transition-colors group-hover:text-primary">
                  {page.title}
                </h3>
                {page.description && (
                  <p className="mt-1.5 line-clamp-2 text-muted-foreground text-sm leading-snug">
                    {page.description}
                  </p>
                )}
              </div>
              <div className="mt-5 border-border/50 border-t pt-3">
                <Link
                  className="inline-flex w-full items-center justify-between font-medium text-muted-foreground text-sm transition-colors group-hover:text-primary"
                  href={page.url}
                >
                  <span>View Page</span>
                  <ArrowRight className="h-4 w-4 translate-x-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-24 pb-6 md:px-6 md:pt-28 md:pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl tracking-tight md:text-4xl">
          Bookmarks
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage your saved components and documentation pages.
        </p>
      </div>

      <div className="my-8 border-border border-t" />

      {mainContent}
    </div>
  );
}
