"use client";

import { Button } from "@/registry/ui/radix/button";

export default function RadixButtonMotionDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button hoverScale={1.12} tapScale={0.88}>
        Spring Bouncy (1.12 / 0.88)
      </Button>
      <Button hoverScale={1.02} tapScale={0.98} variant="outline">
        Subtle (1.02 / 0.98)
      </Button>
      <Button disableAnimation variant="secondary">
        No Scale (Static)
      </Button>
    </div>
  );
}
