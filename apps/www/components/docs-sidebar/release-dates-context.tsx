"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { isPageNew } from "@/lib/docs-page-new";

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
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setIsNew(isPageNew(url, releaseDatesByUrl));
  }, [url, releaseDatesByUrl]);

  return isNew;
}

export function useCheckDocsPageNew(): (url?: string) => boolean {
  const releaseDatesByUrl = useContext(DocsReleaseDatesContext);
  const [check, setCheck] = useState<(url?: string) => boolean>(
    () => () => false
  );

  useEffect(() => {
    setCheck(() => (url?: string) => isPageNew(url, releaseDatesByUrl));
  }, [releaseDatesByUrl]);

  return check;
}
