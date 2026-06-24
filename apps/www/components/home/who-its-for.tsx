"use client";

import { SectionCtaScramble } from "@/components/buttons/section-cta-scramble";
import { MotionEffect } from "@/components/effects/motion-effect";
import { HomeSectionHeading } from "@/components/home/home-section-heading";
import { HomeSectionIntro } from "@/components/home/home-section-intro";
import { HomeShell } from "@/components/home/home-shell";

const FOR_YOU_ITEMS = [
  "You build with React or Next.js and own every file in your codebase.",
  "You install components with the shadcn CLI (`@soralabs/...`).",
  "You care about motion that feels considered, not decorative.",
  "You ship client work or side projects and want animated UI without opaque npm packages.",
] as const;

const NOT_FOR_YOU_ITEMS = [
  "You need a full UI kit—forms, tables, data grids. Sora focuses on motion primitives.",
  "You don't use Tailwind CSS, Motion, or GSAP in your stack.",
  "You want locked npm packages you can't edit—Sora copies source into your repo.",
  "You build mainly in Webflow or Framer without a code-first workflow.",
] as const;

interface AudienceColumnProps {
  delay: number;
  items: readonly string[];
  title: string;
}

function AudienceColumn({ title, items, delay }: AudienceColumnProps) {
  return (
    <MotionEffect
      delay={delay}
      fade
      inView
      slide={{ direction: "up", offset: 24 }}
    >
      <div>
        <p className="mb-10 font-mono text-muted-foreground text-xs uppercase tracking-widest">
          {title}
        </p>
        <ul className="divide-y divide-foreground/10">
          {items.map((item) => (
            <li
              className="py-5 text-base text-foreground leading-relaxed"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </MotionEffect>
  );
}

export function WhoItsFor({ primitivesUrl }: { primitivesUrl: string }) {
  return (
    <section
      className="relative bg-background text-foreground"
      id="who-its-for"
    >
      <HomeShell className="py-24 lg:py-32">
        <div className="grid grid-cols-12 gap-x-6 gap-y-16 lg:gap-x-12 lg:gap-y-0">
          <div className="col-span-12 flex flex-col lg:col-span-5">
            <HomeSectionHeading className="max-w-[18ch]">
              <span className="block">Built for developers who</span>
              <span className="block">care how it moves.</span>
            </HomeSectionHeading>

            <div className="mt-12 lg:mt-auto lg:pt-24">
              <HomeSectionIntro className="max-w-[36ch]">
                Motion-first primitives—most powered by Motion, with GSAP for
                scroll-driven text—you can inspect, copy, and customize. Real
                React code, real refs, no bloat—built for teams who ship.
              </HomeSectionIntro>

              <MotionEffect
                delay={0.2}
                fade
                inView
                slide={{ direction: "up", offset: 24 }}
              >
                <div className="mt-8">
                  <SectionCtaScramble
                    href={primitivesUrl}
                    label="Browse components"
                    variant="accent"
                  />
                </div>
              </MotionEffect>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3 lg:col-start-7">
            <AudienceColumn
              delay={0.15}
              items={FOR_YOU_ITEMS}
              title="Sora UI is for you if:"
            />
          </div>

          <div className="col-span-12 lg:col-span-3 lg:col-start-10">
            <AudienceColumn
              delay={0.25}
              items={NOT_FOR_YOU_ITEMS}
              title="Sora UI is probably not for you if:"
            />
          </div>
        </div>
      </HomeShell>
    </section>
  );
}
