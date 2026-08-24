"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useActiveAnchor } from "fumadocs-core/toc";
import { TOCProvider, useTOCItems } from "fumadocs-ui/components/layout/toc";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { PageTOCPopoverItems } from "fumadocs-ui/layouts/docs/page";
import { useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { type ComponentProps, useLayoutEffect, useRef, useState } from "react";
import { RemoveScroll } from "react-remove-scroll";
import {
  type HeaderTocItem,
  useHeaderTocItems,
  usePublishHeaderToc,
} from "@/components/docs/docs-toc-header-slot";

const RING_SIZE = 20;
const RING_STROKE = 1.75;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function clamp(value: number, min: number, max: number) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function TocProgressRing({
  progress,
  className,
  ...props
}: ComponentProps<"svg"> & {
  /** 0–1 fill amount of the ring. */
  progress: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const normalized = clamp(progress, 0, 1);
  const offset = RING_CIRCUMFERENCE * (1 - normalized);
  const circleProps = {
    cx: RING_SIZE / 2,
    cy: RING_SIZE / 2,
    fill: "none" as const,
    r: RING_RADIUS,
    strokeWidth: RING_STROKE,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      {...props}
    >
      <circle {...circleProps} className="stroke-current/25" />
      <circle
        {...circleProps}
        className={
          prefersReducedMotion
            ? undefined
            : "transition-[stroke-dashoffset] duration-200"
        }
        stroke="currentColor"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
      />
    </svg>
  );
}

function scrollChildIntoView(scroller: HTMLElement, target: HTMLElement) {
  const scrollerRect = scroller.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (targetRect.top < scrollerRect.top) {
    scroller.scrollTop -= scrollerRect.top - targetRect.top;
    return;
  }
  if (targetRect.bottom > scrollerRect.bottom) {
    scroller.scrollTop += targetRect.bottom - scrollerRect.bottom;
  }
}

function findActiveHeadingId(tocItems: HeaderTocItem[]): string | undefined {
  if (tocItems.length === 0 || typeof document === "undefined") {
    return;
  }

  const scrollElement = document.scrollingElement || document.documentElement;
  const scrollTop = scrollElement.scrollTop;

  const headings: { id: string; element: HTMLElement }[] = [];
  for (const item of tocItems) {
    const id = item.url.slice(1);
    if (!id) {
      continue;
    }
    const el = document.getElementById(id);
    if (el) {
      headings.push({ id, element: el });
    }
  }

  if (headings.length === 0) {
    return;
  }

  if (scrollTop <= 10) {
    return headings[0]?.id;
  }

  if (
    scrollTop + scrollElement.clientHeight >=
    scrollElement.scrollHeight - 10
  ) {
    return headings.at(-1)?.id;
  }

  const threshold = 120;
  let activeId = headings[0]?.id;

  for (const { id, element } of headings) {
    const rect = element.getBoundingClientRect();
    if (rect.top <= threshold) {
      activeId = id;
    } else {
      break;
    }
  }

  return activeId;
}

function syncActiveTocLink(
  scroller: HTMLElement,
  activeHref: string,
  hasActiveAnchor: boolean
) {
  const links = scroller.querySelectorAll<HTMLAnchorElement>("a");
  let target: HTMLAnchorElement | null = null;
  for (const link of links) {
    if (link.getAttribute("href") === activeHref) {
      target = link;
      link.setAttribute("data-active", "true");
    } else if (!hasActiveAnchor) {
      link.removeAttribute("data-active");
    }
  }
  if (target) {
    scrollChildIntoView(scroller, target);
  }
}

function HeaderTocPopover() {
  const items = useTOCItems();
  const active = useActiveAnchor();
  const pathname = usePathname();
  const [fallbackActiveId, setFallbackActiveId] = useState<string | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState(pathname);
  const contentRef = useRef<HTMLDivElement>(null);

  const enabled = items.length > 0;

  if (pathname !== openPathname) {
    setOpenPathname(pathname);
    setOpen(false);
  }

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    const updateActive = () => {
      setFallbackActiveId(findActiveHeadingId(items));
    };

    updateActive();
    const frame = requestAnimationFrame(updateActive);
    const timer = setTimeout(updateActive, 100);

    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [enabled, items]);

  const currentActiveId =
    active && items.some((item) => active === item.url.slice(1))
      ? active
      : fallbackActiveId;

  const selectedIndex = items.findIndex(
    (item) => currentActiveId === item.url.slice(1)
  );
  const progress =
    enabled && selectedIndex >= 0
      ? (selectedIndex + 1) / Math.max(1, items.length)
      : 0;
  const activeHref =
    enabled && selectedIndex >= 0 ? items[selectedIndex]?.url : null;

  useLayoutEffect(() => {
    if (!(open && activeHref)) {
      return;
    }

    const scroller = contentRef.current?.querySelector<HTMLElement>(
      "[data-docs-toc-scroller]"
    );
    if (!scroller) {
      return;
    }

    const scroll = () => {
      syncActiveTocLink(scroller, activeHref, Boolean(active));
    };

    scroll();
    const frame = requestAnimationFrame(scroll);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [active, activeHref, open]);

  return (
    <Popover
      modal
      onOpenChange={(nextOpen) => {
        if (enabled) {
          setOpen(nextOpen);
        }
      }}
      open={enabled && open}
    >
      <PopoverTrigger
        aria-label="On this page"
        className={cn(
          buttonVariants({
            color: "ghost",
            size: "icon-sm",
            className:
              "relative z-10 size-6! shrink-0 p-0! text-fd-muted-foreground transition-opacity duration-200 motion-reduce:transition-none [&_svg]:size-5!",
          }),
          enabled ? open && "text-fd-foreground" : "cursor-default opacity-35"
        )}
        disabled={!enabled}
      >
        <TocProgressRing progress={progress} />
      </PopoverTrigger>
      {enabled ? (
        <PopoverContent
          align="end"
          className="flex max-h-[min(24rem,var(--radix-popover-content-available-height))] w-72 flex-col overflow-hidden p-1 xl:hidden"
          collisionPadding={12}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) {
              setOpen(false);
            }
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
          ref={contentRef}
          side="bottom"
          sideOffset={8}
        >
          <RemoveScroll
            allowPinchZoom
            className="flex min-h-0 min-w-0 flex-1 flex-col"
            gapMode="padding"
          >
            <PageTOCPopoverItems
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]!"
              data-docs-toc-scroller=""
              variant="clerk"
            />
          </RemoveScroll>
        </PopoverContent>
      ) : null}
    </Popover>
  );
}

/** Always-visible navbar TOC. Empty pages keep a disabled ring instead of unmounting. */
export function NavHeaderToc() {
  const items = useHeaderTocItems();

  return (
    <TOCProvider toc={items}>
      <div className="ms-2 flex shrink-0 items-center justify-center md:ms-3 xl:hidden">
        <HeaderTocPopover />
      </div>
    </TOCProvider>
  );
}

/** Publishes this page's TOC into the navbar chrome. Renders nothing itself. */
export function DocsHeaderToc() {
  const items = useTOCItems();
  usePublishHeaderToc(items);
  return null;
}
