"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { blocksDocsHeaderMobileScrollPaddingClassName } from "./blocks-preview-classes";

interface ComponentsShellProps {
  children: ReactNode;
  className?: string;
  topBar?: ReactNode;
}

export function ComponentsShell({
  children,
  className,
  topBar,
}: ComponentsShellProps) {
  useEffect(() => {
    document.documentElement.classList.add("blocks-scroll-lock");

    return () => {
      document.documentElement.classList.remove("blocks-scroll-lock");
    };
  }, []);

  return (
    <div className="bg-background text-foreground flex h-[calc(100dvh-var(--fd-banner-height))] flex-col">
      <main
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden",
          // Scroll on the shell below lg; hide the OS bar so horizontal padding stays even.
          "max-lg:[scrollbar-width:none] max-lg:overflow-x-clip max-lg:overflow-y-auto max-lg:[&::-webkit-scrollbar]:hidden",
          blocksDocsHeaderMobileScrollPaddingClassName,
          className
        )}
        data-blocks-scroll-root
      >
        {topBar ? (
          <div className="absolute inset-x-0 top-0 z-40 flex items-center gap-3 px-4 pt-4 sm:px-6 md:px-8">
            {topBar}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
