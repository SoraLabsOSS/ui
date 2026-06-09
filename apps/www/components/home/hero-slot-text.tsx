/** biome-ignore-all lint/suspicious/noArrayIndexKey: Slot strip positions are stable per character index. */

"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

const LINE_HEIGHT_EM = 1.2;
const SLOT_EASE = [0.625, 0.05, 0, 1] as const;

function getSlotCount(charIndex: number) {
  return charIndex + 6;
}

function HeroSlotChar({
  char,
  charIndex,
  play,
}: {
  char: string;
  charIndex: number;
  play: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const count = getSlotCount(charIndex);
  const targetY = -(count - 1) * LINE_HEIGHT_EM;

  if (char === " ") {
    return <span aria-hidden className="inline-block w-[0.35em]" />;
  }

  const shouldAnimate = play && !prefersReducedMotion;
  const y = play || prefersReducedMotion ? `${targetY}em` : 0;

  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-bottom">
      <motion.span
        animate={{ y }}
        className="flex flex-col"
        initial={{ y: 0 }}
        transition={{
          duration: shouldAnimate ? 0.65 + charIndex * 0.04 : 0,
          ease: SLOT_EASE,
          delay: shouldAnimate ? charIndex * 0.03 : 0,
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <span
            className="flex h-[1.2em] shrink-0 items-center justify-center"
            key={`${char}-${index}`}
          >
            {char}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function HeroSlotLine({
  className,
  text,
}: {
  className?: string;
  text: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div
      className={cn(
        "flex font-bold font-hero-display text-4xl uppercase tracking-tight sm:text-6xl md:text-7xl lg:text-8xl",
        className
      )}
      ref={ref}
    >
      {text.split("").map((char, index) => (
        <HeroSlotChar
          char={char}
          charIndex={index}
          key={`${text}-${index}`}
          play={isInView}
        />
      ))}
    </div>
  );
}
