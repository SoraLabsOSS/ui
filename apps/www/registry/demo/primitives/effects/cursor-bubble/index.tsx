"use client";

import {
  CursorBubble,
  CursorBubbleTarget,
} from "@/registry/primitives/effects/cursor-bubble";

export function CursorBubbleExample() {
  return (
    <CursorBubble className="flex h-[min(320px,50dvh)] w-full flex-col items-center justify-center gap-6 text-center sm:h-72">
      <CursorBubbleTarget label="explore">
        <span className="font-medium text-2xl underline underline-offset-4 sm:text-3xl">
          Our work
        </span>
      </CursorBubbleTarget>
      <CursorBubbleTarget label="say hi">
        <span className="text-muted-foreground text-sm">Get in touch</span>
      </CursorBubbleTarget>
    </CursorBubble>
  );
}

export default CursorBubbleExample;
