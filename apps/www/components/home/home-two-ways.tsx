"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";
import { SectionCtaScramble } from "@/components/buttons/section-cta-scramble";
import { MotionEffect } from "@/components/effects/motion-effect";
import { HomeShell } from "@/components/home/home-shell";

const PRIMITIVE_COUNT = 13;

interface ProductCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function ProductCard({ children, className, delay = 0 }: ProductCardProps) {
  return (
    <MotionEffect
      className={cn(
        "col-span-12 flex flex-col overflow-hidden bg-muted/40 text-foreground",
        className
      )}
      delay={delay}
      fade
      inView
      slide={{ direction: "up", offset: 24 }}
    >
      {children}
    </MotionEffect>
  );
}

export function HomeTwoWays({ primitivesUrl }: { primitivesUrl: string }) {
  return (
    <section className="relative bg-background py-24 text-foreground lg:py-32">
      <HomeShell>
        <header className="mb-16 max-w-[60ch] lg:mb-24">
          <MotionEffect fade inView slide={{ direction: "up", offset: 32 }}>
            <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
              What you get
            </p>
            <h2 className="mt-3 max-w-[18ch] font-medium text-3xl leading-tight tracking-tight md:text-4xl lg:text-5xl">
              Two ways to ship motion.
            </h2>
            <p className="mt-6 max-w-[52ch] text-base text-muted-foreground leading-relaxed lg:text-lg">
              Named primitives you reach for in every project. Full blocks you
              compose once they land—same Motion + GSAP stack, same install
              flow.
            </p>
          </MotionEffect>
        </header>

        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          <ProductCard className="lg:col-span-7">
            <div className="flex flex-1 flex-col gap-5 p-6 lg:gap-6 lg:p-12">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h3 className="m-0 font-medium text-foreground text-xl lg:text-2xl">
                  Primitives
                </h3>
                <span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
                  {PRIMITIVE_COUNT} primitives / growing
                </span>
              </div>
              <p className="m-0 max-w-[52ch] text-base text-muted-foreground leading-relaxed">
                Motion and GSAP primitives are production-grade and documented.
                Preview in the docs, install with the shadcn CLI, and own the
                source in your codebase.
              </p>
              <div className="mt-auto inline-flex pt-2">
                <SectionCtaScramble
                  href={primitivesUrl}
                  label="Browse primitives"
                  variant="accent"
                />
              </div>
            </div>
          </ProductCard>

          <ProductCard className="lg:col-span-5" delay={0.1}>
            <div className="flex flex-1 flex-col gap-5 p-6 lg:gap-6 lg:p-12">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h3 className="m-0 font-medium text-foreground text-xl lg:text-2xl">
                  Blocks
                </h3>
                <span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
                  First block / coming soon
                </span>
              </div>
              <p className="m-0 max-w-[52ch] text-base text-muted-foreground leading-relaxed">
                Composed page sections—not a single primitive, not a grab bag.
                Hero flows, feature grids, and motion systems you drop in and
                customize. Built for React and Next.js.
              </p>
              <div className="mt-auto inline-flex pt-2">
                <SectionCtaScramble
                  href="/docs"
                  label="See what's coming"
                  variant="inverted"
                />
              </div>
            </div>
          </ProductCard>
        </div>
      </HomeShell>
    </section>
  );
}
