import { cn } from "@workspace/ui/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export type HoverLinkVariant =
  | "underline-left"
  | "underline-right"
  | "underline-center"
  | "highlight-rise"
  | "highlight-wipe";

const ARROW_PATH = "M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004";

const UNDERLINE_CLASSES =
  "before:pointer-events-none before:absolute before:top-[1.5em] before:left-0 before:h-[0.05em] before:w-full before:bg-current before:content-[''] before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:before:transition-none";

const HIGHLIGHT_CLASSES =
  "before:pointer-events-none before:absolute before:left-0 before:w-full before:bg-white before:content-[''] before:mix-blend-difference before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] before:z-1 px-2 motion-reduce:before:transition-none";

const VARIANT_CLASSES: Record<HoverLinkVariant, string> = {
  "underline-left": cn(
    UNDERLINE_CLASSES,
    "before:origin-right hover:before:origin-left hover:before:scale-x-100"
  ),
  "underline-right": cn(
    UNDERLINE_CLASSES,
    "before:origin-left hover:before:origin-right hover:before:scale-x-100"
  ),
  "underline-center": cn(
    UNDERLINE_CLASSES,
    "before:origin-center hover:before:scale-x-100"
  ),
  "highlight-rise": cn(
    HIGHLIGHT_CLASSES,
    "before:bottom-0 before:h-0 hover:before:h-full"
  ),
  "highlight-wipe": cn(
    HIGHLIGHT_CLASSES,
    "before:top-0 before:h-full before:origin-left before:scale-x-0 hover:before:scale-x-100"
  ),
};

const ARROW_CLASSES: Record<HoverLinkVariant, string> = {
  "underline-left":
    "ml-[0.3em] translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
  "underline-right":
    "ml-[0.3em] translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
  "underline-center":
    "ml-[0.3em] translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
  "highlight-rise":
    "z-0 ml-[0.6em] translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:rotate-45 group-hover:opacity-100",
  "highlight-wipe":
    "z-0 ml-[0.6em] -translate-x-1 rotate-45 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
};

export interface HoverLinkProps extends ComponentPropsWithoutRef<"a"> {
  /**
   * Motion preset. Three underline wipes and two block highlights.
   * @default "underline-left"
   */
  variant?: HoverLinkVariant;
  /**
   * Show the diagonal arrow that slides in on hover.
   * @default true
   */
  withArrow?: boolean;
}

export function HoverLink({
  children,
  className,
  rel,
  target,
  variant = "underline-left",
  withArrow = true,
  ...props
}: HoverLinkProps) {
  return (
    <a
      className={cn(
        "group relative flex items-center outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        VARIANT_CLASSES[variant],
        className
      )}
      rel={target === "_blank" ? (rel ?? "noopener noreferrer") : rel}
      target={target}
      {...props}
    >
      {children}
      {withArrow ? (
        <svg
          aria-hidden="true"
          className={cn(
            "size-[0.55em] transition-all duration-300 motion-reduce:transition-none",
            ARROW_CLASSES[variant]
          )}
          fill="none"
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={ARROW_PATH}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.25"
          />
        </svg>
      ) : null}
    </a>
  );
}
