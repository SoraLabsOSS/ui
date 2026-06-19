"use client";

import { getMotionComponent } from "@workspace/ui/lib/get-motion-component";
import { cn } from "@workspace/ui/lib/utils";
import { useInView, useReducedMotion } from "motion/react";
import React, { type ElementType, useMemo, useRef } from "react";

export interface TextShimmerProps {
  as?: ElementType;
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
}

function TextShimmerComponent({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { margin: "0px" });
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = isInView && !prefersReducedMotion;
  const MotionComponent = getMotionComponent(Component);

  const dynamicSpread = useMemo(
    () => children.length * spread,
    [children, spread]
  );

  return (
    <MotionComponent
      animate={{ backgroundPosition: "0% center" }}
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text",
        "text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
        "dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]",
        className
      )}
      initial={{ backgroundPosition: "100% center" }}
      ref={ref}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          backgroundImage:
            "var(--bg), linear-gradient(var(--base-color), var(--base-color))",
        } as React.CSSProperties
      }
      transition={{
        repeat: shouldAnimate ? Number.POSITIVE_INFINITY : 0,
        duration: shouldAnimate ? duration : 0,
        ease: "linear",
      }}
    >
      {children}
    </MotionComponent>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
