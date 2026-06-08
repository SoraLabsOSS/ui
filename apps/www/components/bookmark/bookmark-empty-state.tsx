"use client";

import { SectionCtaScramble } from "@/components/buttons/section-cta-scramble";
import { MotionEffect } from "@/components/effects/motion-effect";

interface BookmarkEmptyStateProps {
  cta: {
    href: string;
    label: string;
    variant?: "accent" | "inverted";
  };
  description: string;
  eyebrow: string;
  title: string;
}

export function BookmarkEmptyState({
  eyebrow,
  title,
  description,
  cta,
}: BookmarkEmptyStateProps) {
  return (
    <MotionEffect
      className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center"
      fade
      inView
      slide={{ direction: "up", offset: 24 }}
    >
      <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
        {eyebrow}
      </p>
      <h3 className="mt-4 max-w-[20ch] font-medium text-2xl tracking-tight md:text-3xl">
        {title}
      </h3>
      <p className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div className="mt-10 inline-flex">
        <SectionCtaScramble
          href={cta.href}
          label={cta.label}
          variant={cta.variant ?? "accent"}
        />
      </div>
    </MotionEffect>
  );
}

export function BookmarkSearchEmptyState() {
  return (
    <MotionEffect
      className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-6 text-center"
      fade
      inView
      slide={{ direction: "up", offset: 16 }}
    >
      <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
        No results
      </p>
      <p className="max-w-sm text-base text-muted-foreground leading-relaxed">
        No bookmarks match your search. Try a different keyword.
      </p>
    </MotionEffect>
  );
}
