"use client";

import {
  Accordion,
  type AccordionItemData,
} from "@/registry/primitives/disclosure/accordion";

const FAQ_ITEMS: AccordionItemData[] = [
  {
    title: "What is Sora UI?",
    content:
      "Sora UI is an animated component registry for React and Next.js. It ships copy-paste primitives built on Motion and GSAP, with live docs, demos, and a shadcn-compatible install flow so you can add polished UI effects directly into your project.",
    defaultOpen: true,
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
    enableStagger: true,
  },
  {
    title: "What animation library does Sora UI use?",
    content:
      "Most primitives use Motion (motion/react)—timelines, springs, and layout animations composed with Motion APIs. Scroll-driven text like Text Reveal Block uses GSAP SplitText and ScrollTrigger. Wrap your app in MotionConfig with reducedMotion set to user for accessible defaults.",
    enableStagger: true,
  },
];

export default function AccordionExample() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Accordion items={FAQ_ITEMS} />
    </div>
  );
}
