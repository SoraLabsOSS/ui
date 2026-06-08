"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { type ComponentPropsWithoutRef, useEffect, useState } from "react";

const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const TRANSITION_DURATION = 0.7;

const CTA_CHIP_CLASS = {
  accent: "bg-[rgba(251,70,13)] text-neutral-950",
  inverted: "bg-foreground text-background",
} as const;

const CHIP_MOTION_CLASS =
  "pointer-events-none flex items-center justify-center will-change-transform";

const GROUP_VARIANTS = {
  rest: {},
  hover: {},
} as const;

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 12 12"
    >
      <path
        d="M6 1v10M1 6h10"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function useLabelOffset() {
  const [offset, setOffset] = useState(-38);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setOffset(mediaQuery.matches ? -46 : -38);
    };

    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return offset;
}

const CTA_TRIGGER_CLASS =
  "group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap font-mono text-sm uppercase outline-none focus-visible:ring-2 focus-visible:ring-accent-pro/50 focus-visible:ring-offset-2";

function useCtaInteraction() {
  const [isActive, setIsActive] = useState(false);

  return {
    isActive,
    handlers: {
      onBlur: () => {
        setIsActive(false);
      },
      onFocus: () => {
        setIsActive(true);
      },
      onMouseEnter: () => {
        setIsActive(true);
      },
      onMouseLeave: () => {
        setIsActive(false);
      },
    },
  };
}

function SectionCtaContent({
  label,
  variant = "accent",
  isActive,
}: {
  label: string;
  variant?: keyof typeof CTA_CHIP_CLASS;
  isActive: boolean;
}) {
  const chipClass = CTA_CHIP_CLASS[variant];
  const labelOffset = useLabelOffset();
  const shouldReduceMotion = useReducedMotion();
  const motionTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: TRANSITION_DURATION, ease: EASE_IN_OUT };

  return (
    <motion.span
      animate={isActive ? "hover" : "rest"}
      className="pointer-events-none relative flex w-full items-center gap-1.5"
      initial={false}
      variants={GROUP_VARIANTS}
    >
      <motion.span
        className={cn(
          CHIP_MOTION_CLASS,
          "size-8 origin-left lg:size-10",
          chipClass
        )}
        style={{ transformOrigin: "left center" }}
        transition={motionTransition}
        variants={{
          rest: { rotate: -45, scale: 0 },
          hover: { rotate: 0, scale: 1 },
        }}
      >
        <PlusIcon className="size-[0.75em]" />
      </motion.span>

      <motion.span
        animate={isActive ? { x: 0 } : { x: labelOffset }}
        className={cn(
          CHIP_MOTION_CLASS,
          "h-8 flex-1 px-2 lg:h-10 lg:px-3",
          chipClass
        )}
        initial={false}
        transition={motionTransition}
      >
        {label}
      </motion.span>

      <motion.span
        className={cn(
          CHIP_MOTION_CLASS,
          "absolute right-0 z-10 size-8 lg:size-10",
          chipClass
        )}
        style={{ transformOrigin: "right center" }}
        transition={motionTransition}
        variants={{
          rest: { rotate: 0, scale: 1 },
          hover: { rotate: -45, scale: 0 },
        }}
      >
        <PlusIcon className="size-[0.75em]" />
      </motion.span>
    </motion.span>
  );
}

export interface SectionCtaProps {
  href: string;
  label: string;
  variant?: keyof typeof CTA_CHIP_CLASS;
}

export function SectionCta({
  href,
  label,
  variant = "accent",
}: SectionCtaProps) {
  const { isActive, handlers } = useCtaInteraction();

  return (
    <Link className={CTA_TRIGGER_CLASS} href={href} {...handlers}>
      <SectionCtaContent isActive={isActive} label={label} variant={variant} />
    </Link>
  );
}

export interface SectionCtaButtonProps
  extends ComponentPropsWithoutRef<"button"> {
  label: string;
  variant?: keyof typeof CTA_CHIP_CLASS;
}

export function SectionCtaButton({
  label,
  variant = "accent",
  className,
  type = "button",
  ...props
}: SectionCtaButtonProps) {
  const { isActive, handlers } = useCtaInteraction();

  return (
    <button
      className={cn(CTA_TRIGGER_CLASS, className)}
      type={type}
      {...handlers}
      {...props}
    >
      <SectionCtaContent isActive={isActive} label={label} variant={variant} />
    </button>
  );
}
