"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";

import { TextMorph } from "@/registry/primitives/texts/text-morph";

/** Docs preview — live morph as you type. */
export function TextMorphInput() {
  const [text, setText] = useState("Craft");
  const [caret, setCaret] = useState<number | undefined>();

  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-end space-y-12">
      <TextMorph
        className="text-foreground text-5xl font-medium"
        cursorIndex={caret}
        live="polite"
      >
        {text}
      </TextMorph>
      <input
        className={cn(
          "border-input h-9 w-full rounded-lg border bg-transparent p-2",
          "text-foreground text-base shadow-xs transition-colors outline-none",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3"
        )}
        onChange={(event) => {
          setCaret(event.target.selectionStart ?? undefined);
          setText(event.target.value);
        }}
        placeholder="Type your text here"
        type="text"
        value={text}
      />
    </div>
  );
}

export default TextMorphInput;
