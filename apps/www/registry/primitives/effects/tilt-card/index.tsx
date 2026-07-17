"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type MotionStyle,
  motion,
  type SpringOptions,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type { MouseEvent, ReactNode, Ref } from "react";

const DEFAULT_ROTATION_FACTOR = 15;
const DEFAULT_PERSPECTIVE = 1000;
const DEFAULT_SCALE_ON_HOVER = 1;
const DEFAULT_GLARE_MAX_OPACITY = 0.05;
const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  stiffness: 150,
  damping: 20,
  mass: 1,
};

export interface TiltCardProps {
  children?: ReactNode;
  /** Additional class names merged onto the tilting card element. */
  className?: string;
  /** Render a light reflection that sweeps across the card as it tilts. @default false */
  glare?: boolean;
  /** Peak opacity of the glare reflection while hovered. @default 0.05 */
  glareMaxOpacity?: number;
  /** Reverse the tilt direction: the hovered corner dips down (pressed) instead of lifting toward the cursor. @default false */
  isReverse?: boolean;
  /** Virtual camera distance in pixels — smaller values exaggerate the 3D effect. @default 1000 */
  perspective?: number;
  ref?: Ref<HTMLDivElement>;
  /** Maximum tilt angle in degrees. @default 15 */
  rotationFactor?: number;
  /** Scale applied to the card while hovered. @default 1 (no scale) */
  scaleOnHover?: number;
  /** Spring options for the tilt/scale motion. @default { stiffness: 150, damping: 20, mass: 1 } */
  springOptions?: SpringOptions;
  /** Inline motion styles merged onto the tilting card element. */
  style?: MotionStyle;
}

export function TiltCard({
  children,
  className,
  glare = false,
  glareMaxOpacity = DEFAULT_GLARE_MAX_OPACITY,
  isReverse = false,
  perspective = DEFAULT_PERSPECTIVE,
  ref,
  rotationFactor = DEFAULT_ROTATION_FACTOR,
  scaleOnHover = DEFAULT_SCALE_ON_HOVER,
  springOptions = DEFAULT_SPRING_OPTIONS,
  style,
}: TiltCardProps) {
  const prefersReducedMotion = useReducedMotion();

  // Normalized mouse position within the card, [-0.5, 0.5] on both axes.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Default direction faces the card toward the cursor (hovered corner
  // lifts up); isReverse makes it dip down instead, like being pressed.
  const rotateX = useSpring(
    useTransform(
      y,
      [-0.5, 0.5],
      isReverse
        ? [rotationFactor, -rotationFactor]
        : [-rotationFactor, rotationFactor]
    ),
    springOptions
  );
  const rotateY = useSpring(
    useTransform(
      x,
      [-0.5, 0.5],
      isReverse
        ? [-rotationFactor, rotationFactor]
        : [rotationFactor, -rotationFactor]
    ),
    springOptions
  );
  const scale = useSpring(1, springOptions);
  const glareOpacity = useSpring(0, springOptions);

  const glareX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(y, [-0.5, 0.5], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255), transparent 65%)`;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseEnter = () => {
    if (prefersReducedMotion) {
      return;
    }
    scale.set(scaleOnHover);
    glareOpacity.set(glareMaxOpacity);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
    glareOpacity.set(0);
  };

  return (
    <div style={{ perspective }}>
      <motion.div
        className={cn("relative", className)}
        data-slot="tilt-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={ref}
        style={{
          transformStyle: "preserve-3d",
          ...style,
          rotateX,
          rotateY,
          scale,
          willChange: "transform",
        }}
      >
        {children}
        {/* Always rendered when enabled (never gated on reduced motion, which
            is unknown during SSR and would mismatch on hydration) — the
            handlers keep its opacity at 0 when reduced motion is preferred. */}
        {glare ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            data-slot="tilt-card-glare"
            style={{
              backgroundImage: glareBackground,
              opacity: glareOpacity,
            }}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
