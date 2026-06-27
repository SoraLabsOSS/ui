"use client";

import GsapIcon from "@workspace/ui/components/icons/gsap-icon";
import MotionIcon from "@workspace/ui/components/icons/motion-icon";
import ReactIcon from "@workspace/ui/components/icons/react-icon";
import ShadcnIcon from "@workspace/ui/components/icons/shadcn-icon";
import TailwindIcon from "@workspace/ui/components/icons/tailwind-icon";
import TSIcon from "@workspace/ui/components/icons/ts-icon";
import { cn } from "@workspace/ui/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentType, SVGProps } from "react";
import { TextEffect } from "@/registry/primitives/texts/text-effect";

const STACK_ITEMS = [
  { id: "react", Icon: ReactIcon },
  { id: "ts", Icon: TSIcon },
  { id: "tailwind", Icon: TailwindIcon },
  { id: "motion", Icon: MotionIcon },
  { id: "gsap", Icon: GsapIcon },
  { id: "shadcn", Icon: ShadcnIcon },
] as const;

const STACK_LABEL = "React · TS · Tailwind · Motion · GSAP · shadcn";

const TITLE = "Copy the source. Ship the polish.";
const DESCRIPTION =
  "Preview-first component pages with live demos, install commands, and full API reference.";

function StackIconBadge({
  Icon,
  index,
  play,
}: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  index: number;
  play: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        play || prefersReducedMotion
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0.85 }
      }
      className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-background ring-1 ring-border"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85 }}
      transition={{
        delay: prefersReducedMotion ? 0 : 0.08 + index * 0.05,
        duration: 0.35,
        ease: [0.19, 1, 0.22, 1],
      }}
    >
      <Icon className="h-2.5 w-2.5" />
    </motion.div>
  );
}

export function ComponentsGalleryHero({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <motion.div
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-2"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="flex w-fit max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-muted/70 px-3 py-1.5">
          <div className="flex items-center -space-x-1">
            {STACK_ITEMS.map(({ Icon, id }, index) => (
              <StackIconBadge
                Icon={Icon}
                index={index}
                key={id}
                play={!prefersReducedMotion}
              />
            ))}
          </div>
          <span className="text-[13px] text-muted-foreground">
            {STACK_LABEL}
          </span>
        </div>
      </motion.div>

      <div className="relative z-10">
        <TextEffect
          as="h1"
          className="max-w-3xl text-center font-medium text-5xl tracking-tighter sm:text-6xl"
          containerTransition={{ staggerChildren: 0.04 }}
          delay={0.1}
          per="word"
          preset="fade-in-blur"
          scrollTrigger
          segmentTransition={{ duration: 0.5 }}
        >
          {TITLE}
        </TextEffect>
      </div>

      <TextEffect
        as="p"
        className="mt-3 block max-w-xl text-balance text-center font-normal text-muted-foreground text-sm sm:text-base md:text-lg"
        containerTransition={{ staggerChildren: 0.02 }}
        delay={0.25}
        per="word"
        preset="fade-in-blur"
        scrollTrigger
        segmentTransition={{ duration: 0.5 }}
      >
        {DESCRIPTION}
      </TextEffect>
    </div>
  );
}
