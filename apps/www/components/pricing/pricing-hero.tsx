"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionCtaScramble } from "@/components/buttons/section-cta-scramble";
import { HomeShell } from "@/components/home/home-shell";
import { IconLogo } from "@/components/icon-logo";
import { TextEffect } from "@/registry/primitives/texts/text-effect";
import { PRICING_CORE_MESSAGE, PRICING_HERO } from "./pricing-config";

export function PricingHero() {
  return (
    <section className="relative min-h-[calc(100dvh-var(--fd-banner-height))] overflow-hidden pt-28 pb-20 md:pt-32 md:pb-28 lg:pt-36 lg:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(50%_89%_at_50%_100%,rgba(255,255,255,0.13),rgba(171,171,171,0))] dark:bg-[radial-gradient(50%_89%_at_50%_100%,rgba(255,255,255,0.06),rgba(0,0,0,0))]"
      />

      <HomeShell className="relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <IconLogo
            aria-hidden
            className="mb-8 size-14 text-foreground opacity-60 md:size-16"
            size="sm"
          />

          <p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-widest">
            {PRICING_HERO.eyebrow}
          </p>

          <TextEffect
            as="h1"
            className="max-w-2xl font-medium text-3xl leading-tight tracking-tight md:text-5xl md:leading-tight"
            containerTransition={{ staggerChildren: 0.04 }}
            delay={0.05}
            per="word"
            preset="blur"
            scrollTrigger
            segmentTransition={{ duration: 0.5 }}
          >
            {PRICING_HERO.title}
          </TextEffect>

          <TextEffect
            as="p"
            className="mt-4 block max-w-xl text-balance text-base text-muted-foreground leading-relaxed md:text-lg"
            containerTransition={{ staggerChildren: 0.02 }}
            delay={0.2}
            per="word"
            preset="blur"
            scrollTrigger
            segmentTransition={{ duration: 0.5 }}
          >
            {PRICING_HERO.description}
          </TextEffect>

          <p className="mt-6 max-w-lg text-balance text-foreground/80 text-sm leading-relaxed md:text-base">
            {PRICING_CORE_MESSAGE}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <SectionCtaScramble
              href="/docs/installation"
              label="Use Sora UI"
              variant="accent"
            />
            <Link
              className="group inline-flex items-center gap-1 font-medium text-muted-foreground text-sm transition-opacity hover:opacity-70"
              href="/catalog"
            >
              Browse catalog
              <ArrowRight
                aria-hidden
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </HomeShell>
    </section>
  );
}
