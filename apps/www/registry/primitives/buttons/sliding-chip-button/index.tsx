"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  type FocusEvent,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
  type RefObject,
  useEffect,
  useState,
} from "react";

const DEFAULT_EASE = [0.77, 0, 0.175, 1] as const;
const DEFAULT_DURATION = 0.7;

const LABEL_OFFSET_BY_SIZE = {
  sm: { default: -30, lg: -36 },
  default: { default: -38, lg: -46 },
  lg: { default: -44, lg: -52 },
} as const;

const slidingChipButtonVariants = cva(
  "inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap font-mono uppercase outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        accent: "focus-visible:ring-accent-pro/50",
        inverted: "focus-visible:ring-foreground/30",
        outline: "focus-visible:ring-border",
        ghost: "focus-visible:ring-muted-foreground/30",
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "default",
    },
  }
);

const slidingChipButtonChipVariants = cva(
  "pointer-events-none flex items-center justify-center will-change-transform",
  {
    variants: {
      variant: {
        accent: "bg-[rgba(251,70,13)] text-neutral-950",
        inverted: "bg-foreground text-background",
        outline: "border border-foreground bg-transparent text-foreground",
        ghost: "bg-muted text-foreground",
      },
      size: {
        sm: "size-7",
        default: "size-8 lg:size-10",
        lg: "size-10 lg:size-12",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "default",
    },
  }
);

const slidingChipButtonLabelVariants = cva(
  "pointer-events-none flex items-center justify-center will-change-transform",
  {
    variants: {
      variant: {
        accent: "bg-[rgba(251,70,13)] text-neutral-950",
        inverted: "bg-foreground text-background",
        outline: "border border-foreground bg-transparent text-foreground",
        ghost: "bg-muted text-foreground",
      },
      size: {
        sm: "h-7 px-2",
        default: "h-8 flex-1 px-2 lg:h-10 lg:px-3",
        lg: "h-10 flex-1 px-3 lg:h-12 lg:px-4",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "default",
    },
  }
);

const slidingChipButtonGroupVariants = cva(
  "pointer-events-none relative flex w-full items-center",
  {
    variants: {
      size: {
        sm: "gap-1",
        default: "gap-1.5",
        lg: "gap-2",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: ReactElement })
  | (Base & { asChild?: false | undefined; children?: string });

type SlidingChipButtonSize = NonNullable<
  VariantProps<typeof slidingChipButtonVariants>["size"]
>;

function SlidingChipButtonPlusIcon({ className }: { className?: string }) {
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

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }

      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as RefObject<T | null>).current = node;
      }
    }
  };
}

function getLinkLabel(
  asChild: boolean,
  children: string | ReactElement | undefined,
  label: string | undefined
): string {
  if (asChild && isValidElement(children)) {
    const childText = (children.props as { children?: unknown }).children;

    if (typeof childText === "string") {
      return childText;
    }

    return label ?? "";
  }

  if (typeof children === "string") {
    return children;
  }

  return label ?? "";
}

