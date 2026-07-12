"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  TextLoop,
  type TextLoopProps,
} from "@/registry/primitives/texts/text-loop";

const PHRASES = ["Design fast.", "Ship faster.", "Iterate forever."];

export default function TextLoopExample({
  interval = 2,
  className = "font-medium text-2xl text-foreground",
}: Pick<TextLoopProps, "interval" | "className">) {
  return (
    <div className="relative inline-grid">
      {PHRASES.map((phrase) => (
        <span
          aria-hidden
          className={cn(
            className,
            "invisible whitespace-nowrap [grid-area:1/1]"
          )}
          key={phrase}
        >
          {phrase}
        </span>
      ))}
      <TextLoop
        className={cn(className, "[grid-area:1/1]")}
        interval={interval}
      >
        {PHRASES.map((phrase) => (
          <span key={phrase}>{phrase}</span>
        ))}
      </TextLoop>
    </div>
  );
}
