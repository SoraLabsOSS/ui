"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  type Easing,
  type MotionStyle,
  motion,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

export interface Testimonial {
  author: {
    name: string;
    role: string;
    /** Avatar image URL, or any ReactNode to render a custom avatar (skips next/image). */
    avatar: ReactNode | string;
  };
  id: string;
  text: string;
}

export interface InlineTestimonialsClassNames {
  /** Merged onto the avatar wrapper. */
  avatar?: string;
  /** Merged onto each testimonial `<span>`. */
  item?: string;
  /** Merged onto the hover label container. */
  label?: string;
  /** Merged onto the author name label. */
  name?: string;
  /** Merged onto the author role label. */
  role?: string;
  /** Merged onto the root element. */
  root?: string;
}

export interface InlineTestimonialsAlternateConfig {
  /** Opacity applied to every other (odd-indexed) item. @default 0.7 */
  opacity?: number;
  /** Toggles the alternating opacity pattern across items. @default true */
  pattern?: boolean;
}

export interface InlineTestimonialsLabelConfig {
  /** CSS color for the author name text. @default "#f97316" */
  accentColor?: string;
  /** Easing for the reveal/exit animation. @default "easeOut" */
  ease?: Easing;
  /** Font size of the author name, in pixels. @default 12 */
  nameFontSize?: number;
  /** Horizontal offset from the avatar's left edge, in pixels. @default avatarSize / 2 */
  offsetX?: number;
  /** Vertical offset above the avatar. @default "150%" */
  offsetY?: string;
  /** CSS color for the author role text. @default "var(--muted-foreground, #6b7280)" */
  roleColor?: string;
  /** Font size of the author role, in pixels. @default 9 */
  roleFontSize?: number;
  /** Letter spacing of the author role text. @default "0.1em" */
  roleLetterSpacing?: string;
  /** Uppercase the author role text. @default true */
  roleUppercase?: boolean;
  /** Horizontal slide distance (px) for the reveal/exit animation. @default -6 */
  slideX?: number;
  /** Duration of the reveal/exit animation, in seconds. @default 0.16 */
  transitionDuration?: number;
}

export interface InlineTestimonialsProps {
  /** Alternating opacity pattern applied across items. */
  alternate?: InlineTestimonialsAlternateConfig;
  /** Avatar diameter in pixels. @default 32 */
  avatarSize?: number;
  /** Blur amount applied to non-hovered items in px. @default 5 */
  blurAmount?: number;
  /** Opacity of non-hovered items (0–1). @default 0.25 */
  blurOpacity?: number;
  className?: string;
  /** Class names for individual parts of the component. */
  classNames?: InlineTestimonialsClassNames;
  /** Uncontrolled initial hovered/active testimonial id. */
  defaultHoveredId?: string | null;
  /** Font size in pixels. @default 30 */
  fontSize?: number;
  /** Controlled hovered/active testimonial id. */
  hoveredId?: string | null;
  /** Which interactions reveal the author label. @default "hover" */
  interaction?: "both" | "focus" | "hover";
  /** Styling and motion for the hover-revealed author label. */
  label?: InlineTestimonialsLabelConfig;
  /** Called whenever the hovered/active testimonial id changes (controlled or uncontrolled). */
  onHoveredIdChange?: (id: string | null) => void;
  /** Overrides avatar rendering entirely; receives the testimonial and resolved size. */
  renderAvatar?: (testimonial: Testimonial, size: number) => ReactNode;
  testimonials: Testimonial[];
}

interface ResolvedLabelConfig extends Required<InlineTestimonialsLabelConfig> {}

