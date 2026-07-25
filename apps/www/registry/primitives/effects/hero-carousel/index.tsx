// biome-ignore-all lint/performance/noImgElement: Crossfade layers animate opacity/filter/transform imperatively via WAAPI on plain img elements.
// biome-ignore-all lint/correctness/useImageSize: Layers are absolutely positioned and sized via object-fit: contain, not intrinsic dimensions.
"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type ComponentPropsWithoutRef,
  type Ref,
  useEffect,
  useRef,
} from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

const DEFAULT_INTERVAL_MS = 4500;
const CROSSFADE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const OUT_DURATION_MS = 420;
const IN_DURATION_MS = 460;
const IN_DELAY_MS = 60;
/** How long a manual next/prev takes to visually finish out the progress bar before it resets. */
const CATCHUP_DURATION_MS = 220;
/** How long the full bar takes to collapse back to empty before the next cycle starts. */
const SHRINK_DURATION_MS = 220;

export interface HeroCarouselImage {
  /** Accessible label for the image. */
  alt: string;
  /** Image URL. */
  src: string;
}

export interface HeroCarouselClassNames {
  /** Prev/next button classes, layered on top of the defaults. */
  chevron?: string;
  /** Play/pause pill button classes, layered on top of the defaults. */
  pill?: string;
}

export interface HeroCarouselProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Per-slot class overrides: `pill`, `chevron`. */
  classNames?: HeroCarouselClassNames;
  /** Images cycled through, in order. Fewer than 2 renders a single static image with no controls. */
  images: HeroCarouselImage[];
  /** Index to start on. Clamped into range; defaults to 0. */
  initialIndex?: number;
  /** Milliseconds each image is held before auto-advancing. */
  intervalMs?: number;
  ref?: Ref<HTMLDivElement>;
}

