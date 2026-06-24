"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";
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
  return (
    <TextRevealBlock
      animateOnScroll
      blockColor="var(--accent-pro)"
      direction="left"
      duration={0.65}
      stagger={0.12}
    >
      <h2 className={cn(homeSectionHeadingClassName, className)}>{children}</h2>
    </TextRevealBlock>
  );
}