function resolveLabelConfig(
  avatarSize: number,
  label?: InlineTestimonialsLabelConfig
): ResolvedLabelConfig {
  return {
    accentColor: label?.accentColor ?? "#f97316",
    ease: label?.ease ?? "easeOut",
    nameFontSize: label?.nameFontSize ?? 12,
    offsetX: label?.offsetX ?? avatarSize / 2,
    offsetY: label?.offsetY ?? "150%",
    roleColor: label?.roleColor ?? "var(--muted-foreground, #6b7280)",
    roleFontSize: label?.roleFontSize ?? 9,
    roleLetterSpacing: label?.roleLetterSpacing ?? "0.1em",
    roleUppercase: label?.roleUppercase ?? true,
    slideX: label?.slideX ?? -6,
    transitionDuration: label?.transitionDuration ?? 0.16,
  };
}

interface TestimonialAvatarProps {
  avatarSize: number;
  renderAvatar?: (testimonial: Testimonial, size: number) => ReactNode;
  testimonial: Testimonial;
}

function TestimonialAvatar({
  testimonial,
  avatarSize,
  renderAvatar,
}: TestimonialAvatarProps) {
  if (renderAvatar) {
    return renderAvatar(testimonial, avatarSize);
  }

  if (typeof testimonial.author.avatar !== "string") {
    return testimonial.author.avatar;
  }

  return (
    <Image
      alt={testimonial.author.name}
      height={avatarSize}
      src={testimonial.author.avatar}
      style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: "50%",
        objectFit: "cover",
        display: "block",
      }}
      unoptimized
      width={avatarSize}
    />
  );
}

interface TestimonialLabelProps {
  classNames?: InlineTestimonialsClassNames;
  label: ResolvedLabelConfig;
  prefersReducedMotion: boolean;
  testimonial: Testimonial;
}

function TestimonialLabel({
  testimonial,
  classNames,
  label,
  prefersReducedMotion,
}: TestimonialLabelProps) {
  const labelStyle: MotionStyle = {
    position: "absolute",
    left: label.offsetX,
    bottom: label.offsetY,
    transform: "translateY(-50%)",
    display: "inline-flex",
    flexDirection: "column",
    gap: 3,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    zIndex: 20,
  };
  const slideX = prefersReducedMotion ? 0 : label.slideX;
  const duration = prefersReducedMotion ? 0 : label.transitionDuration;

  return (
    <motion.span
      animate={{ opacity: 1, x: 0 }}
      className={classNames?.label}
      exit={{ opacity: 0, x: slideX }}
      initial={{ opacity: 0, x: slideX }}
      style={labelStyle}
      transition={{ duration, ease: label.ease }}
    >
      <span
        className={classNames?.name}
        style={{
          fontSize: label.nameFontSize,
          fontWeight: 500,
          color: label.accentColor,
          lineHeight: 1.2,
        }}
      >
        {testimonial.author.name}
      </span>
      <span
        className={classNames?.role}
        style={{
          fontSize: label.roleFontSize,
          fontWeight: 500,
          letterSpacing: label.roleLetterSpacing,
          textTransform: label.roleUppercase ? "uppercase" : "none",
          color: label.roleColor,
          lineHeight: 1.2,
        }}
      >
        {testimonial.author.role}
      </span>
    </motion.span>
  );
}

interface TestimonialItemProps {
  allowFocus: boolean;
  allowHover: boolean;
  alternate: Required<InlineTestimonialsAlternateConfig>;
  avatarSize: number;
  blurAmount: number;
  blurOpacity: number;
  classNames?: InlineTestimonialsClassNames;
  index: number;
  isAnyHovered: boolean;
  isHovered: boolean;
  label: ResolvedLabelConfig;
  prefersReducedMotion: boolean;
  renderAvatar?: (testimonial: Testimonial, size: number) => ReactNode;
  setHoveredId: (id: string | null) => void;
  testimonial: Testimonial;
}

