"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionText,
  AccordionTrigger,
} from "@workspace/ui/components/sora-ui/disclosure/accordion";
import { cn } from "@workspace/ui/lib/utils";
import { MotionEffect } from "@/components/effects/motion-effect";

const FAQ_ITEMS = [
  {
    title: "What is Sora UI?",
    content:
      "Sora UI is an animated component registry for React and Next.js. It ships copy-paste primitives built on Motion, with live docs, demos, and a shadcn-compatible install flow so you can add polished UI effects directly into your project.",
  },
  {
    title: "How do I install a component?",
    content:
      "Initialize shadcn/ui in your app, then run the add command with the Sora UI registry scope—for example, npx shadcn@latest add @soralabs/accordion. The CLI copies the source into your project so you own and can customize every file.",
  },
  {
    title: "Can I customize the styles?",
    content:
      "Yes. Components are added as source files in your codebase, not as an opaque npm package. Tweak Tailwind classes, variants, and tokens to match your design system. Primitives also expose CVA variant helpers you can extend.",
  },
  {
    title: "What animation library does Sora UI use?",
    content:
      "Sora UI is built on Motion (motion/react). Timelines, springs, and layout animations are composed with Motion APIs. Wrap your app in MotionConfig with reducedMotion set to user for accessible defaults.",
  },
  {
    title: "Are Sora UI components accessible and reduced-motion aware?",
    content:
      "Yes. Components respect prefers-reduced-motion via Motion and useReducedMotion where needed. Interactive primitives handle keyboard focus and ARIA. The docs spell out what each one does when motion is reduced.",
  },
  {
    title: "Is there a free version of Sora UI?",
    content:
      "Yes. Every primitive in the docs is open to preview and install. Copy the source into your project, customize it, and ship—no account required to get started with real Sora UI code in your codebase.",
  },
  {
    title: "How does the registry work?",
    content:
      "Each primitive has a registry item with source paths, dependencies, and install targets. Docs previews load demo components from the same registry, so what you see in the docs matches what the CLI installs into components/sora-ui.",
  },
  {
    title: "Can I use Sora UI in commercial and client work?",
    content:
      "Yes. Sora UI is built for production client work. Install components into your projects, customize them, and ship. The only limit is repackaging or reselling the components as a competing library.",
  },
] as const;

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.title,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.content,
    },
  })),
};

const accordionTriggerClassName = cn(
  "items-start gap-4 py-6 lg:items-center",
  "[&>span:first-child]:font-mono [&>span:first-child]:font-normal [&>span:first-child]:text-xs [&>span:first-child]:uppercase [&>span:first-child]:leading-snug [&>span:first-child]:tracking-widest",
  "[&_[data-anm-accordion-icon]]:size-3"
);

const accordionTextClassName =
  "max-w-[96ch] pb-6 text-base text-muted-foreground leading-relaxed";

export function HomeFaq() {
  return (
    <section className="relative bg-background text-foreground">
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static FAQ JSON-LD for SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
        type="application/ld+json"
      />
      <div className="mx-auto max-w-7xl px-5 py-24 lg:py-32">
        <div className="grid grid-cols-12 gap-x-6 gap-y-16 lg:gap-x-12">
          <div className="col-span-12 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
            <MotionEffect fade inView slide={{ direction: "up", offset: 32 }}>
              <h2 className="max-w-[14ch] font-medium text-3xl leading-tight tracking-tight md:text-4xl lg:text-5xl">
                <span className="block">Questions and</span>
                <span className="block">answers.</span>
              </h2>
            </MotionEffect>

            <MotionEffect
              delay={0.1}
              fade
              inView
              slide={{ direction: "up", offset: 24 }}
            >
              <p className="mt-6 max-w-[34ch] text-base text-muted-foreground leading-relaxed">
                Everything worth knowing before you install. Full accordion docs
                live on the primitives page.
              </p>
            </MotionEffect>
          </div>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <MotionEffect
              delay={0.15}
              fade
              inView
              slide={{ direction: "up", offset: 24 }}
            >
              <Accordion className="w-full">
                {FAQ_ITEMS.map((item, index) => (
                  <AccordionItem defaultOpen={index === 0} key={item.title}>
                    <AccordionTrigger className={accordionTriggerClassName}>
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <AccordionText className={accordionTextClassName}>
                        {item.content}
                      </AccordionText>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </MotionEffect>
          </div>
        </div>
      </div>
    </section>
  );
}
