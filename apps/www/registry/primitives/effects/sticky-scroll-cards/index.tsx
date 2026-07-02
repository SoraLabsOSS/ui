// biome-ignore-all lint: GSAP scroll-pinned flip/dismiss cards (registry primitive)
"use client";

import { useGSAP } from "@gsap/react";
import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type CSSProperties, type ReactNode, useMemo, useRef } from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";
import {
  isWindowScroller,
  observeWindowResize,
  waitForScrollerReady,
} from "@/registry/lib/scroll-trigger-utils";

gsap.registerPlugin(ScrollTrigger);

/** Minimal layout defaults — typography and styling via `variant` or the `classNames` prop. */
const LAYOUT = {
  root: "relative h-svh w-full overflow-hidden",
  headline:
    "absolute inset-0 flex items-center justify-center text-center [will-change:transform]",
  cardsLayer:
    "absolute inset-0 h-full w-full overflow-hidden [perspective:1000px] [transform-style:preserve-3d]",
  card: "absolute top-1/2 left-1/2 flex aspect-[4/5] w-1/4 min-w-[300px] -translate-x-1/2 flex-col items-center justify-between rounded-2xl p-8 text-center [backface-visibility:hidden] [will-change:transform]",
  front: "",
  back: "",
  icon: "flex size-16 items-center justify-center rounded-full",
  badge: "rounded-md px-2 py-2 text-xs uppercase",
  title: "font-black text-3xl uppercase leading-[0.85]",
  description: "text-base leading-tight",
} as const;

export type StickyScrollCardsVariant = "minimal" | "studio";

/** Structural-only preset for `variant="minimal"`. Override slots via the `classNames` prop. */
export const STICKY_SCROLL_CARDS_MINIMAL_CLASSES = {
  ...LAYOUT,
  root: cn(LAYOUT.root, "bg-background text-foreground"),
  front: "bg-foreground text-background",
  back: "bg-muted text-foreground",
  icon: "bg-background/20",
  badge: "bg-background/90 text-foreground",
} as const;

/** Codegrid "MaximaTherapy"–style palette, cycled across back cards. */
const STUDIO_PALETTE = [
  { bg: "#fd4400", fg: "#fff" },
  { bg: "#e7ebdf", fg: "#0f0f0f" },
  { bg: "#2668fd", fg: "#fff" },
  { bg: "#fdcb40", fg: "#0f0f0f" },
] as const;

/** Codegrid "MaximaTherapy" editorial layout — used by `variant="studio"`. */
export const STICKY_SCROLL_CARDS_STUDIO_CLASSES = {
  ...LAYOUT,
  root: cn(LAYOUT.root, "bg-[#fbfff2] text-[#0f0f0f]"),
  headline: cn(
    LAYOUT.headline,
    "font-black text-[clamp(3rem,5vw,7rem)] uppercase leading-[0.85]"
  ),
  front: "bg-[#fd4400] text-white",
  back: "",
  icon: "bg-white/90",
  badge: "bg-white text-[#0f0f0f]",
} as const;

function studioCardColor(index: number): { bg: string; fg: string } {
  return STUDIO_PALETTE[index % STUDIO_PALETTE.length];
}

export interface StickyScrollCardsItem {
  description: string;
  icon?: ReactNode;
  title: string;
}

export interface StickyScrollCardsTiming {
  /** Svh of scroll consumed dismissing one card. @default 500 */
  cardDismissDuration?: number;
  /** Svh where the front→back flip triggers. @default 1000 */
  cardFlipTrigger?: number;
  /** Svh where the enter phase finishes (cards/headline settle). @default 500 */
  cardsEnterEnd?: number;
  /** Svh where the flip-eligible window ends and dismissal begins. @default 1500 */
  dismissStart?: number;
  /** Rotation (deg) each back card ends at once fully dismissed, cycled by index. @default [-50, -60, -45, 50] */
  dismissTiltAngles?: number[];
  /** GSAP ease for the flip tween. @default "elastic.out(1,0.5)" */
  flipEase?: string;
  /** Rotation (deg) each back card settles at after the flip, cycled by index. @default [-10, -20, -5, 10] */
  flipTiltAngles?: number[];
}

