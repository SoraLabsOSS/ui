"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
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
          className="inline-flex h-12 items-center rounded-2xl bg-muted px-5 font-mono text-foreground text-sm transition-transform active:scale-[0.99] lg:text-base"
          href="/docs/installation"
        >
          {CLI_COMMAND}
        </Link>

        <Link
          className="inline-flex h-12 items-center rounded-2xl bg-foreground px-5 font-medium text-background text-sm transition-transform active:scale-[0.99] lg:text-[15px]"
          href="/docs/installation"
        >
          Quick start
        </Link>
      </motion.div>
    </header>
  );
};
