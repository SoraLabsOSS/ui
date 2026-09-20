"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode, Ref } from "react";

export type ArrowRollButtonVariant = "light" | "dark" | "white" | "outline";
export type ArrowRollButtonSize = "default" | "large";

export interface ArrowRollButtonProps
  extends Omit<ComponentProps<"button">, "ref"> {
  /**
   * Text label displayed inside the rolling text track.
   * @default "Start a project"
   */
  children?: ReactNode;
  /**
   * Additional class names merged onto the root element.
   */
  className?: string;
  /**
   * Optional link destination. When provided, renders as an anchor `<a>` tag.
   */
  href?: string;
  /**
   * Ref forwarded to the underlying root DOM element.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Button size corresponding to navbar (`default`) or CTA section (`large`).
   * @default "default"
   */
  size?: ArrowRollButtonSize;
  /**
   * Visual theme variant based on studio aesthetics.
   * @default "light"
   */
  variant?: ArrowRollButtonVariant;
}

const ARROW_PATH =
  "M8.90954 9.09046L9 3L2.90954 3.09046L2.90213 4.32367L6.86437 4.25391L2.55914 8.55914L3.44086 9.44086L7.74609 5.13563L7.68708 9.10862L8.90954 9.09046Z";

const variantStyles: Record<
  ArrowRollButtonVariant,
  { root: string; asideBg: string; icon: string }
> = {
  light: {
    root: "bg-[#fafafa] text-[#121212] hover:opacity-90",
    asideBg: "bg-[#262626]",
    icon: "text-[#fafafa]",
  },
  dark: {
    root: "bg-[#121212] text-[#fafafa] hover:opacity-90",
    asideBg: "bg-[#262626]",
    icon: "text-[#fafafa]",
  },
  white: {
    root: "bg-white text-[#121212] hover:opacity-90 shadow-xs",
    asideBg: "bg-[#121212]",
    icon: "text-white",
  },
  outline: {
    root: "border border-[#262626] bg-transparent text-[#121212] hover:bg-[#fafafa] dark:border-[#404040] dark:text-[#fafafa] dark:hover:bg-[#1c1c1c]",
    asideBg: "bg-[#262626]",
    icon: "text-[#fafafa]",
  },
};

const sizeStyles: Record<
  ArrowRollButtonSize,
  { root: string; text: string; asideWrap: string; iconSize: string }
> = {
  default: {
    root: "py-1 pr-1 pl-3 gap-2 text-xs rounded-[0.15rem]",
    text: "text-xs tracking-[-0.01em]",
    asideWrap: "size-5.5 rounded-[0.15rem]",
    iconSize: "size-2.5",
  },
  large: {
    root: "py-1.5 pr-1.5 pl-4 gap-2.5 text-sm rounded-[0.15rem]",
    text: "text-sm tracking-[-0.02em]",
    asideWrap: "size-7 rounded-[0.15rem]",
    iconSize: "size-3",
  },
};

function ArrowSvg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={ARROW_PATH} fill="currentColor" />
    </svg>
  );
}

export function ArrowRollButton({
  children = "Start a project",
  className,
  href,
  size = "default",
  variant = "light",
  ref,
  ...props
}: ArrowRollButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  const innerContent = (
    <>
      <div className="overflow-clip leading-none">
        <div
          className={cn(
            "block font-medium [text-shadow:0_1.2em_0_currentColor]",
            "transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.35,1)]",
            "group-hover:-translate-y-[1.2em]",
            prefersReducedMotion && "transform-none group-hover:transform-none",
            currentSize.text
          )}
        >
          {children}
        </div>
      </div>

      <div
        className={cn(
          "relative flex flex-none items-center justify-center overflow-hidden",
          currentSize.asideWrap
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-[0.15rem] transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.35,1)]",
            "group-hover:scale-[0.8]",
            prefersReducedMotion && "transform-none group-hover:transform-none",
            currentVariant.asideBg
          )}
        />

        <ArrowSvg
          className={cn(
            "relative z-1 transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.35,1)]",
            "group-hover:translate-x-[200%] group-hover:-translate-y-[200%]",
            prefersReducedMotion && "transform-none group-hover:transform-none",
            currentSize.iconSize,
            currentVariant.icon
          )}
        />

        <ArrowSvg
          className={cn(
            "absolute z-1 -translate-x-[200%] translate-y-[200%] transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.35,1)]",
            "group-hover:translate-x-0 group-hover:translate-y-0",
            prefersReducedMotion && "hidden",
            currentSize.iconSize,
            currentVariant.icon
          )}
        />
      </div>
    </>
  );

  const rootClass = cn(
    "group relative inline-flex w-fit cursor-pointer select-none items-center justify-center border-0 font-medium outline-none",
    "transition-[transform,opacity] duration-[350ms] ease-[cubic-bezier(0.48,1.68,0.64,1)] active:scale-95",
    prefersReducedMotion && "active:transform-none",
    currentSize.root,
    currentVariant.root,
    className
  );

  if (href) {
    return (
      <a className={rootClass} href={href}>
        {innerContent}
      </a>
    );
  }

  return (
    <button className={rootClass} ref={ref} type="button" {...props}>
      {innerContent}
    </button>
  );
}
