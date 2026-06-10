"use client";

import {
  MaskedTextReveal,
  type MaskedTextRevealProps,
} from "@/registry/primitives/texts/text-reveal-mask";

export default function MaskedTextRevealExample({
  splitBy = "lines",
  stagger = 0.1,
  duration,
  yPercent = 110,
  delay = 0,
  viewportMargin = "0px 0px -20% 0px",
  className = "mx-auto max-w-3xl text-center font-normal text-xl leading-snug tracking-[-0.02em] text-foreground/75 [&_strong]:font-medium [&_strong]:text-foreground",
}: MaskedTextRevealProps) {
  return (
    <div className="w-full py-[min(40vh,16rem)]">
      <MaskedTextReveal
        as="h2"
        className={className}
        delay={delay}
        duration={duration}
        splitBy={splitBy}
        stagger={stagger}
        viewportMargin={viewportMargin}
        yPercent={yPercent}
      >
        Every stride is a statement. Every finish line a new beginning. We build
        gear for athletes who refuse to settle for{" "}
        <strong>yesterday&apos;s pace</strong>. Push beyond limits. Outrun
        expectations. This is where <strong>champions are made</strong>.
      </MaskedTextReveal>
    </div>
  );
}
