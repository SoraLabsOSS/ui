"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { TextMorph } from "@/registry/primitives/texts/text-morph";

const STATES = [
  {
    label: "Copy",
  },
  {
    label: "Copied",
  },
] as const;

/**
 * Docs preview — interactive Copy / Copied toggle demo.
 */
export default function TextMorphPlayground() {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const current = STATES[currentStateIndex] ?? STATES[0];

  return (
    <div className="flex w-full items-center justify-center p-6">
      <button
        className={cn(
          "inline-flex cursor-pointer items-center justify-center",
          "rounded-xl bg-[#131313] px-5 py-2.5 font-medium text-base text-white",
          "border border-white/10 shadow-lg transition-transform active:scale-[0.98] dark:border-white/[0.08]"
        )}
        onClick={() => {
          setCurrentStateIndex((prev) => (prev + 1) % STATES.length);
        }}
        type="button"
      >
        <TextMorph>{current.label}</TextMorph>
      </button>
    </div>
  );
}
