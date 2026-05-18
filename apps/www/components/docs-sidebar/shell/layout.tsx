'use client';

import type * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import {
  ScrollArea,
  ScrollViewport,
} from 'fumadocs-ui/components/ui/scroll-area';
import { cn } from '@workspace/ui/lib/utils';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';
import { DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR } from './scroll-active-nearest';
import {
  DocsShellEffectsProvider,
  DocsShellHoverHighlight,
  DocsShellHoverProvider,
  useDocsShellHover,
} from './context';

export function DocsShellContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useDocsShellHover().containerRef;

  return (
    <ScrollArea
      type="scroll"
      className={cn('min-h-0 flex-1', className)}
    >
      <ScrollViewport
        {...{ [DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR]: '' }}
        className="p-4"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, white 12px, white calc(100% - 12px), transparent)',
        }}
      >
        <div ref={containerRef} className="relative px-1">
          <DocsShellHoverHighlight />
          {children}
        </div>
      </ScrollViewport>
    </ScrollArea>
  );
}

export interface DocsShellProps {
  children: React.ReactNode;
  className?: string;
  defaultEffectsEnabled?: boolean;
  /** Initial width in px. Default: 240 */
  defaultWidth?: number;
  /** Min resize width in px. Default: 160 */
  minWidth?: number;
  /** Max resize width in px. Default: 400 */
  maxWidth?: number;
}

export function DocsShell({
  children,
  className,
  defaultEffectsEnabled = true,
  defaultWidth = 240,
  minWidth = 160,
  maxWidth = 400,
}: DocsShellProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(defaultWidth);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = width;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [width],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const next = Math.min(
        maxWidth,
        Math.max(minWidth, startW.current + e.clientX - startX.current),
      );
      setWidth(next);
    },
    [minWidth, maxWidth],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <DocsShellEffectsProvider defaultEnabled={defaultEffectsEnabled}>
      <DocsShellHoverProvider containerRef={containerRef}>
        <aside
          className={cn(
            'relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background',
            className,
          )}
          style={isMobile ? undefined : { width }}
        >
          {children}

          <div
            className="absolute top-0 right-0 z-50 hidden h-full w-1 cursor-col-resize group/handle md:block"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <div className="absolute top-0 right-0 h-full w-px bg-border/50 transition-colors duration-150 group-hover/handle:bg-border" />
          </div>
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
    <div className={cn('shrink-0 px-3 pt-4 pb-2', className)}>{children}</div>
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
    <div
      className={cn(
        'shrink-0 border-t border-border/50 px-3 pt-2 pb-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
