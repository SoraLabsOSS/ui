"use client";

import { DiaTextReveal } from "@/registry/primitives/texts/dia-text-reveal";

export default function DiaTextRevealExample() {
  return (
    <p className="font-light text-4xl tracking-tight">
      Make interfaces feel{" "}
      <DiaTextReveal
        fixedWidth
        repeat
        repeatDelay={0.5}
        text={["smooth.", "focused.", "refined."]}
      />
    </p>
  );
}
