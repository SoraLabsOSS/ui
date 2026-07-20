"use client";

import { TextCursorLoop } from "@/registry/primitives/texts/text-cursor-loop";

// Same hero line as the anime.js reference this primitive reimplements —
// "A fast and flexible JavaScript library to animate [the web]." — the
// cursor flashes the anime.js red only while collapsing/revealing, driven
// by the `data-phase` attribute the primitive exposes for exactly this.
const WORDS = [
  "the web",
  "HTML",
  "WebGL",
  "CSS",
  "Canvas 2D",
  "SVG",
  "anything",
];

export default function TextCursorLoopExample() {
  return (
    <p className="m-0 max-w-md text-balance text-lg leading-snug">
      A fast and flexible JavaScript library to animate{" "}
      <TextCursorLoop
        className="font-medium"
        classNames={{
          cursor: "data-[phase=collapsing]:text-[#ff4b4b]",
        }}
        words={WORDS}
      />
    </p>
  );
}
