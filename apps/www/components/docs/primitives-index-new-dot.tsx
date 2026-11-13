"use client";

import { useEffect, useState } from "react";

import { isRecentlyReleased } from "@/lib/docs/is-recently-released";

/**
 * Computed after mount — isRecentlyReleased() reads Date.now(), which is not
 * allowed during server prerender under Cache Components.
 */
export function PrimitivesIndexNewDot({
  releaseDate,
}: {
  releaseDate?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isRecentlyReleased(releaseDate)) {
    return null;
  }

  return (
    <span className="border-background bg-accent-pro absolute -top-1 -right-1 size-2.5 rounded-full border" />
  );
}
