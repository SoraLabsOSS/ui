"use client";

import { useGSAP } from "@gsap/react";
import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import Image from "next/image";
import { type ComponentPropsWithoutRef, useMemo, useRef } from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

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
  /** Velocity friction applied to each card every frame (0-1). Lower settles faster, higher feels bouncier. @default 0.85 */
  bounceFriction?: number;
  /** Extra classes applied to each card wrapper. */
  cardClassName?: string;
  /** Smooths cursor velocity across frames (0-1). Higher feels smoother, less twitchy. @default 0.75 */
  cursorSmoothing?: number;
  /** Cards to render, in left-to-right stacking order. */
  items: MagneticCardsItem[];
  /** Rest position/rotation per card. Defaults to an auto-generated symmetric fan matching `items.length`. */
  layout?: MagneticCardsLayout[];
  /** How much a pushed card drags its neighbors along, per index step away (0-1). @default 0.2 */
  neighborInfluence?: number;
  /** Cursor distance in pixels within which cards start reacting. @default 500 */
  proximityRadius?: number;
  /** How strongly cursor velocity pushes nearby cards. @default 10 */
  pushForce?: number;
  /** Spring stiffness pulling cards back to their rest position (0-1). @default 0.05 */
  springStiffness?: number;
  /** How much a card tilts relative to how far it's pushed. @default 0.1 */
  tiltAmount?: number;
}

const REMOTE_IMAGE_SRC = /^https?:\/\//;

function isRemoteImageSrc(src: string): boolean {
  return REMOTE_IMAGE_SRC.test(src);
}

const DEFAULTS = {
  bounceFriction: 0.85,
  cursorSmoothing: 0.75,
  neighborInfluence: 0.2,
  proximityRadius: 500,
  pushForce: 10,
  springStiffness: 0.05,
  tiltAmount: 0.1,
} as const;

const LAYOUT_SPACING = 130;
const LAYOUT_ROTATION_STEP = 5;
const MIN_REACTIVE_SPEED = 0.5;

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

interface CardPhysics {
  el: HTMLDivElement;
  r: number;
  restR: number;
  restX: number;
  restY: number;
  vr: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

function staticCardStyle(rest: MagneticCardsLayout, index: number) {
  return {
    transform: `translate(-50%, -50%) translate(${rest.x}px, ${rest.y}px) rotate(${rest.rotation}deg)`,
    zIndex: index,
  };
}

function MagneticCards({
  bounceFriction = DEFAULTS.bounceFriction,
  cardClassName,
  className,
  cursorSmoothing = DEFAULTS.cursorSmoothing,
  items,
  layout,
  neighborInfluence = DEFAULTS.neighborInfluence,
  proximityRadius = DEFAULTS.proximityRadius,
  pushForce = DEFAULTS.pushForce,
  springStiffness = DEFAULTS.springStiffness,
  tiltAmount = DEFAULTS.tiltAmount,
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
      const container = containerRef.current;
      if (!(root && container) || prefersReducedMotion) {
        return;
      }

      const cards: CardPhysics[] = resolvedLayout
        .map((rest, index) => {
          const el = cardRefs.current[index];
          if (!el) {
            return null;
          }

          gsap.set(el, {
            rotation: rest.rotation,
            x: rest.x,
            xPercent: -50,
            y: rest.y,
            yPercent: -50,
            zIndex: index,
          });

          return {
            el,
            r: rest.rotation,
            restR: rest.rotation,
            restX: rest.x,
            restY: rest.y,
            vr: 0,
            vx: 0,
            vy: 0,
            x: rest.x,
            y: rest.y,
          };
        })
        .filter((card): card is CardPhysics => card !== null);

      const cursor = { vx: 0, vy: 0, x: 0, y: 0 };
      let prevCursorX = 0;
      let prevCursorY = 0;

      const handlePointerMove = (event: PointerEvent) => {
        cursor.vx =
          cursor.vx * cursorSmoothing +
          (event.clientX - prevCursorX) * (1 - cursorSmoothing);
        cursor.vy =
          cursor.vy * cursorSmoothing +
          (event.clientY - prevCursorY) * (1 - cursorSmoothing);
        prevCursorX = cursor.x = event.clientX;
        prevCursorY = cursor.y = event.clientY;
      };

      const handlePointerLeave = () => {
        cursor.vx = 0;
        cursor.vy = 0;
      };

      const calculatePushForce = (card: CardPhysics) => {
        const speed = Math.hypot(cursor.vx, cursor.vy);
        if (speed < MIN_REACTIVE_SPEED) {
          return { fx: 0, fy: 0 };
        }

        const rect = container.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 + card.restX;
        const cy = rect.top + rect.height / 2 + card.restY;
        const dist = Math.hypot(cursor.x - cx, cursor.y - cy);

        if (dist > proximityRadius) {
          return { fx: 0, fy: 0 };
        }

        const weight = (1 - dist / proximityRadius) ** 3;

        return {
          fx: cursor.vx * pushForce * weight,
          fy: cursor.vy * pushForce * weight,
        };
      };

      const applyNeighborInfluence = (
        forces: { fx: number; fy: number }[],
        index: number
      ) => {
        let fx = forces[index]?.fx ?? 0;
        let fy = forces[index]?.fy ?? 0;

        for (const [j, force] of forces.entries()) {
          if (j === index) {
            continue;
          }
          const falloff = neighborInfluence ** Math.abs(j - index);
          fx += force.fx * falloff;
          fy += force.fy * falloff * 0.6;
        }

        return { fx, fy };
      };

      const tick = () => {
        const forces = cards.map(calculatePushForce);

        cards.forEach((card, index) => {
          const { fx, fy } = applyNeighborInfluence(forces, index);

          card.vx =
            (card.vx + (card.restX + fx - card.x) * springStiffness) *
            bounceFriction;
          card.vy =
            (card.vy + (card.restY + fy - card.y) * springStiffness) *
            bounceFriction;
          card.vr =
            (card.vr +
              (card.restR + fx * tiltAmount - card.r) * springStiffness) *
            bounceFriction;

          card.x += card.vx;
          card.y += card.vy;
          card.r += card.vr;

          gsap.set(card.el, { rotation: card.r, x: card.x, y: card.y });
        });
      };

      root.addEventListener("pointermove", handlePointerMove);
      root.addEventListener("pointerleave", handlePointerLeave);
      gsap.ticker.add(tick);

      return () => {
        root.removeEventListener("pointermove", handlePointerMove);
        root.removeEventListener("pointerleave", handlePointerLeave);
        gsap.ticker.remove(tick);
      };
    },
    {
      dependencies: [
        items,
        resolvedLayout,
        prefersReducedMotion,
        proximityRadius,
        pushForce,
        tiltAmount,
        neighborInfluence,
        springStiffness,
        bounceFriction,
        cursorSmoothing,
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
