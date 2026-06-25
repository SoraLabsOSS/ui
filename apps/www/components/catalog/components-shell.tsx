"use client";

import { cn } from "@workspace/ui/lib/utils";
import { type ReactNode, useEffect } from "react";
import { catalogDocsHeaderMobileScrollPaddingClassName } from "./catalog-preview-classes";

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
    document.documentElement.classList.add("catalog-scroll-lock");

    return () => {
      document.documentElement.classList.remove("catalog-scroll-lock");
    };
  }, []);

  return (
    <div className="flex h-[calc(100dvh-var(--fd-banner-height))] flex-col bg-background text-foreground">
      <main
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden",
          // Scroll on the shell below lg; hide the OS bar so horizontal padding stays even.
          "max-lg:overflow-y-auto max-lg:overflow-x-hidden max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden",
          catalogDocsHeaderMobileScrollPaddingClassName,
          className
        )}
        data-catalog-scroll-root
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
