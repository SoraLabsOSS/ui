"use client";

import {
  Accordion,
  type AccordionItemData,
} from "@/registry/primitives/disclosure/accordion";

const FAQ_ITEMS: AccordionItemData[] = [
  {
    title: "What is Sora UI?",
    content:
      "Sora UI is an animated component registry for React and Next.js. It ships copy-paste primitives built on Motion, with live docs, demos, and a shadcn-compatible install flow so you can add polished UI effects directly into your project.",
    defaultOpen: true,
  },
  {
    title: "How do I install a component?",
    content:
      "Initialize shadcn/ui in your app, then run the add command with the Sora UI registry scope—for example, npx shadcn@latest add @sora-ui/accordion. The CLI copies the source into your project so you own and can customize every file.",
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
    title: "Does Sora UI support reduced motion?",
    content:
      'Yes. Components respect prefers-reduced-motion via Motion and useReducedMotion where needed. For app-wide behavior, add MotionConfig reducedMotion="user" at the root so transforms and layout animations scale back automatically.',
  },
  {
    title: "How does the registry work?",
    content:
      "Each primitive has a registry item with source paths, dependencies, and install targets. Docs previews load demo components from the same registry, so what you see in the docs matches what the CLI installs into components/sora-ui.",
  },
  {
    title: "Do I need to use every subcomponent?",
    content:
      "No. Many primitives support a simple data API—for example, Accordion accepts an items array with title and content. Use the compound API when you need custom markup inside panels or triggers.",
  },
  {
    title: "Which frameworks are supported?",
    content:
      'Sora UI targets React 19+ and Next.js App Router. Components marked "use client" run in the browser; install steps follow the same shadcn/ui workflow used across Vite, Next.js, and other React setups.',
  },
];

export default function AccordionExample() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Accordion items={FAQ_ITEMS} />
    </div>
  );
}
