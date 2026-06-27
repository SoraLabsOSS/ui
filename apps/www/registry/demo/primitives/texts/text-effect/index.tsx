"use client";

import {
  TextEffect,
  type TextEffectPer,
  type TextEffectPreset,
} from "@/registry/primitives/texts/text-effect";

interface TextEffectDemoProps {
  children?: string;
  className?: string;
  delay?: number;
  per?: TextEffectPer;
  preset?: TextEffectPreset;
  scrollTrigger?: boolean;
  speedReveal?: number;
  speedSegment?: number;
}

/** Docs preview — scroll-triggered preset text reveal. */
export default function TextEffectDemo({
  children = "Motion-first text effects",
  className = "text-center font-bold text-3xl",
  delay = 0,
  per = "word",
  preset = "fade-in-blur",
  scrollTrigger = true,
  speedReveal = 1,
  speedSegment = 1,
}: TextEffectDemoProps) {
  return (
    <div className="flex min-h-[140px] items-center justify-center px-4">
      <TextEffect
        as="h2"
        className={className}
        delay={delay}
        per={per}
        preset={preset}
        scrollTrigger={scrollTrigger}
        speedReveal={speedReveal}
        speedSegment={speedSegment}
      >
        {children}
      </TextEffect>
    </div>
  );
}
