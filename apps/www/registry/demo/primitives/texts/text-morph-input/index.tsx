"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { TextMorph } from "@/registry/primitives/texts/text-morph";

/** Docs preview — live morph as you type. */
export function TextMorphInput() {
  const [text, setText] = useState("Craft");

  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-end space-y-12">
      <TextMorph className="font-medium text-5xl text-foreground" live="polite">
        {text}
      </TextMorph>
      <input
        className={cn(
          "h-9 w-full rounded-lg border border-input bg-transparent p-2",
          "text-base text-foreground shadow-xs outline-none transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        )}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type your text here"
        type="text"
        value={text}
      />
    </div>
  );
}

export default TextMorphInput;