export interface StickyScrollCardsClassNames {
  back?: string;
  backIcon?: string;
  badge?: string;
  cardsLayer?: string;
  description?: string;
  front?: string;
  frontIcon?: string;
  headline?: string;
  title?: string;
  track?: string;
}

export interface StickyScrollCardsProps {
  /** Front-only pill label (e.g. "Start here"). @default "Start here" */
  badgeLabel?: string;
  /** Back cards — revealed on flip, dismissed one at a time in reverse order. */
  cards: StickyScrollCardsItem[];
  className?: string;
  /** Per-slot class overrides. `cn()` merges after built-ins/variant preset. */
  classNames?: StickyScrollCardsClassNames;
  /**
   * Use container query height (`cqh`) instead of viewport height (`svh/dvh`)
   * for embedded mode. Enable when the component lives inside a
   * `container-type: size` ancestor (e.g. a preview panel).
   * @default false
   */
  containerQuery?: boolean;
  /** Catalog/docs preview — CSS sticky scroll track (no GSAP pin). */
  embedded?: boolean;
  /** Card shown before the flip. */
  front: StickyScrollCardsItem;
  /** Hero headline, scrolls out during the enter phase. */
  headline: string;
  /**
   * GSAP ScrollTrigger refresh priority. Lower numbers refresh later.
   * Set below any pinned section that appears earlier in the DOM to ensure
   * their spacers are re-added before this trigger measures its position.
   * @default -1
   */
  refreshPriority?: number;
  /** Scroll container for ScrollTrigger. Defaults to `window`. */
  scroller?: Element | Window;
  timing?: StickyScrollCardsTiming;
  /**
   * Visual preset. `studio` applies the Codegrid "MaximaTherapy" palette
   * (cycled per back card); `minimal` uses theme tokens (override via the
   * `classNames` prop).
   * @default "minimal"
   */
  variant?: StickyScrollCardsVariant;
}

interface ResolvedTiming {
  cardDismissDuration: number;
  cardFlipTrigger: number;
  cardsEnterEnd: number;
  dismissStart: number;
  dismissTiltAngles: number[];
  flipEase: string;
  flipTiltAngles: number[];
}

const DEFAULT_FLIP_TILT = [-10, -20, -5, 10];
const DEFAULT_DISMISS_TILT = [-50, -60, -45, 50];

function resolveTiming(timing?: StickyScrollCardsTiming): ResolvedTiming {
  return {
    cardsEnterEnd: timing?.cardsEnterEnd ?? 500,
    cardFlipTrigger: timing?.cardFlipTrigger ?? 1000,
    dismissStart: timing?.dismissStart ?? 1500,
    cardDismissDuration: timing?.cardDismissDuration ?? 500,
    flipTiltAngles: timing?.flipTiltAngles ?? DEFAULT_FLIP_TILT,
    dismissTiltAngles: timing?.dismissTiltAngles ?? DEFAULT_DISMISS_TILT,
    flipEase: timing?.flipEase ?? "elastic.out(1,0.5)",
  };
}

function angleAt(angles: number[], index: number): number {
  return angles[index % angles.length];
}

function resolveStickyScrollCardsClasses(
  variant: StickyScrollCardsVariant,
  className: string | undefined,
  classNames: StickyScrollCardsClassNames | undefined
) {
  const preset =
    variant === "studio"
      ? STICKY_SCROLL_CARDS_STUDIO_CLASSES
      : STICKY_SCROLL_CARDS_MINIMAL_CLASSES;

  return {
    root: cn(preset.root, className),
    headline: cn(preset.headline, classNames?.headline),
    cardsLayer: cn(preset.cardsLayer, classNames?.cardsLayer),
    front: cn(LAYOUT.card, preset.front, classNames?.front),
    back: cn(LAYOUT.card, preset.back, classNames?.back),
    frontIcon: cn(LAYOUT.icon, preset.icon, classNames?.frontIcon),
    backIcon: cn(LAYOUT.icon, preset.icon, classNames?.backIcon),
    badge: cn(LAYOUT.badge, preset.badge, classNames?.badge),
    title: cn(LAYOUT.title, classNames?.title),
    description: cn(LAYOUT.description, classNames?.description),
    track: classNames?.track,
  };
}

