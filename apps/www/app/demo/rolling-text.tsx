"use client";

import { motion } from "motion/react";

interface RollingTextProps {
  className?: string;
  duration?: number;
  speed?: number;
  text?: string;
}

const Skiper27 = () => (
  <section className="h-screen snap-y snap-mandatory overflow-y-scroll">
    <div className="flex h-full w-full snap-start flex-col items-center justify-center">
      <RollingText duration={4} speed={0.05} text="MOTION FIRST" />
      <RollingText duration={4} speed={0.05} text="FOR REACT" />
    </div>
  </section>
);

export { Skiper27 };

const NBSP = " ";

function RollingText({
  text = "ROLLING",
  speed = 0.1,
  className = "text-5xl font-bold sm:text-7xl lg:text-8xl",
  duration = 4,
}: RollingTextProps) {
  const centerIndex = Math.floor(text.length / 2);

  return (
    <motion.div className={`flex ${className}`}>
      {text.split("").map((letter, index) => {
        const glyph = letter === " " ? NBSP : letter;
        const distanceFromCenter = Math.abs(index - centerIndex);
        const delay = distanceFromCenter * speed;
        const rollDuration = 0.2 + distanceFromCenter * 0.15;
        const numberOfRolls = Math.floor(duration / rollDuration);
        const totalMovement = numberOfRolls * 1.2;

        return (
          <div
            className="relative inline-block overflow-hidden"
            key={`${letter}-${index}`}
            style={{ height: "1em" }}
          >
            <motion.h1
              className="flex flex-col"
              transition={{
                duration,
                ease: [0.15, 1, 0.1, 1],
                delay,
              }}
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
            </motion.h1>
          </div>
        );
      })}
    </motion.div>
  );
}
