"use client";

import { TextShimmer } from "@workspace/ui/components/ui/text-shimmer";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { SectionCtaScramble } from "@/components/buttons/section-cta-scramble";
import { HeroSlotLine } from "@/components/home/hero-slot-text";

const CLI_COMMAND = "npx shadcn@latest add @soralabs";

export const Hero = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="flex flex-col items-center text-center">
      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="my-4 font-mono text-muted-foreground text-sm tracking-widest md:text-base"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        SORA UI
      </motion.p>

      <div className="flex flex-col items-center">
        <HeroSlotLine text="MOTION-FIRST" />
        <HeroSlotLine text="FOR REACT" />
      </div>

      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="my-4 font-mono text-muted-foreground text-sm tracking-widest md:text-base"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
      >
        FOR SHADCN/UI
      </motion.p>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row lg:mt-16"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        transition={{ delay: 0.25, duration: 0.55, ease: "easeOut" }}
      >
        <Link
          className="inline-flex h-8 items-center bg-muted px-3 font-mono text-sm lg:h-10 lg:px-3"
          href="/docs/installation"
        >
          {prefersReducedMotion ? (
            CLI_COMMAND
          ) : (
            <TextShimmer as="span" duration={3}>
              {CLI_COMMAND}
            </TextShimmer>
          )}
        </Link>

        <SectionCtaScramble href="/docs/installation" label="Quick start" />
      </motion.div>
    </header>
  );
};