function getTotalScrollDistanceVh(
  cardCount: number,
  timing: ResolvedTiming
): number {
  return timing.dismissStart + cardCount * timing.cardDismissDuration;
}

interface CardRefs {
  backEls: HTMLElement[];
  frontEl: HTMLElement;
  headlineEl: HTMLElement | null;
}

function setInitialTransforms(refs: CardRefs) {
  gsap.set(refs.frontEl, { rotationY: 0 });
  gsap.set(refs.backEls, { rotationY: -180 });
}

function applyReducedMotionEndState(
  refs: CardRefs,
  cardCount: number,
  timing: ResolvedTiming
) {
  gsap.set(refs.frontEl, { rotationY: 180 });
  for (const [i, el] of refs.backEls.entries()) {
    const dismissOrder = cardCount - 1 - i;
    gsap.set(el, {
      rotation: angleAt(timing.dismissTiltAngles, dismissOrder),
      rotationY: 0,
      y: "-250%",
    });
  }
}

function StickyScrollCard({
  badge,
  card,
  iconClassName,
  itemClassName,
  refCallback,
  style,
  titleClassName,
}: {
  badge?: ReactNode;
  card: StickyScrollCardsItem;
  iconClassName: string;
  itemClassName: string;
  refCallback?: (el: HTMLDivElement | null) => void;
  style?: CSSProperties;
  titleClassName: string;
}) {
  return (
    <div className={itemClassName} ref={refCallback} style={style}>
      <h3 className={titleClassName}>{card.title}</h3>
      {badge}
      {card.icon ? <div className={iconClassName}>{card.icon}</div> : null}
      <p>{card.description}</p>
    </div>
  );
}

