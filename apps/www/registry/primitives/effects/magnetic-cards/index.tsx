"use client";

import { useGSAP } from "@gsap/react";
import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import Image from "next/image";
import { type ComponentPropsWithoutRef, useMemo, useRef } from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

gsap.registerPlugin(InertiaPlugin);

export interface MagneticCardsItem {
  alt?: string;
  src: string;
}

export interface MagneticCardsLayout {
  rotation: number;
  x: number;
  y: number;
}

export interface MagneticCardsProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Extra classes applied to each card wrapper. */
  cardClassName?: string;
  /** Cards to render, in left-to-right stacking order. */
  items: MagneticCardsItem[];
  /** Rest position/rotation per card. Defaults to an auto-generated symmetric fan matching `items.length`. */
  layout?: MagneticCardsLayout[];
  /** How much a card spins on release, scaled from horizontal cursor speed while hovering it. @default 1.5 */
  rotationVelocityMultiplier?: number;
  /** How far a card flies on release, scaled from cursor speed while hovering it. @default 20 */
  velocityMultiplier?: number;
}

const REMOTE_IMAGE_SRC = /^https?:\/\//;

function isRemoteImageSrc(src: string): boolean {
  return REMOTE_IMAGE_SRC.test(src);
}

const DEFAULTS = {
  rotationVelocityMultiplier: 1.5,
  velocityMultiplier: 20,
} as const;

const LAYOUT_SPACING = 130;
const LAYOUT_ROTATION_STEP = 5;

function createDefaultLayout(count: number): MagneticCardsLayout[] {
  const mid = (count - 1) / 2;
  return Array.from({ length: count }, (_, index) => {
    const offset = index - mid;
    const sign = index % 2 === 0 ? 1 : -1;
    return {
      rotation: offset * LAYOUT_ROTATION_STEP + sign * 2.5,
      x: offset * LAYOUT_SPACING,
      y: sign * 10,
    };
  });
}

function staticCardStyle(rest: MagneticCardsLayout, index: number) {
  return {
    transform: `translate(-50%, -50%) translate(${rest.x}px, ${rest.y}px) rotate(${rest.rotation}deg)`,
    zIndex: index,
  };
}

/** Tracks cursor speed while over a single card and flings it back to rest with GSAP's InertiaPlugin on release — same per-card model as Truus.co's MotionCards. */
function attachCardInertia(
  el: HTMLDivElement,
  rest: MagneticCardsLayout,
  velocityMultiplier: number,
  rotationVelocityMultiplier: number
): () => void {
  let lastX = 0;
  let lastY = 0;
  let speedX = 0;
  let speedY = 0;

  const onMove = (event: MouseEvent) => {
    speedX = event.clientX - lastX;
    speedY = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
  };

  const onEnter = (event: MouseEvent) => {
    speedX = 0;
    speedY = 0;
    lastX = event.clientX;
    lastY = event.clientY;
  };

  const onLeave = () => {
    gsap.to(el, {
      inertia: {
        rotation: {
          end: rest.rotation,
          velocity: speedX * rotationVelocityMultiplier,
        },
        x: { end: rest.x, velocity: speedX * velocityMultiplier },
        y: { end: rest.y, velocity: speedY * velocityMultiplier },
      },
    });
  };

  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseenter", onEnter);
  el.addEventListener("mouseleave", onLeave);

  return () => {
    el.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseenter", onEnter);
    el.removeEventListener("mouseleave", onLeave);
  };
}

function MagneticCards({
  cardClassName,
  className,
  items,
  layout,
  rotationVelocityMultiplier = DEFAULTS.rotationVelocityMultiplier,
  velocityMultiplier = DEFAULTS.velocityMultiplier,
  ...props
}: MagneticCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const resolvedLayout = useMemo(
    () => layout ?? createDefaultLayout(items.length),
    [layout, items.length]
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion) {
        return;
      }

      const cleanups = resolvedLayout.flatMap((rest, index) => {
        const el = cardRefs.current[index];
        if (!el) {
          return [];
        }

        gsap.set(el, {
          rotation: rest.rotation,
          x: rest.x,
          xPercent: -50,
          y: rest.y,
          yPercent: -50,
          zIndex: index,
        });

        return [
          attachCardInertia(
            el,
            rest,
            velocityMultiplier,
            rotationVelocityMultiplier
          ),
        ];
      });

      return () => {
        for (const cleanup of cleanups) {
          cleanup();
        }
      };
    },
    {
      dependencies: [
        items,
        resolvedLayout,
        prefersReducedMotion,
        velocityMultiplier,
        rotationVelocityMultiplier,
      ],
      scope: rootRef,
    }
  );

  return (
    <div className={cn("relative isolate", className)} ref={rootRef} {...props}>
      <div
        className="relative flex h-full w-full items-center justify-center"
        ref={containerRef}
      >
        {items.map((item, index) => {
          const rest = resolvedLayout[index] ?? { rotation: 0, x: 0, y: 0 };
          return (
            <div
              className={cn(
                "absolute top-1/2 left-1/2 aspect-[3/4] w-40 overflow-hidden rounded-xl shadow-xl",
                !prefersReducedMotion && "will-change-transform",
                cardClassName
              )}
              key={item.src}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              style={
                prefersReducedMotion ? staticCardStyle(rest, index) : undefined
              }
            >
              <Image
                alt={item.alt ?? ""}
                className="pointer-events-none object-cover"
                draggable={false}
                fill
                sizes="160px"
                src={item.src}
                unoptimized={isRemoteImageSrc(item.src)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { MagneticCards };
