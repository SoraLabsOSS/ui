"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { SectionCtaScramble } from "@/components/buttons/section-cta-scramble";
import { MotionEffect } from "@/components/effects/motion-effect";
import { HomeShell } from "@/components/home/home-shell";
import {
  BORDER_TRAIL_DEFAULT_GLOW,
  BorderTrail,
} from "@/registry/primitives/effects/border-trail";
import {
  GITHUB_SPONSORS_URL,
  getSupportMailtoUrl,
  PRICING_DISCLAIMER,
  PRICING_FREE_FEATURES,
  PRICING_SUPPORT_FEATURES,
} from "./pricing-config";

interface PricingFeatureListProps {
  items: readonly string[];
}

function PricingFeatureList({ items }: PricingFeatureListProps) {
  return (
    <ul className="mt-8 space-y-3">
      {items.map((feature) => (
        <li className="flex items-start gap-2.5" key={feature}>
          <Check
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-accent-pro"
            strokeWidth={2.5}
          />
          <span className="text-base text-muted-foreground leading-relaxed">
            {feature}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface PricingCardProps {
  borderTrail?: boolean;
  children: ReactNode;
  className?: string;
  delay?: number;
}

function PricingCard({
  borderTrail = false,
  children,
  className,
  delay = 0,
}: PricingCardProps) {
  return (
    <MotionEffect
      className={cn(
        "relative flex flex-1 flex-col overflow-hidden rounded-xl border border-foreground/10 bg-muted/40 p-6 text-foreground md:p-8",
        className
      )}
      delay={delay}
      fade
      inView
    >
      {borderTrail ? (
        <>
          <BorderTrail
            radius={12}
            size={100}
            style={BORDER_TRAIL_DEFAULT_GLOW}
            transition={{
              duration: 10,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
          <div className="relative z-1 flex flex-1 flex-col">{children}</div>
        </>
      ) : (
        children
      )}
    </MotionEffect>
  );
}

export function PricingCards() {
  const supportMailtoUrl = getSupportMailtoUrl();

  return (
    <section className="pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32" id="plans">
      <HomeShell>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-medium text-2xl tracking-tight md:text-3xl">
            One price. Forever free.
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base">
            No subscription. Optional support if Sora UI helps your work.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-stretch">
          <PricingCard borderTrail>
            <div className="flex flex-1 flex-col">
              <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
                Free
              </p>
              <p className="mt-3 font-medium text-4xl tracking-tight">
                $0
                <span className="text-lg text-muted-foreground">
                  {" "}
                  / forever
                </span>
              </p>
              <PricingFeatureList items={PRICING_FREE_FEATURES} />
            </div>
            <div className="mt-10">
              <SectionCtaScramble
                href="/docs/installation"
                label="Start installing"
                variant="accent"
              />
            </div>
          </PricingCard>

          <PricingCard delay={0.08}>
            <div className="flex flex-1 flex-col">
              <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
                Support Sora UI
              </p>
              <p className="mt-3 font-medium text-4xl tracking-tight">
                Optional
              </p>
              <p className="mt-4 max-w-sm text-muted-foreground text-sm leading-relaxed">
                Help keep the project alive, maintained, and free for everyone.
              </p>
              <PricingFeatureList items={PRICING_SUPPORT_FEATURES} />
            </div>
            <div className="mt-10 flex flex-col gap-3">
              <SectionCtaScramble
                href={GITHUB_SPONSORS_URL}
                label="Support the project"
                rel="noopener noreferrer"
                target="_blank"
                variant="inverted"
              />
              {supportMailtoUrl ? (
                <SectionCtaScramble
                  href={supportMailtoUrl}
                  label="Request a component"
                  variant="outline"
                />
              ) : null}
            </div>
          </PricingCard>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-muted-foreground text-sm leading-relaxed">
          {PRICING_DISCLAIMER}
        </p>
      </HomeShell>
    </section>
  );
}
