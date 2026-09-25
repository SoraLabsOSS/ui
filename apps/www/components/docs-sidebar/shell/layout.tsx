"use client";

import {
  ScrollArea,
  ScrollViewport,
} from "@workspace/ui/components/ui/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import { LayoutGroup } from "motion/react";
import type * as React from "react";
import { useRef } from "react";
import {
  DocsShellEffectsProvider,
  DocsShellHoverHighlight,
  DocsShellHoverProvider,
  useDocsShellHover,
} from "./context";
import { DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR } from "./scroll-active-nearest";

export function DocsShellContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useDocsShellHover().containerRef;

  return (
    <ScrollArea className={cn("min-h-0 flex-1", className)} type="scroll">
      <ScrollViewport
        {...{ [DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR]: "" }}
        className="p-4"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, white 12px, white calc(100% - 12px), transparent)",
        }}
      >
        <div className="relative px-1" ref={containerRef}>
          <DocsShellHoverHighlight />
          <LayoutGroup id="docs-shell-nav">{children}</LayoutGroup>
        </div>
      </ScrollViewport>
    </ScrollArea>
  );
}

export interface DocsShellProps {
  children: React.ReactNode;
  className?: string;
  defaultEffectsEnabled?: boolean;
}

export function DocsShell({
  children,
  className,
  defaultEffectsEnabled = true,
}: DocsShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <DocsShellEffectsProvider defaultEnabled={defaultEffectsEnabled}>
      <DocsShellHoverProvider containerRef={containerRef}>
        <aside
          className={cn(
            "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background",
            className
          )}
        >
          {children}
        </aside>
      </DocsShellHoverProvider>
    </DocsShellEffectsProvider>
  );
}

export function DocsShellHeader({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("shrink-0 px-3 pt-4 pb-2", className)}>{children}</div>
  );
}

export function DocsShellFooter({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("shrink-0 px-3 pt-2 pb-4", className)}>{children}</div>
  );
}
