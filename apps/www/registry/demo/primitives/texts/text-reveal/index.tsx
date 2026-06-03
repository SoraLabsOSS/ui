"use client";

import { TextReveal } from "@/registry/primitives/texts/text-reveal";

export default function TextRevealExample() {
  return (
    <TextReveal
      as="h2"
      blur={4}
      className="text-center font-bold text-3xl"
      delay={0.5}
      splitBy="words"
      staggerDelay={0.05}
      text="Blur Text Animation"
    />
  );
}
