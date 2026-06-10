"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

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
  return (
    <div className="flex h-[calc(100dvh-var(--fd-banner-height))] flex-col bg-background text-foreground">
      <main
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden",
          className
        )}
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
