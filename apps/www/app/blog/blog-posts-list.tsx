"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface SerializedBlogPost {
  author?: string;
  dateFormatted: string;
  dateIso: string;
  description?: string;
  hashtags: string[];
  title: string;
  url: string;
}

const INITIAL_DISPLAY_COUNT = 8;
const HASH_REGEX = /^#/;

export function BlogPostsList({ posts }: { posts: SerializedBlogPost[] }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return posts;
    }
    return posts.filter((post) => {
      const matchesTitle = post.title.toLowerCase().includes(q);
      const matchesDesc = post.description?.toLowerCase().includes(q);
      const matchesHashtag = post.hashtags.some((tag) =>
        tag.toLowerCase().includes(q)
      );
      return matchesTitle || matchesDesc || matchesHashtag;
    });
  }, [posts, query]);

  const displayedPosts = expanded
    ? filteredPosts
    : filteredPosts.slice(0, INITIAL_DISPLAY_COUNT);

  const hasMore = filteredPosts.length > INITIAL_DISPLAY_COUNT;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header with Title and Filter Input */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-balance font-[450] @lg:text-[56px] @md:text-[44px] text-[32px] text-foreground @lg:leading-[1.05] leading-[1.15] @lg:tracking-[-0.035em] tracking-[-0.025em]">
            All Posts
          </h2>
          <div className="relative w-full rounded-md sm:w-72">
            <div className="group/combobox relative z-0 inline-block w-full text-sm">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-[13px] z-10 inline-flex -translate-y-1/2 transform items-center justify-center text-muted-foreground"
              >
                <svg
                  aria-hidden="true"
                  className="size-4"
                  height="16"
                  style={{ color: "currentColor" }}
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    clipRule="evenodd"
                    d="M10.75 5.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m0 1.5a3 3 0 0 0 2.9-2.25H16V3h-2.35a3 3 0 0 0-5.8 0H0v1.5h7.85a3 3 0 0 0 2.9 2.25m4.5 6.25H16v-1.5H8.15a3 3 0 0 0-5.8 0H0V13h2.35a3 3 0 0 0 5.8 0zm-11.5-.75a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <input
                aria-label="Filter posts by topic"
                autoComplete="off"
                className="h-9 w-full appearance-none rounded-md border border-border/80 bg-background py-0 pr-4 pl-10 text-foreground text-sm transition-all duration-200 ease-in-out placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter posts by topic..."
                spellCheck="false"
                type="search"
                value={query}
              />
            </div>
          </div>
        </div>
      </div>

      {/* List of items */}
      {displayedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-sm">
          <p>No posts found matching &quot;{query}&quot;</p>
          <button
            className="mt-2 text-foreground underline"
            onClick={() => setQuery("")}
            type="button"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <ul className="flex list-none flex-col gap-6 p-0 md:gap-5">
          {displayedPosts.map((post) => (
            <li
              className="flex flex-col flex-wrap justify-between gap-3 lg:flex-row lg:items-center"
              key={post.url}
            >
              <div className="flex items-center gap-2">
                <Link
                  className="group flex cursor-pointer items-center gap-1.5 font-normal text-[16px] text-foreground leading-[24px] transition-colors hover:text-foreground/80"
                  href={post.url}
                >
                  <span>{post.title}</span>
                  <svg
                    aria-hidden="true"
                    className="inline-block shrink-0 origin-center -translate-x-0.5 opacity-0 transition-[opacity,transform] duration-100 ease-out group-hover:translate-x-1 group-hover:opacity-100"
                    height="12"
                    style={{ color: "currentColor" }}
                    viewBox="0 0 16 16"
                    width="12"
                  >
                    <path
                      clipRule="evenodd"
                      d="M9.53 2.22 9 1.69 7.94 2.75l.53.53 3.97 3.97H1v1.5h11.44l-3.97 3.97-.53.53L9 14.31l.53-.53 5.07-5.07a1 1 0 0 0 0-1.42z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 leading-none lg:justify-end">
                {post.hashtags.map((tag) => (
                  <span
                    className="inline-flex h-6 shrink-0 items-center justify-center rounded-full bg-background px-3 py-0.5 font-medium text-[12px]/[24px] text-foreground tabular-nums ring-1 ring-border ring-inset"
                    key={tag}
                  >
                    {tag.replace(HASH_REGEX, "")}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Show more button */}
      {hasMore && (
        <div className="flex w-full justify-center pt-2">
          <button
            className="flex h-9 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-background px-5 font-medium text-[14px] text-foreground shadow-xs transition-colors hover:bg-accent"
            onClick={() => setExpanded((prev) => !prev)}
            type="button"
          >
            <span className="inline-block truncate px-1.5">
              {expanded ? "Show less" : "Show more"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
