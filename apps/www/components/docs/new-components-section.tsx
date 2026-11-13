"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PrimitivesIndexNewDot } from "@/components/docs/primitives-index-new-dot";
import { isRecentlyReleased } from "@/lib/docs/is-recently-released";

export interface NewComponentEntry {
  releaseDate?: string;
  title: string;
  url: string;
}

export function NewComponentsSection({
  pages,
}: {
  pages: NewComponentEntry[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const newPages = pages.filter((page) => isRecentlyReleased(page.releaseDate));

  if (newPages.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>New Components</h2>
      <div className="not-prose grid grid-cols-2 gap-2 sm:grid-cols-3">
        {newPages.map((page) => (
          <Link
            className="relative flex items-center justify-center rounded-lg border bg-accent/40 px-3 py-2.5 text-center font-medium text-foreground text-sm no-underline transition-colors duration-200 hover:bg-accent"
            href={page.url}
            key={page.url}
          >
            {page.title}
            <PrimitivesIndexNewDot releaseDate={page.releaseDate} />
          </Link>
        ))}
      </div>
    </section>
  );
}
