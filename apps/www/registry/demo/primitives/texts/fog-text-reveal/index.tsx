"use client";

import {
  FogTextReveal,
  type FogTextRevealProps,
} from "@/registry/primitives/texts/fog-text-reveal";

export default function FogTextRevealExample({
  loop = true,
  startOnView = true,
  holdDuration = 320,
  maxBlur = 16,
}: Partial<FogTextRevealProps>) {
  return (
    <div className="flex w-full items-center justify-center px-6 py-16">
      <p className="max-w-xl text-left font-serif text-4xl leading-tight tracking-tight">
        Type can move like{" "}
        <FogTextReveal
          holdDuration={holdDuration}
          loop={loop}
          maxBlur={maxBlur}
          startOnView={startOnView}
          text={["weather.", "fog.", "breath."]}
        />
      </p>
    </div>
  );
}
