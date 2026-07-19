"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

const NBSP = " ";

const HERO_LINE_CLASS =
  "flex font-bold font-hero-display text-5xl uppercase tracking-tight max-[375px]:text-4xl sm:text-6xl md:text-7xl lg:text-8xl";

interface HeroRollingTextProps {
  className?: string;
  /** Direction letters roll in when they enter the viewport. @default "up" */
  direction?: "down" | "up";
  duration?: number;
  speed?: number;
  text: string;
}

export function HeroRollingText({
  text,
  speed = 0.05,
  duration = 4,
  direction = "up",
  className,
}: HeroRollingTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });
  const prefersReducedMotion = useReducedMotion();
  const centerIndex = Math.floor(text.length / 2);

  if (prefersReducedMotion) {
    return <span className={cn(HERO_LINE_CLASS, className)}>{text}</span>;
  }

  return (
    <motion.span
      aria-label={text}
      className={cn(HERO_LINE_CLASS, className)}
      ref={containerRef}
    >
      {text.split("").map((letter, index) => {
        const glyph = letter === " " ? NBSP : letter;
        const distanceFromCenter = Math.abs(index - centerIndex);
        const delay = distanceFromCenter * speed;
        const rollDuration = 0.2 + distanceFromCenter * 0.15;
        const numberOfRolls = Math.floor(duration / rollDuration);
        const totalMovement = numberOfRolls * 1.2;
        const restY = direction === "down" ? `-${totalMovement}em` : "0em";
        const settledY = direction === "down" ? "0em" : `-${totalMovement}em`;

        return (
          <span
            aria-hidden="true"
            className="relative inline-block overflow-hidden"
            key={`${letter}-${index}`}
            style={{ height: "1em" }}
          >
            <motion.span
              animate={isInView ? { y: settledY } : undefined}
              className="flex flex-col"
              initial={{ y: restY }}
              transition={{
                duration,
                ease: [0.15, 1, 0.1, 1],
                delay,
              }}
            >
              {new Array(numberOfRolls + 2).fill(null).map((_, copyIndex) => (
                <span
                  className="flex shrink-0 items-center justify-center"
                  key={`${letter}-${copyIndex}`}
                  style={{ height: "1.2em" }}
                >
                  {glyph}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </motion.span>
  );
}
