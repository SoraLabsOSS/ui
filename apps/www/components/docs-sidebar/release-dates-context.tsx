"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

import { isPageNew } from "@/lib/docs/is-recently-released";

const DocsReleaseDatesContext = createContext<Record<string, string>>({});

export function DocsReleaseDatesProvider({
  releaseDatesByUrl,
  children,
}: {
  releaseDatesByUrl: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <DocsReleaseDatesContext.Provider value={releaseDatesByUrl}>
      {children}
    </DocsReleaseDatesContext.Provider>
  );
}

/** Evaluates after mount so SSR and hydration markup stay in sync. */
export function useDocsPageNew(url?: string): boolean {
  const releaseDatesByUrl = useContext(DocsReleaseDatesContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? isPageNew(url, releaseDatesByUrl) : false;
}

export function useCheckDocsPageNew(): (url?: string) => boolean {
  const releaseDatesByUrl = useContext(DocsReleaseDatesContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useCallback(
    (url?: string) => (mounted ? isPageNew(url, releaseDatesByUrl) : false),
    [mounted, releaseDatesByUrl]
  );
}
