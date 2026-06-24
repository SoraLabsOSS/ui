"use client";

import { DEMO_TRAIL_IMAGES } from "@/registry/demo/primitives/effects/cursor-trail-reveal/trail-images";
import { CursorTrailReveal } from "@/registry/primitives/effects/cursor-trail-reveal";
import { TextRevealBlock } from "@/registry/primitives/texts/text-reveal-block";

import "./demo.css";

export function CursorTrailDemoPage() {
  return (
    <div className="cursor-trail-demo">
      <section className="contact-page">
        <CursorTrailReveal
          images={DEMO_TRAIL_IMAGES}
          maskColor="var(--demo-bg)"
        />

        <div className="contact-copy">
          <div className="contact-copy-main">
            <TextRevealBlock
              animateOnScroll={false}
              blockColor="var(--demo-accent)"
              delay={0.65}
            >
              <div className="contact-col-copy">
                <h6>Trying to hover to see the cursor trail</h6>
              </div>
            </TextRevealBlock>
          </div>
        </div>
      </section>
    </div>
  );
}