function useResponsiveLabelOffset(
  size: SlidingChipButtonSize,
  labelOffset?: number,
  labelOffsetLg?: number
): number {
  const offsets = LABEL_OFFSET_BY_SIZE[size ?? "default"];
  const baseOffset = labelOffset ?? offsets.default;
  const largeOffset = labelOffsetLg ?? offsets.lg;
  const [offset, setOffset] = useState(baseOffset);

  useEffect(() => {
    if (labelOffsetLg === undefined && labelOffset !== undefined) {
      setOffset(labelOffset);
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setOffset(mediaQuery.matches ? largeOffset : baseOffset);
    };

    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, [baseOffset, largeOffset, labelOffset, labelOffsetLg]);

  return offset;
}

function resolveMotionTransition(
  shouldReduceMotion: boolean | null,
  duration: number,
  ease: readonly [number, number, number, number]
): Transition {
  if (shouldReduceMotion) {
    return { duration: 0 };
  }

  return { duration, ease };
}

type SlidingChipButtonBaseProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "children"
> &
  VariantProps<typeof slidingChipButtonVariants> & {
    /** Alternative to string `children` for demos and controlled previews. */
    label?: string;
    /**
     * Animation duration in seconds.
     * @default 0.7
     */
    duration?: number;
    /**
     * Cubic-bezier easing values.
     * @default [0.77, 0, 0.175, 1]
     */
    ease?: readonly [number, number, number, number];
    /** Label x-offset at rest (mobile / default breakpoint). */
    labelOffset?: number;
    /** Label x-offset at rest on `lg` breakpoint and up. */
    labelOffsetLg?: number;
    /** Rest rotation for the leading chip (degrees). @default -45 */
    startChipRestRotate?: number;
    /** Active rotation for the leading chip (degrees). @default 0 */
    startChipActiveRotate?: number;
    /** Rest rotation for the trailing chip (degrees). @default 0 */
    endChipRestRotate?: number;
    /** Active rotation for the trailing chip (degrees). @default -45 */
    endChipActiveRotate?: number;
    /** Rest scale for both chips. @default 0 for start, 1 for end */
    startChipRestScale?: number;
    startChipActiveScale?: number;
    endChipRestScale?: number;
    endChipActiveScale?: number;
    /** Custom icon for both chips. */
    icon?: ReactNode;
    /** Override the leading chip icon. */
    startIcon?: ReactNode;
    /** Override the trailing chip icon. */
    endIcon?: ReactNode;
    /** Class names merged onto the motion group wrapper. */
    groupClassName?: string;
    /** Class names merged onto both chips and the label chip. */
    chipClassName?: string;
    /** Class names merged onto the label chip only. */
    labelClassName?: string;
    /** Class names merged onto the leading chip only. */
    startChipClassName?: string;
    /** Class names merged onto the trailing chip only. */
    endChipClassName?: string;
    /** Class names merged onto chip icons. */
    iconClassName?: string;
  };

export type SlidingChipButtonProps = WithAsChild<SlidingChipButtonBaseProps>;

interface SlidingChipButtonAnimatedContentProps {
  chipClassName?: string;
  duration: number;
  ease: readonly [number, number, number, number];
  endChipActiveRotate: number;
  endChipActiveScale: number;
  endChipClassName?: string;
  endChipRestRotate: number;
  endChipRestScale: number;
  endIcon?: ReactNode;
  groupClassName?: string;
  icon?: ReactNode;
  iconClassName?: string;
  isActive: boolean;
  label: string;
  labelClassName?: string;
  labelOffset: number;
  size: SlidingChipButtonSize;
  startChipActiveRotate: number;
  startChipActiveScale: number;
  startChipClassName?: string;
  startChipRestRotate: number;
  startChipRestScale: number;
  startIcon?: ReactNode;
  variant: NonNullable<SlidingChipButtonProps["variant"]>;
}

function SlidingChipButtonAnimatedContent({
  variant = "accent",
  size = "default",
  label,
  labelOffset,
  isActive,
  duration,
  ease,
  icon,
  startIcon,
  endIcon,
  groupClassName,
  chipClassName,
  labelClassName,
  startChipClassName,
  endChipClassName,
  iconClassName,
  startChipRestRotate,
  startChipActiveRotate,
  startChipRestScale,
  startChipActiveScale,
  endChipRestRotate,
  endChipActiveRotate,
  endChipRestScale,
  endChipActiveScale,
}: SlidingChipButtonAnimatedContentProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionTransition = resolveMotionTransition(
    shouldReduceMotion,
    duration,
    ease
  );

  const resolvedStartIcon = startIcon ?? icon ?? (
    <SlidingChipButtonPlusIcon className={cn("size-[0.75em]", iconClassName)} />
  );
  const resolvedEndIcon = endIcon ?? icon ?? (
    <SlidingChipButtonPlusIcon className={cn("size-[0.75em]", iconClassName)} />
  );

  const startChipVariants: Variants = {
    rest: { rotate: startChipRestRotate, scale: startChipRestScale },
    hover: { rotate: startChipActiveRotate, scale: startChipActiveScale },
  };

  const endChipVariants: Variants = {
    rest: { rotate: endChipRestRotate, scale: endChipRestScale },
    hover: { rotate: endChipActiveRotate, scale: endChipActiveScale },
  };

  return (
    <motion.span
      animate={isActive ? "hover" : "rest"}
      className={cn(slidingChipButtonGroupVariants({ size }), groupClassName)}
      initial={false}
    >
      <motion.span
        className={cn(
          slidingChipButtonChipVariants({ variant, size }),
          chipClassName,
          startChipClassName
        )}
        style={{ transformOrigin: "left center" }}
        transition={motionTransition}
        variants={startChipVariants}
      >
        {resolvedStartIcon}
      </motion.span>

      <motion.span
        animate={isActive ? { x: 0 } : { x: labelOffset }}
        className={cn(
          slidingChipButtonLabelVariants({ variant, size }),
          chipClassName,
          labelClassName
        )}
        initial={false}
        transition={motionTransition}
      >
        {label}
      </motion.span>

      <motion.span
        className={cn(
          slidingChipButtonChipVariants({ variant, size }),
          "absolute right-0 z-10",
          chipClassName,
          endChipClassName
        )}
        style={{ transformOrigin: "right center" }}
        transition={motionTransition}
        variants={endChipVariants}
      >
        {resolvedEndIcon}
      </motion.span>
    </motion.span>
  );
}

function SlidingChipButton({
  asChild = false,
  variant = "accent",
  size = "default",
  duration = DEFAULT_DURATION,
  ease = DEFAULT_EASE,
  label,
  children,
  className,
  groupClassName,
  chipClassName,
  labelClassName,
  startChipClassName,
  endChipClassName,
  iconClassName,
  labelOffset,
  labelOffsetLg,
  startChipRestRotate = -45,
  startChipActiveRotate = 0,
  startChipRestScale = 0,
  startChipActiveScale = 1,
  endChipRestRotate = 0,
  endChipActiveRotate = -45,
  endChipRestScale = 1,
  endChipActiveScale = 0,
  icon,
  startIcon,
  endIcon,
  href,
  ref,
  "aria-label": ariaLabel,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  ...props
}: SlidingChipButtonProps & {
  ref?: Ref<HTMLAnchorElement>;
}) {
  const text = getLinkLabel(asChild, children, label);
  const resolvedSize = size ?? "default";
  const resolvedLabelOffset = useResponsiveLabelOffset(
    resolvedSize,
    labelOffset,
    labelOffsetLg
  );
  const [isActive, setIsActive] = useState(false);
  const rootClassName = cn(
    slidingChipButtonVariants({ variant, size, className })
  );

  const animatedContent = (
    <SlidingChipButtonAnimatedContent
      chipClassName={chipClassName}
      duration={duration}
      ease={ease}
      endChipActiveRotate={endChipActiveRotate}
      endChipActiveScale={endChipActiveScale}
      endChipClassName={endChipClassName}
      endChipRestRotate={endChipRestRotate}
      endChipRestScale={endChipRestScale}
      endIcon={endIcon}
      groupClassName={groupClassName}
      icon={icon}
      iconClassName={iconClassName}
      isActive={isActive}
      label={text}
      labelClassName={labelClassName}
      labelOffset={resolvedLabelOffset}
      size={resolvedSize}
      startChipActiveRotate={startChipActiveRotate}
      startChipActiveScale={startChipActiveScale}
      startChipClassName={startChipClassName}
      startChipRestRotate={startChipRestRotate}
      startChipRestScale={startChipRestScale}
      startIcon={startIcon}
      variant={variant ?? "accent"}
    />
  );

  const interactionHandlers = {
    onBlur: (event: FocusEvent<HTMLElement>) => {
      onBlur?.(event as FocusEvent<HTMLAnchorElement>);
      setIsActive(false);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      onFocus?.(event as FocusEvent<HTMLAnchorElement>);
      setIsActive(true);
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      onMouseEnter?.(event as MouseEvent<HTMLAnchorElement>);
      setIsActive(true);
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      onMouseLeave?.(event as MouseEvent<HTMLAnchorElement>);
      setIsActive(false);
    },
  };

  if (asChild) {
    if (!isValidElement(children)) {
      return null;
    }

    const {
      ref: childRef,
      className: childClassName,
      "aria-label": childAriaLabel,
      onBlur: childOnBlur,
      onFocus: childOnFocus,
      onMouseEnter: childOnMouseEnter,
      onMouseLeave: childOnMouseLeave,
      ...childProps
    } = children.props as {
      ref?: Ref<HTMLElement>;
      className?: string;
      "aria-label"?: string;
      onBlur?: (event: FocusEvent<HTMLElement>) => void;
      onFocus?: (event: FocusEvent<HTMLElement>) => void;
      onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
      onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
    };

    return cloneElement(
      children,
      {
        ...childProps,
        ...props,
        ...interactionHandlers,
        "aria-label": ariaLabel ?? childAriaLabel ?? (text || undefined),
        className: cn(childClassName, rootClassName),
        onBlur: (event: FocusEvent<HTMLElement>) => {
          childOnBlur?.(event);
          interactionHandlers.onBlur(event);
        },
        onFocus: (event: FocusEvent<HTMLElement>) => {
          childOnFocus?.(event);
          interactionHandlers.onFocus(event);
        },
        onMouseEnter: (event: MouseEvent<HTMLElement>) => {
          childOnMouseEnter?.(event);
          interactionHandlers.onMouseEnter(event);
        },
        onMouseLeave: (event: MouseEvent<HTMLElement>) => {
          childOnMouseLeave?.(event);
          interactionHandlers.onMouseLeave(event);
        },
        ref: mergeRefs(childRef, ref),
      } as Record<string, unknown>,
      animatedContent
    );
  }

  return (
    <a
      aria-label={ariaLabel ?? (text || undefined)}
      className={rootClassName}
      href={href}
      ref={ref}
      {...interactionHandlers}
      {...props}
    >
      {animatedContent}
    </a>
  );
}

export {
  SlidingChipButton,
  SlidingChipButtonPlusIcon,
  slidingChipButtonChipVariants,
  slidingChipButtonGroupVariants,
  slidingChipButtonLabelVariants,
  slidingChipButtonVariants,
};

export type SlidingChipButtonVariant = NonNullable<
  SlidingChipButtonProps["variant"]
>;
