"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useActiveAnchor } from "fumadocs-core/toc";
import { useTOCItems } from "fumadocs-ui/components/layout/toc";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { PageTOCPopoverItems } from "fumadocs-ui/layouts/docs/page";
import { useReducedMotion } from "motion/react";
import { type ComponentProps, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RemoveScroll } from "react-remove-scroll";
import { DOCS_TOC_HEADER_SLOT_ID } from "@/components/docs/docs-toc-header-slot";

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

function HeaderTocPopover() {
  const items = useTOCItems();
  const active = useActiveAnchor();
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectedIndex = items.findIndex((item) => active === item.url.slice(1));
  const progress =
    selectedIndex < 0 ? 0 : (selectedIndex + 1) / Math.max(1, items.length);
  const activeHref = selectedIndex < 0 ? null : items[selectedIndex]?.url;

  useLayoutEffect(() => {
    if (!(open && activeHref)) {
      return;
    }

    const scrollToActive = () => {
      const scroller = contentRef.current?.querySelector<HTMLElement>(
        "[data-docs-toc-scroller]"
      );
      if (!scroller) {
        return;
      }

      const target = [...scroller.querySelectorAll("a")].find(
        (node) => node.getAttribute("href") === activeHref
      );
      if (target) {
        scrollChildIntoView(scroller, target);
      }
    };

    scrollToActive();
    const frame = requestAnimationFrame(scrollToActive);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [activeHref, open]);

  if (items.length === 0) {
    return null;
  }

  return (
    <Popover modal onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        aria-label="On this page"
        className={cn(
          buttonVariants({
            color: "ghost",
            size: "icon-sm",
            className:
              "relative z-10 size-6! shrink-0 p-0! text-fd-muted-foreground [&_svg]:size-5!",
          }),
          open && "text-fd-foreground"
        )}
      >
        <TocProgressRing progress={progress} />
      </PopoverTrigger>
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
    </Popover>
  );
}

/** Progress-ring TOC trigger, portaled into the docs header slot. */
export function DocsHeaderToc() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setSlot(document.getElementById(DOCS_TOC_HEADER_SLOT_ID));
  }, []);

  if (!slot) {
    return null;
  }

  return createPortal(<HeaderTocPopover />, slot);
}
