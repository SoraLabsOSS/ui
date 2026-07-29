/** biome-ignore-all lint/suspicious/noArrayIndexKey: Character order is stable for static button labels. */

import { buttonVariants } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type Ref,
  type RefCallback,
  type RefObject,
} from "react";

const staggerButtonVariants = cva(
  "group relative bg-transparent! no-underline",
  {
    variants: {
      withBg: {
        true: "z-[1] transition-[scale,color] duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
        false: "",
      },
    },
    defaultVariants: {
      withBg: true,
    },
  }
);

const staggerButtonBgVariants = cva(
  "pointer-events-none absolute inset-0 rounded-[inherit] transition-[scale] duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:scale-[0.97] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
  {
    variants: {
      variant: {
        default: "bg-primary",
        accent: "bg-accent",
        neutral: "bg-neutral-100 dark:bg-neutral-900",
        destructive: "bg-destructive dark:bg-destructive/60",
        outline: "bg-background dark:bg-input/30",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const staggerButtonTextVariants = cva("flex items-center whitespace-nowrap");

const staggerButtonCharsVariants = cva(
  "relative inline-block overflow-hidden whitespace-nowrap"
);

const staggerButtonCharVariants = cva(
  "relative inline-block transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] [text-shadow:0_2em_0_currentColor] group-hover:-translate-y-[2em] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
);

const WHITESPACE_SPLIT_REGEX = /\s+/;

/** Variants rendered without the scaling background layer. */
const FLAT_VARIANTS = new Set<string>(["ghost", "link"]);

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: ReactElement })
  | (Base & { asChild?: false | undefined; children?: string });

type StaggerButtonBaseProps = Omit<ComponentPropsWithoutRef<"a">, "children"> &
  VariantProps<typeof buttonVariants> & {
    /** Override the scaling background layer (solid variants only). */
    bgClassName?: string;
    /** Override each animated character span. */
    charClassName?: string;
    /** Override each per-word overflow wrapper. */
    charsClassName?: string;
    /** Alternative to string `children` — required when `asChild` child has no string content. */
    label?: string;
    /**
     * Animate per character with stagger, or slide the whole label as one block.
     * @default "char"
     */
    stagger?: "char" | "text";
    /**
     * Per-character transition delay increment in seconds. Ignored when `stagger` is `"text"`.
     * @default 0.01
     */
    staggerDelay?: number;
    /** Override the text wrapper. */
    textClassName?: string;
  };

export type StaggerButtonProps = WithAsChild<StaggerButtonBaseProps>;

interface StaggerAnimatedLabelProps {
  bgClassName?: string;
  charClassName?: string;
  charsClassName?: string;
  stagger: NonNullable<StaggerButtonProps["stagger"]>;
  staggerDelay: number;
  text: string;
  textClassName?: string;
  variant: NonNullable<StaggerButtonProps["variant"]>;
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

function getButtonLabel(
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

function StaggerAnimatedLabel({
  variant,
  text,
  stagger,
  staggerDelay,
  bgClassName,
  textClassName,
  charsClassName,
  charClassName,
}: StaggerAnimatedLabelProps) {
  const words =
    stagger === "text"
      ? [text]
      : text.trim().split(WHITESPACE_SPLIT_REGEX).filter(Boolean);
  let charIndex = 0;

  return (
    <>
      {FLAT_VARIANTS.has(variant) ? null : (
        <div
          aria-hidden="true"
          className={cn(staggerButtonBgVariants({ variant }), bgClassName)}
        />
      )}
      <span
        aria-hidden={text ? true : undefined}
        className={cn(staggerButtonTextVariants(), textClassName)}
      >
        {words.map((word, wordIndex) => (
          <Fragment key={`${word}-${wordIndex}`}>
            {wordIndex > 0 ? (
              <span className="shrink-0 whitespace-pre"> </span>
            ) : null}
            <span
              className={cn(staggerButtonCharsVariants(), charsClassName)}
              data-button-animate-chars=""
            >
              {stagger === "text" ? (
                <span
                  className={cn(staggerButtonCharVariants(), charClassName)}
                >
                  {word}
                </span>
              ) : (
                [...word].map((char, index) => (
                  <span
                    className={cn(staggerButtonCharVariants(), charClassName)}
                    key={`${char}-${index}`}
                    style={{
                      transitionDelay: `${charIndex++ * staggerDelay}s`,
                    }}
                  >
                    {char}
                  </span>
                ))
              )}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}

function StaggerButton({
  asChild = false,
  variant = "default",
  size = "default",
  stagger = "char",
  staggerDelay = 0.01,
  label,
  children,
  className,
  bgClassName,
  textClassName,
  charsClassName,
  charClassName,
  href,
  ref,
  "aria-label": ariaLabel,
  ...props
}: StaggerButtonProps & {
  ref?: Ref<HTMLAnchorElement>;
}) {
  const text = getButtonLabel(asChild, children, label);
  const resolvedVariant = variant ?? "default";
  const rootClassName = cn(
    buttonVariants({ variant, size }),
    staggerButtonVariants({ withBg: !FLAT_VARIANTS.has(resolvedVariant) }),
    className
  );
  const animatedLabel = (
    <StaggerAnimatedLabel
      bgClassName={bgClassName}
      charClassName={charClassName}
      charsClassName={charsClassName}
      stagger={stagger}
      staggerDelay={staggerDelay}
      text={text}
      textClassName={textClassName}
      variant={resolvedVariant}
    />
  );

  if (asChild) {
    if (!isValidElement(children)) {
      return null;
    }

    const {
      ref: childRef,
      className: childClassName,
      "aria-label": childAriaLabel,
      ...childProps
    } = children.props as {
      ref?: Ref<HTMLElement>;
      className?: string;
      "aria-label"?: string;
    };

    return cloneElement(
      children,
      {
        ...childProps,
        ...props,
        "aria-label": ariaLabel ?? childAriaLabel ?? (text || undefined),
        className: cn(childClassName, rootClassName),
        ref: mergeRefs(childRef, ref),
      } as Record<string, unknown>,
      animatedLabel
    );
  }

  return (
    <a
      aria-label={ariaLabel ?? (text || undefined)}
      className={rootClassName}
      href={href}
      ref={ref}
      {...props}
    >
      {animatedLabel}
    </a>
  );
}

export {
  StaggerButton,
  staggerButtonBgVariants,
  staggerButtonCharsVariants,
  staggerButtonCharVariants,
  staggerButtonTextVariants,
  staggerButtonVariants,
};

export type StaggerButtonVariant = NonNullable<StaggerButtonProps["variant"]>;
export type StaggerButtonSize = NonNullable<StaggerButtonProps["size"]>;
