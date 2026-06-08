"use client";

import {
  SectionCta,
  type SectionCtaProps,
  type SectionCtaVariant,
} from "@workspace/ui/components/sora-ui/buttons/section-cta";
import { TextScramble } from "@workspace/ui/components/sora-ui/texts/text-scramble";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type MouseEvent,
  useState,
} from "react";

export const SECTION_CTA_SCRAMBLE_DEFAULTS = {
  scrambleDuration: 0.3,
  scrambleHoldDuration: 0.1,
  scrambleSpeed: 0.03,
} as const;

/** Code-like glyph pool for scramble frames (alnum + operators / brackets). */
export const SECTION_CTA_SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>{}[]();:=+-*/%&|^~!?#@$_.,";

const SCRAMBLE_VARIANT_THEME = {
  accent: {
    textClassName: "text-neutral-950",
    scrambleColor: "#ffffff",
  },
  inverted: {
    textClassName: "text-background",
    scrambleColor: "#fb460d",
  },
  outline: {
    textClassName: "text-foreground",
    scrambleColor: "#fb460d",
  },
  ghost: {
    textClassName: "text-foreground",
    scrambleColor: "#fb460d",
  },
} satisfies Record<
  SectionCtaVariant,
  { textClassName: string; scrambleColor: string }
>;

interface ScrambleTimingProps {
  /** Pool of glyphs used while scrambling. @default SECTION_CTA_SCRAMBLE_CHARS */
  characterSet?: string;
  /** Color for characters still scrambling. Defaults per variant. */
  scrambleColor?: string;
  /** TextScramble animation duration in seconds. */
  scrambleDuration?: number;
  /** Seconds to hold scrambled text before reveal. */
  scrambleHoldDuration?: number;
  /** TextScramble step interval in seconds. */
  scrambleSpeed?: number;
}

function resolveVariant(
  variant: SectionCtaVariant | null | undefined
): SectionCtaVariant {
  return variant ?? "accent";
}

type SectionCtaScrambleBaseProps = ScrambleTimingProps & {
  label: string;
  variant?: SectionCtaVariant | null;
};

function useScrambleInteraction({
  label,
  variant = "accent",
  characterSet = SECTION_CTA_SCRAMBLE_CHARS,
  scrambleColor,
  scrambleDuration = SECTION_CTA_SCRAMBLE_DEFAULTS.scrambleDuration,
  scrambleSpeed = SECTION_CTA_SCRAMBLE_DEFAULTS.scrambleSpeed,
  scrambleHoldDuration = SECTION_CTA_SCRAMBLE_DEFAULTS.scrambleHoldDuration,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
}: SectionCtaScrambleBaseProps & {
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const theme = SCRAMBLE_VARIANT_THEME[resolveVariant(variant)];

  const interactionHandlers = {
    onBlur: (event: FocusEvent<HTMLElement>) => {
      onBlur?.(event);
      setIsActive(false);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      onFocus?.(event);
      setIsActive(true);
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      onMouseEnter?.(event);
      setIsActive(true);
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      onMouseLeave?.(event);
      setIsActive(false);
    },
  };

  const labelSlot = (
    <TextScramble
      as="span"
      characterSet={characterSet}
      className={theme.textClassName}
      duration={scrambleDuration}
      holdDuration={scrambleHoldDuration}
      scrambleColor={scrambleColor ?? theme.scrambleColor}
      speed={scrambleSpeed}
      trigger={isActive}
      triggerOnHover={false}
    >
      {label}
    </TextScramble>
  );

  return { interactionHandlers, labelSlot };
}

export type SectionCtaScrambleProps = Omit<
  SectionCtaProps,
  "asChild" | "children" | "labelSlot" | "variant"
> &
  ScrambleTimingProps & {
    label: string;
    variant?: SectionCtaVariant;
  };

export function SectionCtaScramble({
  label,
  variant = "accent",
  characterSet,
  scrambleColor,
  scrambleDuration,
  scrambleSpeed,
  scrambleHoldDuration,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  ...props
}: SectionCtaScrambleProps) {
  const { interactionHandlers, labelSlot } = useScrambleInteraction({
    label,
    variant,
    characterSet,
    scrambleColor,
    scrambleDuration,
    scrambleSpeed,
    scrambleHoldDuration,
    onBlur: onBlur as (event: FocusEvent<HTMLElement>) => void,
    onFocus: onFocus as (event: FocusEvent<HTMLElement>) => void,
    onMouseEnter: onMouseEnter as (event: MouseEvent<HTMLElement>) => void,
    onMouseLeave: onMouseLeave as (event: MouseEvent<HTMLElement>) => void,
  });

  return (
    <SectionCta
      label={label}
      labelSlot={labelSlot}
      variant={variant}
      {...interactionHandlers}
      {...props}
    />
  );
}

export type SectionCtaScrambleButtonProps = Omit<
  SectionCtaProps,
  "asChild" | "children" | "href" | "labelSlot" | "variant"
> &
  ScrambleTimingProps &
  ComponentPropsWithoutRef<"button"> & {
    label: string;
    variant?: SectionCtaVariant;
  };

export function SectionCtaScrambleButton({
  label,
  variant = "accent",
  characterSet,
  scrambleColor,
  scrambleDuration,
  scrambleSpeed,
  scrambleHoldDuration,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  type = "button",
  ...props
}: SectionCtaScrambleButtonProps) {
  const { interactionHandlers, labelSlot } = useScrambleInteraction({
    label,
    variant,
    characterSet,
    scrambleColor,
    scrambleDuration,
    scrambleSpeed,
    scrambleHoldDuration,
    onBlur: onBlur as (event: FocusEvent<HTMLElement>) => void,
    onFocus: onFocus as (event: FocusEvent<HTMLElement>) => void,
    onMouseEnter: onMouseEnter as (event: MouseEvent<HTMLElement>) => void,
    onMouseLeave: onMouseLeave as (event: MouseEvent<HTMLElement>) => void,
  });

  return (
    <SectionCta
      asChild
      label={label}
      labelSlot={labelSlot}
      variant={variant}
      {...interactionHandlers}
    >
      <button type={type} {...props} />
    </SectionCta>
  );
}
