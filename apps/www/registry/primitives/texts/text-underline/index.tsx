"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
} from "react";

const COLOR_PRESETS = {
  currentColor: "currentColor",
  brand: "#fd551d",
  "brand-muted": "#fd8d68",
  gray: "#737373",
} as const;

const HEIGHT_PRESETS = {
  thin: "1px",
  medium: "2px",
  thick: "3px",
} as const;

const DURATION_PRESETS = {
  fast: "0.3s",
  normal: "0.4s",
  slow: "0.6s",
} as const;

const INITIAL_SCALE_PRESETS = {
  "0": "0",
  "25": "0.25",
  "50": "0.5",
  "75": "0.75",
} as const;

const textUnderlineVariants = cva(
  [
    "relative inline-block cursor-pointer pb-1 font-normal text-foreground text-lg leading-[1.4] no-underline antialiased",
    "after:absolute after:bottom-0 after:left-0 after:w-full after:will-change-transform after:content-['']",
    "after:transition-transform after:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:after:transition-none",
    "after:h-[var(--tu-height)] after:bg-[var(--tu-color)] after:duration-[var(--tu-duration)]",
    "after:scale-x-[var(--tu-initial-scale)]",
    "hover:after:scale-x-100 focus-visible:after:scale-x-100",
    "rounded-sm focus-visible:outline-2 focus-visible:outline-[#fd8d68] focus-visible:outline-offset-4",
    "focus:not(:focus-visible):outline-none",
  ],
  {
    variants: {
      anchor: {
        left: [
          "after:origin-right",
          "hover:after:origin-left focus-visible:after:origin-left",
        ],
        center: [
          "after:origin-center",
          "hover:after:origin-center focus-visible:after:origin-center",
        ],
      },
    },
    defaultVariants: {
      anchor: "left",
    },
  }
);

type ColorPreset = keyof typeof COLOR_PRESETS;
type HeightPreset = keyof typeof HEIGHT_PRESETS;
type DurationPreset = keyof typeof DURATION_PRESETS;
type InitialScalePreset = keyof typeof INITIAL_SCALE_PRESETS;

function resolveUnderlineColor(color: string): string {
  if (color in COLOR_PRESETS) {
    return COLOR_PRESETS[color as ColorPreset];
  }

  return color;
}

function resolveUnderlineHeight(height: HeightPreset): string {
  return HEIGHT_PRESETS[height];
}

function resolveDuration(duration: DurationPreset): string {
  return DURATION_PRESETS[duration];
}

function resolveInitialScale(scale: InitialScalePreset): string {
  return INITIAL_SCALE_PRESETS[scale];
}

export interface TextUnderlineProps
  extends Omit<ComponentPropsWithoutRef<"a">, "children">,
    VariantProps<typeof textUnderlineVariants> {
  /** Scale origin for the underline animation. */
  anchor?: "left" | "center";
  children?: ReactNode;
  /**
   * Animation speed preset.
   * @default "normal"
   */
  duration?: DurationPreset;
  /**
   * Initial underline width before hover, as a percentage of the link width.
   * @default "0"
   */
  initialScale?: InitialScalePreset;
  /** Alternative to `children` for demos and controlled previews. */
  label?: string;
  /**
   * Underline color preset or any valid CSS color.
   * @default "currentColor"
   */
  underlineColor?: ColorPreset | (string & {});
  /**
   * Underline thickness preset.
   * @default "thin"
   */
  underlineHeight?: HeightPreset;
}

function TextUnderline({
  anchor = "left",
  children,
  className,
  duration = "normal",
  href = "#",
  initialScale = "0",
  label,
  ref,
  underlineColor = "currentColor",
  underlineHeight = "thin",
  ...props
}: TextUnderlineProps & { ref?: Ref<HTMLAnchorElement> }) {
  const content = children ?? label;

  const style = {
    "--tu-color": resolveUnderlineColor(underlineColor),
    "--tu-duration": resolveDuration(duration),
    "--tu-height": resolveUnderlineHeight(underlineHeight),
    "--tu-initial-scale": resolveInitialScale(initialScale),
  } as CSSProperties;

  return (
    <a
      className={cn(textUnderlineVariants({ anchor, className }))}
      href={href}
      ref={ref}
      style={style}
      {...props}
    >
      {content}
    </a>
  );
}

export { TextUnderline, textUnderlineVariants };