function HeroCarousel({
  className,
  classNames,
  images,
  initialIndex = 0,
  intervalMs = DEFAULT_INTERVAL_MS,
  ref,
  ...props
}: HeroCarouselProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLImageElement | null)[]>([]);
  const pillRef = useRef<HTMLButtonElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const currentElRef = useRef<HTMLSpanElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const total = images.length;
  const startIndex = Math.min(Math.max(initialIndex, 0), total - 1);
  const first = images[startIndex];

  useEffect(() => {
    const stage = stageRef.current;
    const pill = pillRef.current;
    const fill = fillRef.current;
    const prevBtn = prevRef.current;
    const nextBtn = nextRef.current;
    const currentEl = currentElRef.current;
    const layers = layerRefs.current;

    if (
      !(stage && pill && fill && prevBtn && nextBtn && currentEl) ||
      total < 2 ||
      !(layers[0] && layers[1])
    ) {
      return;
    }

    const layer0 = layers[0];
    const layer1 = layers[1];

    // Preload every image so transitions never wait on the network.
    for (const image of images) {
      const pre = new Image();
      pre.src = image.src;
    }

    let current = startIndex;
    let active = 0; // index into [layer0, layer1] that is currently shown
    let playing = true;
    let crossfades: Animation[] = [];
    let progressAnim: Animation | null = null;
    // "growing": progressAnim is the real intervalMs countdown, so its
    // currentTime maps to a progress ratio. "transition": progressAnim is a
    // short catch-up/shrink flourish — currentTime is on that anim's own
    // short timeline, not intervalMs, so it must never be read as a ratio.
    let progressPhase: "growing" | "idle" | "transition" = "idle";
    let destroyed = false;

    const applyResting = () => {
      const top = active === 0 ? layer0 : layer1;
      const bottom = active === 0 ? layer1 : layer0;
      top.style.opacity = "1";
      top.style.filter = "none";
      top.style.transform = "none";
      top.style.zIndex = "2";
      bottom.style.opacity = "0";
      bottom.style.filter = "none";
      bottom.style.transform = "none";
      bottom.style.zIndex = "1";
    };

    const cancelCrossfades = () => {
      for (const a of crossfades) {
        try {
          a.cancel();
        } catch {
          /* noop */
        }
      }
      crossfades = [];
    };

    const updateCount = () => {
      currentEl.textContent = String(current + 1);
    };

    /** Blur-and-scale crossfade between the outgoing and incoming layers. */
    const startCrossfade = (out: HTMLImageElement, inc: HTMLImageElement) => {
      inc.style.opacity = "0";

      const outAnim = out.animate(
        [
          { filter: "blur(0px)", opacity: 1, transform: "scale(1)" },
          { filter: "blur(10px)", opacity: 0, transform: "scale(0.94)" },
        ],
        {
          duration: OUT_DURATION_MS,
          easing: CROSSFADE_EASING,
          fill: "forwards",
        }
      );

      // The incoming image blurs in and scales up shortly after the
      // outgoing one begins to leave.
      const incAnim = inc.animate(
        [
          { filter: "blur(10px)", opacity: 0, transform: "scale(0.94)" },
          { filter: "blur(0px)", opacity: 1, transform: "scale(1)" },
        ],
        {
          delay: IN_DELAY_MS,
          duration: IN_DURATION_MS,
          easing: CROSSFADE_EASING,
          fill: "forwards",
        }
      );

      crossfades = [outAnim, incAnim];
    };

    const go = (target: number) => {
      const next = ((target % total) + total) % total;
      if (next === current) {
        return;
      }

      // Interruptible: settle whatever is mid-flight before starting anew.
      cancelCrossfades();
      applyResting();

      const out = active === 0 ? layer0 : layer1;
      const inc = active === 0 ? layer1 : layer0;
      const image = images[next];
      if (!image) {
        return;
      }

      inc.src = image.src;
      inc.alt = image.alt;
      out.style.zIndex = "1";
      inc.style.zIndex = "2";

      if (prefersReducedMotion) {
        inc.style.opacity = "1";
        out.style.opacity = "0";
      } else {
        startCrossfade(out, inc);
      }

      active = active === 0 ? 1 : 0;
      current = next;
      updateCount();
    };

    /**
     * Collapses the full bar back to empty, anchored on the right — the
     * mirror image of the left-anchored fill — instead of snapping straight
     * to 0, then hands off to `onDone` to start the next cycle.
     */
    const shrinkProgress = (onDone: () => void) => {
      if (prefersReducedMotion) {
        progressPhase = "idle";
        fill.style.transform = "scaleX(0)";
        onDone();
        return;
      }

      progressPhase = "transition";
      fill.style.transformOrigin = "right";
      const shrinkAnim = fill.animate(
        [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
        { duration: SHRINK_DURATION_MS, easing: "ease-in", fill: "forwards" }
      );
      progressAnim = shrinkAnim;
      shrinkAnim.onfinish = () => {
        fill.style.transformOrigin = "";
        if (destroyed) {
          return;
        }
        onDone();
      };
    };

    const startProgress = () => {
      if (progressAnim) {
        // Clear onfinish first: cancel() never fires it, but this rules out
        // any stray callback from a not-yet-settled prior animation.
        progressAnim.onfinish = null;
        progressAnim.cancel();
      }
      // Force the visual reset synchronously — shrinkProgress already leaves
      // the bar at scaleX(0), this covers the paths that skip it.
      fill.style.transform = "scaleX(0)";
      fill.style.transformOrigin = "";

      if (prefersReducedMotion) {
        // No visible countdown; just schedule advances on a timer-like anim.
        progressPhase = "idle";
        progressAnim = fill.animate([{ opacity: 0 }, { opacity: 0 }], {
          duration: intervalMs,
        });
      } else {
        progressPhase = "growing";
        progressAnim = fill.animate(
          [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
          { duration: intervalMs, easing: "linear", fill: "forwards" }
        );
      }
      progressAnim.onfinish = () => {
        if (destroyed || !playing) {
          return;
        }
        shrinkProgress(() => {
          if (destroyed || !playing) {
            return;
          }
          go(current + 1);
          startProgress();
        });
      };
    };

    const resetProgress = () => {
      progressAnim?.cancel();
      progressAnim = null;
      progressPhase = "idle";
      fill.style.transform = "scaleX(0)";
      fill.style.transformOrigin = "";
    };

    /**
     * Manual next/prev: smoothly finish the bar out to full instead of
     * snapping, shrink it back to empty, then hand off to `onDone` (which
     * restarts the countdown). Only reads a live progress ratio while a real
     * countdown ("growing") is running — if a click lands mid catch-up/shrink
     * flourish, that animation's own short currentTime is meaningless as a
     * fraction of intervalMs, so treat it as already full instead.
     */
    const completeProgress = (onDone: () => void) => {
      const anim = progressAnim;
      let ratio = 1;
      if (progressPhase === "growing" && anim) {
        const elapsed =
          typeof anim.currentTime === "number" ? anim.currentTime : intervalMs;
        ratio = Math.min(1, Math.max(0, elapsed / intervalMs));
      }
      if (anim) {
        anim.onfinish = null;
        anim.cancel();
      }
      // Normalize origin in case we interrupted a mid-flight shrink.
      fill.style.transformOrigin = "";

      if (prefersReducedMotion) {
        progressPhase = "idle";
        fill.style.transform = "scaleX(0)";
        onDone();
        return;
      }

      if (ratio >= 1) {
        fill.style.transform = "scaleX(1)";
        shrinkProgress(onDone);
        return;
      }

      progressPhase = "transition";
      const catchUp = fill.animate(
        [{ transform: `scaleX(${ratio})` }, { transform: "scaleX(1)" }],
        { duration: CATCHUP_DURATION_MS, easing: "ease-out", fill: "forwards" }
      );
      progressAnim = catchUp;
      catchUp.onfinish = () => {
        if (destroyed) {
          return;
        }
        shrinkProgress(onDone);
      };
    };

    const setPlayingState = (value: boolean) => {
      playing = value;
      pill.classList.toggle("is-paused", !value);
      pill.setAttribute("aria-pressed", String(!value));
      pill.setAttribute(
        "aria-label",
        value ? "Pause slideshow" : "Play slideshow"
      );
    };

    const play = () => {
      if (playing) {
        return;
      }
      setPlayingState(true);
      if (progressAnim && progressAnim.playState === "paused") {
        progressAnim.play();
      } else {
        startProgress();
      }
    };

    const pause = () => {
      if (!playing) {
        return;
      }
      setPlayingState(false);
      progressAnim?.pause();
    };

    const togglePlay = () => {
      if (playing) {
        pause();
      } else {
        play();
      }
    };

    const step = (delta: number) => {
      go(current + delta);
      if (playing) {
        completeProgress(() => {
          if (!destroyed && playing) {
            startProgress();
          }
        });
      } else {
        resetProgress();
      }
    };

    const onStageClick = () => step(1);
    const onPrev = (e: Event) => {
      e.stopPropagation();
      step(-1);
    };
    const onNext = (e: Event) => {
      e.stopPropagation();
      step(1);
    };
    const onPill = (e: Event) => {
      e.stopPropagation();
      togglePlay();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    };

    const onVisibility = () => {
      if (!playing) {
        return;
      }
      if (document.hidden) {
        progressAnim?.pause();
      } else {
        progressAnim?.play();
      }
    };

    stage.addEventListener("click", onStageClick);
    prevBtn.addEventListener("click", onPrev);
    nextBtn.addEventListener("click", onNext);
    pill.addEventListener("click", onPill);
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);

    applyResting();
    updateCount();
    setPlayingState(true);
    startProgress();

    return () => {
      destroyed = true;
      cancelCrossfades();
      progressAnim?.cancel();
      stage.removeEventListener("click", onStageClick);
      prevBtn.removeEventListener("click", onPrev);
      nextBtn.removeEventListener("click", onNext);
      pill.removeEventListener("click", onPill);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [images, intervalMs, prefersReducedMotion, startIndex, total]);

  if (!first) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative block h-[320px] w-full overflow-hidden rounded-[16px] bg-[#292929] max-[480px]:h-[280px]",
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="absolute inset-0 cursor-pointer" ref={stageRef}>
        <img
          alt={first.alt}
          className="absolute inset-0 size-full select-none object-contain [backface-visibility:hidden] [will-change:opacity,transform,filter]"
          decoding="async"
          draggable={false}
          loading="eager"
          ref={(el) => {
            layerRefs.current[0] = el;
          }}
          src={first.src}
        />
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full select-none object-contain [backface-visibility:hidden] [will-change:opacity,transform,filter]"
          decoding="async"
          draggable={false}
          loading="lazy"
          ref={(el) => {
            layerRefs.current[1] = el;
          }}
          src={first.src}
        />
      </div>

      {total > 1 && (
        <div className="pointer-events-none absolute inset-x-4 top-4 z-3 flex items-center justify-between">
          <button
            aria-label="Pause slideshow"
            aria-pressed="false"
            className={cn(
              "group pointer-events-auto relative inline-flex h-[26px] items-center overflow-hidden rounded-full border-0 bg-[#3e3e3e] px-2.5 font-[inherit] text-white text-xs leading-none transition-colors duration-200 [-webkit-tap-highlight-color:transparent] [transition-timing-function:ease]",
              "hover:bg-[#4a4a4a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2",
              classNames?.pill
            )}
            ref={pillRef}
            type="button"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 z-0 origin-left bg-white/[0.18]"
              ref={fillRef}
              style={{ transform: "scaleX(0)" }}
            />
            <span className="relative z-1 inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="relative inline-block size-[11px] shrink-0"
              >
                <span className="absolute inset-0 bg-white transition-[clip-path] duration-150 [clip-path:polygon(18.75%_12.5%,37.5%_12.5%,37.5%_87.5%,18.75%_87.5%)] [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none group-[.is-paused]:[clip-path:polygon(25%_12.5%,56.25%_31.25%,56.25%_68.75%,25%_87.5%)]" />
                <span className="absolute inset-0 bg-white transition-[clip-path] duration-150 [clip-path:polygon(62.5%_12.5%,81.25%_12.5%,81.25%_87.5%,62.5%_87.5%)] [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none group-[.is-paused]:[clip-path:polygon(56.25%_31.25%,87.5%_50%,87.5%_50%,56.25%_68.75%)]" />
              </span>
              <span className="hidden pt-px tabular-nums tracking-[0.02em]">
                <span ref={currentElRef}>1</span>/<span>{total}</span>
              </span>
            </span>
          </button>

          <span className="pointer-events-none inline-flex items-center gap-1.5">
            <button
              aria-label="Previous image"
              className={cn(
                "pointer-events-auto inline-flex size-[26px] items-center justify-center rounded-full border-0 bg-[#3e3e3e] text-white transition-colors duration-200 [-webkit-tap-highlight-color:transparent] [transition-timing-function:ease] hover:bg-[#4a4a4a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2",
                classNames?.chevron
              )}
              ref={prevRef}
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="14"
                viewBox="0 0 14 14"
                width="14"
              >
                <path
                  d="M8.5 3L4.5 7l4 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </button>

            <button
              aria-label="Next image"
              className={cn(
                "pointer-events-auto inline-flex size-[26px] items-center justify-center rounded-full border-0 bg-[#3e3e3e] text-white transition-colors duration-200 [-webkit-tap-highlight-color:transparent] [transition-timing-function:ease] hover:bg-[#4a4a4a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2",
                classNames?.chevron
              )}
              ref={nextRef}
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="14"
                viewBox="0 0 14 14"
                width="14"
              >
                <path
                  d="M5.5 3l4 4-4 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

export { HeroCarousel };
