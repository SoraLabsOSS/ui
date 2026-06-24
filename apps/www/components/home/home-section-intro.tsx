"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";
import { MaskedTextReveal } from "@/registry/primitives/texts/text-reveal-mask";

const homeSectionIntroClassName =
  "text-base text-muted-foreground leading-relaxed";

interface HomeSectionIntroProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function HomeSectionIntro({
  children,
  className,
  delay = 0.1,
}: HomeSectionIntroProps) {
  return (
    <MaskedTextReveal
      as="p"
      className={cn(homeSectionIntroClassName, className)}
      delay={delay}
      splitBy="lines"
      stagger={0.08}
      viewportMargin="0px 0px -20% 0px"
    >
      {children}
    </MaskedTextReveal>
  );
}
