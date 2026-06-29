"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";

const NBSP = "\u00A0";

const TEXT_MORPH_VARIANTS = {
  blur: {
    initial: { opacity: 0, y: 6, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -6, filter: "blur(6px)" },
  },
  slide: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
} as const satisfies Record<string, Variants>;

const DEFAULT_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 18,
  mass: 0.3,
};

export type TextMorphVariant = keyof typeof TEXT_MORPH_VARIANTS;

export type TextMorphProps = {
  /** String label to morph between updates. */
  children: string;
  as?: ElementType;
  className?: string;
  /** Class names applied to each animated character span. */
  charClassName?: string;
  style?: CSSProperties;
  variants?: Variants;
  transition?: Transition;
  /** Optional preset when `variants` is omitted. Default motion matches opacity crossfade + layoutId morph. */
  variant?: TextMorphVariant;
  /**
   * Per-character delay in seconds.
   * @default 0
   */
  staggerDelay?: number;
  /**
   * Keep same-index glyphs static instead of layout-morphing shared letters.
   * @default false
   */
  skipUnchanged?: boolean;
  /**
   * Live region politeness when the label updates.
   * @default "off"
   */
  live?: "assertive" | "off" | "polite";
} & Omit<ComponentPropsWithoutRef<"p">, "children">;

export function TextMorph({
  children,
  as: Component = "p",
  className,
  charClassName,
  style,
  variants,
  transition,
  variant,
  staggerDelay = 0,
  skipUnchanged = false,
  live = "off",
  ...props
}: TextMorphProps) {
  const uniqueId = useId();
  const prefersReducedMotion = useReducedMotion();
  const previousTextRef = useRef<string | null>(null);
  const previousIdsRef = useRef<Set<string>>(new Set());

  const characters = useMemo(() => {
    const charCounts: Record<string, number> = {};

    return children.split("").map((char) => {
      const lowerChar = char.toLowerCase();
      charCounts[lowerChar] = (charCounts[lowerChar] || 0) + 1;

      return {
        id: `${uniqueId}-${lowerChar}${charCounts[lowerChar]}`,
        label: char === " " ? NBSP : char,
      };
    });
  }, [children, uniqueId]);

  const previousText = previousTextRef.current;
  const previousIds = previousIdsRef.current;
  const resolvedVariants =
    variants ?? (variant ? TEXT_MORPH_VARIANTS[variant] : DEFAULT_VARIANTS);
  const resolvedTransition = transition ?? DEFAULT_TRANSITION;

  useEffect(() => {
    previousTextRef.current = children;
    previousIdsRef.current = new Set(
      characters.map((character) => character.id)
    );
  }, [children, characters]);

  if (prefersReducedMotion) {
    return (
      <Component
        aria-live={live === "off" ? undefined : live}
        className={cn(className)}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      aria-label={children}
      aria-live={live === "off" ? undefined : live}
      className={cn("relative", className)}
      style={style}
      {...props}
    >
      <LayoutGroup id={uniqueId}>
        <AnimatePresence mode="popLayout">
          {characters.map((character, index) => {
            if (skipUnchanged) {
              const previousChar = previousText?.[index];
              const currentChar = children[index];

              if (
                previousText !== null &&
                index < previousText.length &&
                previousChar === currentChar
              ) {
                return (
                  <motion.span
                    aria-hidden
                    className={cn("inline-block", charClassName)}
                    key={character.id}
                    layout="position"
                    layoutId={character.id}
                    transition={resolvedTransition}
                  >
                    {character.label}
                  </motion.span>
                );
              }
            }

            const isEntering =
              previousText !== null && !previousIds.has(character.id);

            return (
              <motion.span
                animate="animate"
                aria-hidden
                className={cn("inline-block", charClassName)}
                exit="exit"
                initial={isEntering ? "initial" : false}
                key={character.id}
                layout="position"
                layoutId={character.id}
                transition={
                  staggerDelay > 0
                    ? { ...resolvedTransition, delay: index * staggerDelay }
                    : resolvedTransition
                }
                variants={resolvedVariants}
              >
                {character.label}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </LayoutGroup>
    </Component>
  );
}