function TestimonialItem({
  testimonial,
  index,
  isHovered,
  isAnyHovered,
  allowHover,
  allowFocus,
  alternate,
  blurAmount,
  blurOpacity,
  prefersReducedMotion,
  setHoveredId,
  classNames,
  avatarSize,
  renderAvatar,
  label,
}: TestimonialItemProps) {
  const isDimmed = isAnyHovered && !isHovered;
  const isAlternate = alternate.pattern && index % 2 !== 0;
  const baseOpacity = isAlternate ? alternate.opacity : 1;

  let itemOpacity = baseOpacity;
  if (isDimmed) {
    itemOpacity = blurOpacity;
  } else if (isHovered) {
    itemOpacity = 1;
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover/focus reveal is decorative and progressively enhanced (interaction defaults to "hover"; tabIndex/onFocus only attach when interaction includes "focus")
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: same as above
    <span
      className={classNames?.item}
      onBlur={allowFocus ? () => setHoveredId(null) : undefined}
      onFocus={allowFocus ? () => setHoveredId(testimonial.id) : undefined}
      onMouseEnter={allowHover ? () => setHoveredId(testimonial.id) : undefined}
      onMouseLeave={allowHover ? () => setHoveredId(null) : undefined}
      style={{
        filter:
          isDimmed && !prefersReducedMotion ? `blur(${blurAmount}px)` : "none",
        opacity: itemOpacity,
        transition: prefersReducedMotion
          ? "opacity 0.3s ease"
          : "filter 0.3s ease, opacity 0.3s ease",
        cursor: "default",
      }}
      tabIndex={allowFocus ? 0 : undefined}
    >
      <span
        className={cn("relative inline-block", classNames?.avatar)}
        style={{
          width: avatarSize,
          height: avatarSize,
          verticalAlign: "middle",
          marginRight: 3,
        }}
      >
        <TestimonialAvatar
          avatarSize={avatarSize}
          renderAvatar={renderAvatar}
          testimonial={testimonial}
        />
        <AnimatePresence>
          {isHovered && (
            <TestimonialLabel
              classNames={classNames}
              label={label}
              prefersReducedMotion={prefersReducedMotion}
              testimonial={testimonial}
            />
          )}
        </AnimatePresence>
      </span>
      <span>
        {testimonial.text}{" "}
        <span className="sr-only">
          — {testimonial.author.name}, {testimonial.author.role}
        </span>{" "}
      </span>
    </span>
  );
}

export function InlineTestimonials({
  testimonials,
  blurAmount = 5,
  blurOpacity = 0.25,
  avatarSize = 32,
  fontSize = 30,
  alternate,
  interaction = "hover",
  hoveredId: controlledHoveredId,
  defaultHoveredId = null,
  onHoveredIdChange,
  renderAvatar,
  label,
  className,
  classNames,
}: InlineTestimonialsProps) {
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(
    defaultHoveredId
  );
  const prefersReducedMotion = useReducedMotion();

  const isControlled = controlledHoveredId !== undefined;
  const hoveredId = isControlled ? controlledHoveredId : internalHoveredId;

  const setHoveredId = useCallback(
    (id: string | null) => {
      if (!isControlled) {
        setInternalHoveredId(id);
      }
      onHoveredIdChange?.(id);
    },
    [isControlled, onHoveredIdChange]
  );

  const allowHover = interaction === "hover" || interaction === "both";
  const allowFocus = interaction === "focus" || interaction === "both";

  const resolvedAlternate = {
    pattern: alternate?.pattern ?? true,
    opacity: alternate?.opacity ?? 0.7,
  };
  const resolvedLabel = resolveLabelConfig(avatarSize, label);

  return (
    <div
      className={cn("font-medium tracking-tight", classNames?.root, className)}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.35 }}
    >
      {testimonials.map((t, index) => (
        <TestimonialItem
          allowFocus={allowFocus}
          allowHover={allowHover}
          alternate={resolvedAlternate}
          avatarSize={avatarSize}
          blurAmount={blurAmount}
          blurOpacity={blurOpacity}
          classNames={classNames}
          index={index}
          isAnyHovered={hoveredId !== null}
          isHovered={hoveredId === t.id}
          key={t.id}
          label={resolvedLabel}
          prefersReducedMotion={!!prefersReducedMotion}
          renderAvatar={renderAvatar}
          setHoveredId={setHoveredId}
          testimonial={t}
        />
      ))}
    </div>
  );
}