export function StickyScrollCards({
  cards,
  front,
  headline,
  badgeLabel = "Start here",
  className,
  classNames,
  variant = "minimal",
  embedded = false,
  containerQuery = false,
  scroller: scrollerProp,
  refreshPriority = -1,
  timing: timingProp,
}: StickyScrollCardsProps) {
  const classes = useMemo(
    () => resolveStickyScrollCardsClasses(variant, className, classNames),
    [variant, className, classNames]
  );
  const resolvedTiming = useMemo(() => resolveTiming(timingProp), [timingProp]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cardCount = cards.length;
  const totalScrollVh = useMemo(
    () => getTotalScrollDistanceVh(cardCount, resolvedTiming),
    [cardCount, resolvedTiming]
  );

  const shouldAnimate = !prefersReducedMotion && cardCount > 0;

  useGSAP(
    () => {
      if (!shouldAnimate) {
        return;
      }

      // Client-only: gsap.ticker touches Date.now() internally, which Next's
      // prerender flags if called at module scope. Without this, GSAP tries
      // to "catch up" after main-thread jank by compressing elapsed time on
      // the next tick — on a pinned, transform-heavy section like this one
      // that reads as a sudden rush/jump into the next card.
      gsap.ticker.lagSmoothing(0);

      const scrollTriggerRoot = embedded
        ? trackRef.current
        : sectionRef.current;
      if (!scrollTriggerRoot) {
        return;
      }

      if (embedded && scrollerProp === undefined) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[StickyScrollCards] embedded=true requires a `scroller` prop — animation will not mount without it."
          );
        }
        return;
      }

      let disposed = false;
      let trigger: ScrollTrigger | null = null;
      let unbindResize: (() => void) | undefined;
      let resizeObserver: ResizeObserver | undefined;

      const mountCards = async () => {
        const section = sectionRef.current;
        const scrollRoot = embedded ? trackRef.current : sectionRef.current;
        const headlineEl = headlineRef.current;
        const frontEl = frontRef.current;
        const backEls = backRefs.current.filter(
          (el): el is HTMLDivElement => el !== null
        );

        if (
          !(section && scrollRoot && frontEl) ||
          backEls.length !== cardCount
        ) {
          return;
        }

        const scroller = scrollerProp ?? window;
        await waitForScrollerReady(scroller);

        if (disposed || sectionRef.current !== section) {
          return;
        }
        if (embedded && trackRef.current !== scrollRoot) {
          return;
        }

        const refs: CardRefs = { frontEl, backEls, headlineEl };
        setInitialTransforms(refs);

        if (prefersReducedMotion) {
          applyReducedMotionEndState(refs, cardCount, resolvedTiming);
          return;
        }

        const svhToProgress = (svh: number) => svh / totalScrollVh;
        const enterEndProgress = svhToProgress(resolvedTiming.cardsEnterEnd);
        const flipTriggerProgress = svhToProgress(
          resolvedTiming.cardFlipTrigger
        );

        const dismissRanges = backEls.map((_, i) => {
          const dismissOrder = cardCount - 1 - i;
          return [
            svhToProgress(
              resolvedTiming.dismissStart +
                dismissOrder * resolvedTiming.cardDismissDuration
            ),
            svhToProgress(
              resolvedTiming.dismissStart +
                (dismissOrder + 1) * resolvedTiming.cardDismissDuration
            ),
          ] as const;
        });

        let isFlipped = false;

        const revealBackCards = () => {
          gsap.to(frontEl, {
            duration: 1,
            ease: resolvedTiming.flipEase,
            rotationY: 180,
          });
          for (const [i, el] of backEls.entries()) {
            gsap.to(el, {
              duration: 1,
              ease: resolvedTiming.flipEase,
              rotationY: 0,
              rotationZ: angleAt(resolvedTiming.flipTiltAngles, i),
            });
          }
        };

        const concealBackCards = () => {
          gsap.to(frontEl, {
            duration: 1,
            ease: resolvedTiming.flipEase,
            rotationY: 0,
          });
          for (const el of backEls) {
            gsap.to(el, {
              duration: 1,
              ease: resolvedTiming.flipEase,
              rotationY: -180,
              rotationZ: 0,
            });
          }
        };

        const onUpdate = (progress: number) => {
          const enterProgress = gsap.utils.clamp(
            0,
            1,
            gsap.utils.mapRange(0, enterEndProgress, 0, 1, progress)
          );

          gsap.set([frontEl, ...backEls], {
            y: `${gsap.utils.mapRange(0, 1, 50, -50, enterProgress)}%`,
          });
          if (headlineEl) {
            gsap.set(headlineEl, {
              y: `${gsap.utils.mapRange(0, 1, 0, -100, enterProgress)}%`,
            });
          }

          if (progress > flipTriggerProgress && !isFlipped) {
            revealBackCards();
            isFlipped = true;
          } else if (progress <= flipTriggerProgress && isFlipped) {
            concealBackCards();
            isFlipped = false;
          }

          for (const [i, el] of backEls.entries()) {
            const [dismissStartP, dismissEndP] = dismissRanges[i];
            const dismissProgress = gsap.utils.clamp(
              0,
              1,
              gsap.utils.mapRange(dismissStartP, dismissEndP, 0, 1, progress)
            );

            gsap.set(el, {
              rotation: gsap.utils.mapRange(
                0,
                1,
                angleAt(resolvedTiming.flipTiltAngles, i),
                angleAt(resolvedTiming.dismissTiltAngles, i),
                dismissProgress
              ),
              y: `${gsap.utils.mapRange(0, 1, -50, -250, dismissProgress)}%`,
            });
          }
        };

        const useWindowPin = isWindowScroller(scroller);

        if (embedded) {
          trigger = ScrollTrigger.create({
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onUpdate: (self) => onUpdate(self.progress),
            refreshPriority: -1,
            scroller,
            scrub: 1,
            start: "top top",
            trigger: scrollRoot,
          });
        } else {
          trigger = ScrollTrigger.create({
            end: `+=${totalScrollVh}vh`,
            invalidateOnRefresh: true,
            onUpdate: (self) => onUpdate(self.progress),
            pin: true,
            pinReparent: !useWindowPin,
            pinSpacing: true,
            refreshPriority,
            scroller,
            scrub: 1,
            start: "top top",
            trigger: section,
          });
        }

        if (scroller instanceof HTMLElement) {
          resizeObserver = new ResizeObserver(() => {
            ScrollTrigger.refresh();
            trigger?.refresh();
          });
          resizeObserver.observe(scroller);
        } else {
          unbindResize = observeWindowResize(() => {
            ScrollTrigger.refresh();
            trigger?.refresh();
          });
        }

        ScrollTrigger.refresh();
        trigger.refresh();
        onUpdate(trigger.progress);
      };

      void mountCards();

      return () => {
        disposed = true;
        resizeObserver?.disconnect();
        unbindResize?.();
        trigger?.kill();
        trigger = null;
      };
    },
    {
      dependencies: [
        cards,
        front,
        headline,
        embedded,
        scrollerProp,
        refreshPriority,
        resolvedTiming,
        totalScrollVh,
        shouldAnimate,
        prefersReducedMotion,
      ],
      scope: embedded ? trackRef : sectionRef,
    }
  );

  const trackStyle = {
    "--ssc-scroll-vh": totalScrollVh,
  } as CSSProperties;

  const cardsSection = (
    <section
      className={cn(
        embedded ? "relative h-full w-full overflow-hidden" : classes.root
      )}
      ref={sectionRef}
    >
      <div className={classes.headline} ref={headlineRef}>
        <h1 className="w-3/5 max-lg:w-[85%]">{headline}</h1>
      </div>

      <div className={classes.cardsLayer}>
        <StickyScrollCard
          badge={<span className={classes.badge}>{badgeLabel}</span>}
          card={front}
          iconClassName={classes.frontIcon}
          itemClassName={cn(classes.front, "z-[1]")}
          refCallback={(el) => {
            frontRef.current = el;
          }}
          titleClassName={classes.title}
        />

        {cards.map((card, index) => (
          <StickyScrollCard
            card={card}
            iconClassName={classes.backIcon}
            itemClassName={classes.back}
            key={card.title}
            refCallback={(el) => {
              backRefs.current[index] = el;
            }}
            style={
              variant === "studio"
                ? {
                    backgroundColor: studioCardColor(index).bg,
                    color: studioCardColor(index).fg,
                  }
                : undefined
            }
            titleClassName={classes.title}
          />
        ))}
      </div>
    </section>
  );

  if (embedded) {
    const trackHeightStyle: CSSProperties = containerQuery
      ? { ...trackStyle, height: "calc(var(--ssc-scroll-vh) * 1cqh)" }
      : trackStyle;
    const stickyHeightStyle: CSSProperties = containerQuery
      ? { height: "100cqh" }
      : {};

    return (
      <div
        className={cn(
          "relative w-full",
          !containerQuery &&
            "h-[calc(var(--ssc-scroll-vh)*1svh)] max-lg:h-[calc(var(--ssc-scroll-vh)*1dvh)]",
          classes.track
        )}
        ref={trackRef}
        style={trackHeightStyle}
      >
        <div
          className={cn(
            "sticky top-0 z-0 w-full overflow-hidden",
            !containerQuery && "h-svh max-lg:h-dvh"
          )}
          style={stickyHeightStyle}
        >
          {cardsSection}
        </div>
      </div>
    );
  }

  return cardsSection;
}
