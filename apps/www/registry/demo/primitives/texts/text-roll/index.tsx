"use client";

import { useState } from "react";
import { chromatic, TextRoll } from "@/registry/primitives/texts/text-roll";

export interface TextRollPlaygroundProps {
  bounce?: number;
  chromatic?: boolean;
  className?: string;
  duration?: number;
  stagger?: number;
}

/** Docs preview — click toggles Copy / Copied like slot-text examples. */
export default function TextRollPlayground({
  bounce = 0.6,
  chromatic: chromaticOnCopy = true,
  className = "font-medium text-lg tabular-nums",
  duration = 300,
  stagger = 45,
}: TextRollPlaygroundProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent"
      onClick={() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      type="button"
    >
      <TextRoll
        className={className}
        options={{
          bounce,
          direction: copied ? "up" : "down",
          duration,
          skipUnchanged: false,
          stagger,
          color:
            copied && chromaticOnCopy ? chromatic({ from: 190 }) : undefined,
        }}
        text={copied ? "Copied" : "Copy"}
      />
    </button>
  );
}
