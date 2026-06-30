"use client";

import { cn } from "@workspace/ui/lib/utils";
import { type ReactNode, useEffect, useState } from "react";
import { HOME_PAGE_SCROLL_SELECTOR } from "@/lib/catalog/resolve-scroll-root";
import { HOME_SCROLL_READY_EVENT } from "@/lib/home/home-scroll-ready";
import { TextRevealBlock } from "@/registry/primitives/texts/text-reveal-block";

const homeSectionHeadingClassName =
  "font-medium text-3xl leading-tight tracking-tight md:text-4xl lg:text-5xl";

interface HomeSectionHeadingProps {
  children: ReactNode;
  className?: string;
}

export function HomeSectionHeading({
  children,
  className,
}: HomeSectionHeadingProps) {
  const [scroller, setScroller] = useState<Element | Window>(window);

  useEffect(() => {
    const homeScroller = document.querySelector(HOME_PAGE_SCROLL_SELECTOR);
    if (homeScroller instanceof HTMLElement) {
      setScroller(homeScroller);
    }
  }, []);

  return (
    <TextRevealBlock
      animateOnScroll
      blockColor="var(--accent-pro)"
      direction="left"
      duration={0.65}
      scroller={scroller}
      scrollReadyEvent={HOME_SCROLL_READY_EVENT}
      stagger={0.12}
    >
      <h2 className={cn(homeSectionHeadingClassName, className)}>{children}</h2>
    </TextRevealBlock>
  );
}
