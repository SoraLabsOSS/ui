"use client";

import {
  FogTextReveal,
  type FogTextRevealProps,
} from "@/registry/primitives/effects/fog-text-reveal";

const MESSAGES = [
  {
    top: ["The text fades in on its own,", "one corner at a time."],
    bottom: ["Then it clears the same way,", "and quietly starts over."],
  },
  {
    top: ["Type can move like weather,", "rolling in from an edge."],
    bottom: ["It gathers, holds for a beat,", "then rolls back out again."],
  },
  {
    top: ["Small things, done really well,", "read as calm, not loud."],
    bottom: ["Motion with a clear direction", "always feels intentional."],
  },
];

export default function FogTextRevealExample({
  loop = true,
  startOnView = true,
  holdDuration = 320,
  maxBlur = 16,
  backgroundColor = "#fdfdfb",
  textColor = "#242320",
  edgeColor = "#f2f1ec",
}: Partial<FogTextRevealProps>) {
  return (
    <div className="w-full max-w-3xl">
      <FogTextReveal
        backgroundColor={backgroundColor}
        edgeColor={edgeColor}
        holdDuration={holdDuration}
        loop={loop}
        maxBlur={maxBlur}
        messages={MESSAGES}
        startOnView={startOnView}
        textColor={textColor}
      />
    </div>
  );
}
