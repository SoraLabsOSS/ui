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
            className="bg-accent/40 text-foreground hover:bg-accent relative flex items-center justify-center rounded-lg border px-3 py-2.5 text-center text-sm font-medium no-underline transition-colors duration-200"
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
