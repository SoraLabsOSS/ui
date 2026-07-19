"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, useReducedMotion } from "motion/react";

const NBSP = " ";

const HERO_LINE_CLASS =
  "flex font-bold font-hero-display text-5xl uppercase tracking-tight max-[375px]:text-4xl sm:text-6xl md:text-7xl lg:text-8xl";

interface HeroRollingTextProps {
  className?: string;
  duration?: number;
  speed?: number;
  text: string;
}

export function HeroRollingText({
  text,
  speed = 0.05,
  duration = 4,
  className,
}: HeroRollingTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const centerIndex = Math.floor(text.length / 2);

  if (prefersReducedMotion) {
    return <span className={cn(HERO_LINE_CLASS, className)}>{text}</span>;
  }

  return (
    <motion.span className={cn(HERO_LINE_CLASS, className)}>
      {text.split("").map((letter, index) => {
        const glyph = letter === " " ? NBSP : letter;
        const distanceFromCenter = Math.abs(index - centerIndex);
        const delay = distanceFromCenter * speed;
        const rollDuration = 0.2 + distanceFromCenter * 0.15;
        const numberOfRolls = Math.floor(duration / rollDuration);
        const totalMovement = numberOfRolls * 1.2;

        return (
          <span
            className="relative inline-block overflow-hidden"
            key={`${letter}-${index}`}
            style={{ height: "1em" }}
          >
            <motion.span
              className="flex flex-col"
              transition={{
                duration,
                ease: [0.15, 1, 0.1, 1],
                delay,
              }}
              viewport={{ once: true }}
              whileInView={{
                y: `-${totalMovement}em`,
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
