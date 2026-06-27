"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { TextMorph } from "@/registry/primitives/texts/text-morph";

/** Docs preview — click toggles Continue / Confirm with layout morph. */
export default function TextMorphPlayground() {
  const [text, setText] = useState("Continue");

  return (
    <button
      className={cn(
        "flex h-10 w-[120px] shrink-0 cursor-pointer items-center justify-center rounded-full",
        "bg-foreground px-4 font-medium text-background text-base shadow-xs transition-colors",
        "hover:bg-foreground/85 dark:hover:bg-foreground/90"
      )}
      onClick={() => {
        setText((current) => (current === "Continue" ? "Confirm" : "Continue"));
      }}
      type="button"
    >
      <TextMorph as="span">{text}</TextMorph>
    </button>
  );
}
