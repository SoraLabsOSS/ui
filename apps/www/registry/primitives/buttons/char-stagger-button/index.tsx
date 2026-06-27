/** biome-ignore-all lint/suspicious/noArrayIndexKey: Character order is stable for static button labels. */

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  isValidElement,
  type ReactElement,
  type Ref,
  type RefCallback,
  type RefObject,
} from "react";

const charStaggerButtonVariants = cva("group cursor-pointer no-underline", {
  variants: {
    variant: {
      default:
        "relative flex max-w-[12em] flex-grow items-center justify-center rounded-[0.25em] p-[1em] text-[#131313] text-[1em] leading-none",
      link: "relative inline-block text-[1em] text-current leading-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const charStaggerButtonBgVariants = cva(
  "absolute inset-0 rounded-[0.25em] bg-[#efeeec] transition-[inset] duration-[600ms] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:inset-[0.125em] motion-reduce:transition-none motion-reduce:group-hover:inset-0"
);

const charStaggerButtonTextVariants = cva("whitespace-nowrap leading-[1.3]");

const charStaggerButtonCharsVariants = cva(
  "relative inline-block overflow-hidden"
);

const charStaggerButtonCharVariants = cva(
  "relative inline-block translate-y-0 rotate-[0.001deg] transition-transform duration-[600ms] ease-[cubic-bezier(0.625,0.05,0,1)] [text-shadow:0px_1.3em_currentColor] group-hover:-translate-y-[1.3em] group-hover:rotate-[0.001deg] motion-reduce:translate-y-0 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:rotate-[0.001deg]"
);

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: ReactElement })
  | (Base & { asChild?: false | undefined; children?: string });

type CharStaggerButtonBaseProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "children"
> &
  VariantProps<typeof charStaggerButtonVariants> & {
    /** Override the background layer (`default` variant only). */
    bgClassName?: string;
    /** Override each animated character span. */
    charClassName?: string;
    /** Override the animated characters container. */
    charsClassName?: string;
    /** Alternative to string `children` — required when `asChild` child has no string content. */
    label?: string;
    /**
     * Per-character transition delay increment in seconds.
     * @default 0.01
     */
    staggerDelay?: number;
    /** Override the text wrapper. */
    textClassName?: string;
  };

export type CharStaggerButtonProps = WithAsChild<CharStaggerButtonBaseProps>;

interface CharStaggerAnimatedLabelProps {
  bgClassName?: string;
  charClassName?: string;
  charsClassName?: string;
  staggerDelay: number;
  text: string;
  textClassName?: string;
  variant: NonNullable<CharStaggerButtonProps["variant"]>;
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

function CharStaggerAnimatedLabel({
  variant,
  text,
  staggerDelay,
  bgClassName,
  textClassName,
  charsClassName,
  charClassName,
}: CharStaggerAnimatedLabelProps) {
  const characters = [...text];

  return (
    <>
      {variant === "default" ? (
        <div
          aria-hidden="true"
          className={cn(charStaggerButtonBgVariants(), bgClassName)}
        />
      ) : null}
      <span className={cn(charStaggerButtonTextVariants(), textClassName)}>
        <span
          aria-hidden={text ? true : undefined}
          className={cn(charStaggerButtonCharsVariants(), charsClassName)}
          data-button-animate-chars=""
        >
          {characters.map((char, index) => (
            <span
              className={cn(charStaggerButtonCharVariants(), charClassName)}
              key={`${char}-${index}`}
              style={{
                transitionDelay: `${index * staggerDelay}s`,
                ...(char === " " ? { whiteSpace: "pre" } : undefined),
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </span>
    </>
  );
}

function CharStaggerButton({
  asChild = false,
  variant = "default",
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
}: CharStaggerButtonProps & {
  ref?: Ref<HTMLAnchorElement>;
}) {
  const text = getButtonLabel(asChild, children, label);
  const rootClassName = cn(charStaggerButtonVariants({ variant, className }));
  const animatedLabel = (
    <CharStaggerAnimatedLabel
      bgClassName={bgClassName}
      charClassName={charClassName}
      charsClassName={charsClassName}
      staggerDelay={staggerDelay}
      text={text}
      textClassName={textClassName}
      variant={variant ?? "default"}
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
  CharStaggerButton,
  charStaggerButtonBgVariants,
  charStaggerButtonCharsVariants,
  charStaggerButtonCharVariants,
  charStaggerButtonTextVariants,
  charStaggerButtonVariants,
};

export type CharStaggerButtonVariant = NonNullable<
  CharStaggerButtonProps["variant"]
>;
