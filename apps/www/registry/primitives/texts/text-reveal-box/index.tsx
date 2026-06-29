// biome-ignore-all lint: scroll-driven word reveal ported from deadlock-studios
"use client";

import { useGSAP } from "@gsap/react";
import { cn } from "@workspace/ui/lib/utils";
import { type CSSProperties, useMemo, useRef } from "react";

/** Deadlock Studios–style typography and layout preset. Pass via `*ClassName` props. */
export const TEXT_REVEAL_BOX_STUDIO_CLASSES = {
  root: "bg-[#0b0b0b] font-serif text-[#f7f5f0] uppercase",
  sticky: "bg-[#0b0b0b]",
  container: "w-[55%] max-w-[2000px] max-[1000px]:w-[90%]",
  paragraph:
    "mb-8 text-center font-serif text-[clamp(1.5rem,2.5vw,4.5rem)] font-normal leading-none tracking-[-0.02em] max-[1000px]:text-xl",
  word: "font-serif",
  keywordWrapper: "",
  keyword:
    "inline-block h-full w-full rounded-lg py-[0.1rem] text-[#141414] before:absolute before:top-1/2 before:left-1/2 before:-z-10 before:h-[calc(100%+0.4rem)] before:w-[calc(100%+1rem)] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-lg before:content-[''] before:bg-(--kw-color,#f7f5f0)",
} as const;

const STRIP_EDGE_PUNCTUATION_RE = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

/** Default keyword normalizer — strips edge punctuation, preserves casing. */
export function defaultNormalizeWord(word: string): string {
  return word.replace(STRIP_EDGE_PUNCTUATION_RE, "");
}

/** Case-insensitive keyword normalizer (legacy Deadlock Studios behavior). */
export function lowercaseNormalizeWord(word: string): string {
  return defaultNormalizeWord(word).toLowerCase();
}

export interface TextRevealBoxTiming {
  /** Words that overlap in the reveal wave. @default 15 */
  revealOverlap?: number;
  /** Share of scroll progress used for the reveal phase (0–1). @default 0.7 */
  revealPortion?: number;
  /** Fade highlight when scrolling past the reveal phase. @default true */
  reverseOnScroll?: boolean;
  /** Words that overlap in the reverse wave. @default 5 */
  reverseOverlap?: number;
}

export interface TextRevealBoxProps {
  className?: string;
  containerClassName?: string;
  /** Transparent surface for catalog/docs previews (theme-aware highlight flash). */
  embedded?: boolean;
  highlightAlpha?: number;
  highlightBg?: string;
  innerClassName?: string;
  keywordClassName?: string;
  keywordColors?: Record<string, string>;
  keywords?: string[];
  keywordWrapperClassName?: string;
  matchKeyword?: (word: string, keywords: string[]) => boolean;
  normalizeWord?: (word: string) => string;
  paragraphClassName?: string;
  paragraphs?: string[];
  pinDuration?: number;
  /** Scroll container for ScrollTrigger. Defaults to the window. */
  scroller?: Element | Window;
  stickyClassName?: string;
  timing?: TextRevealBoxTiming;
  trackClassName?: string;
  wordClassName?: string;
}

interface ResolvedTiming {
  revealOverlap: number;
  revealPortion: number;
  reverseOnScroll: boolean;
  reverseOverlap: number;
}

interface CachedWord {
  el: HTMLElement;
  textEl: HTMLElement;
}

function cacheWords(track: HTMLElement): CachedWord[] {
  const cached: CachedWord[] = [];

  for (const node of track.querySelectorAll(".trb-word")) {
    const el = node as HTMLElement;
    const textEl = el.firstElementChild;

    if (textEl instanceof HTMLElement) {
      cached.push({ el, textEl });
    }
  }

  return cached;
}

function resolveTiming(timing?: TextRevealBoxTiming): ResolvedTiming {
  return {
    revealPortion: timing?.revealPortion ?? 0.7,
    revealOverlap: timing?.revealOverlap ?? 15,
    reverseOverlap: timing?.reverseOverlap ?? 5,
    reverseOnScroll: timing?.reverseOnScroll ?? true,
  };
}

function readHighlightConfig(
  track: HTMLElement,
  highlightBg: string,
  highlightAlpha?: number
): { alpha: number; rgb: string } {
  const root = track.closest('[data-slot="text-reveal-box"]');
  if (!root) {
    return { rgb: highlightBg, alpha: highlightAlpha ?? 1 };
  }

  const style = getComputedStyle(root);
  const cssRgb = style.getPropertyValue("--trb-highlight-bg").trim();
  const cssAlpha = Number.parseFloat(
    style.getPropertyValue("--trb-highlight-alpha")
  );

  if (cssRgb) {
    return {
      rgb: cssRgb,
      alpha: Number.isFinite(cssAlpha) ? cssAlpha : (highlightAlpha ?? 0.1),
    };
  }

  return { rgb: highlightBg, alpha: highlightAlpha ?? 1 };
}

function lockWordsRevealed(cachedWords: CachedWord[], highlightRgb: string) {
  for (const { el, textEl } of cachedWords) {
    el.style.opacity = "1";
    textEl.style.opacity = "1";
    el.style.backgroundColor = `rgba(${highlightRgb}, 0)`;
  }
}

function updateWords(
  progress: number,
  cachedWords: CachedWord[],
  highlightRgb: string,
  highlightAlpha: number,
  timing: ResolvedTiming
) {
  const totalWords = cachedWords.length;
  if (totalWords === 0) {
    return;
  }

  const { revealPortion, revealOverlap, reverseOverlap, reverseOnScroll } =
    timing;

  if (!reverseOnScroll && progress > revealPortion) {
    lockWordsRevealed(cachedWords, highlightRgb);
    return;
  }

  const revealTimelineScale =
    1 /
    Math.min(
      1 + revealOverlap / totalWords,
      1 + (totalWords - 1) / totalWords + revealOverlap / totalWords
    );
  const reverseTimelineScale =
    1 /
    Math.max(1, (totalWords - 1) / totalWords + reverseOverlap / totalWords);
  const overlapShare = revealOverlap / totalWords;
  const reverseOverlapShare = reverseOverlap / totalWords;

  const inRevealPhase = progress <= revealPortion;
  const revealProgress = inRevealPhase
    ? Math.min(1, progress / revealPortion)
    : 0;
  const reversePortion = 1 - revealPortion;
  const reverseProgress = inRevealPhase
    ? 0
    : (progress - revealPortion) / reversePortion;

  for (let index = 0; index < totalWords; index++) {
    const { el: wordEl, textEl: wordText } = cachedWords[index];

    if (inRevealPhase) {
      const wordStart = index / totalWords;
      const wordEnd = wordStart + overlapShare;
      const adjStart = wordStart * revealTimelineScale;
      const adjEnd = wordEnd * revealTimelineScale;
      const duration = adjEnd - adjStart;
      const wordProgress =
        revealProgress <= adjStart
          ? 0
          : revealProgress >= adjEnd
            ? 1
            : (revealProgress - adjStart) / duration;

      wordEl.style.opacity = String(wordProgress);

      const bgFade = wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
      wordEl.style.backgroundColor = `rgba(${highlightRgb}, ${Math.max(0, (1 - bgFade) * highlightAlpha)})`;

      const textReveal = wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
      wordText.style.opacity = String(Math.pow(textReveal, 0.5));
      continue;
    }

    wordEl.style.opacity = "1";

    const rStart = index / totalWords;
    const rEnd = rStart + reverseOverlapShare;
    const rAdjStart = rStart * reverseTimelineScale;
    const rAdjEnd = rEnd * reverseTimelineScale;
    const rDur = rAdjEnd - rAdjStart;
    const rWordProgress =
      reverseProgress <= rAdjStart
        ? 0
        : reverseProgress >= rAdjEnd
          ? 1
          : (reverseProgress - rAdjStart) / rDur;

    if (rWordProgress > 0) {
      wordText.style.opacity = String(1 - rWordProgress);
      wordEl.style.backgroundColor = `rgba(${highlightRgb}, ${rWordProgress * highlightAlpha})`;
    } else {
      wordText.style.opacity = "1";
      wordEl.style.backgroundColor = `rgba(${highlightRgb}, 0)`;
    }
  }
}

export function TextRevealBox({
  paragraphs = [],
  keywords = [],
  keywordColors = {},
  highlightBg = "237, 235, 231",
  highlightAlpha,
  pinDuration = 4,
  scroller: scrollerProp,
  embedded = false,
  timing: timingProp,
  normalizeWord = lowercaseNormalizeWord,
  matchKeyword,
  className,
  trackClassName,
  stickyClassName,
  innerClassName,
  containerClassName,
  paragraphClassName,
  wordClassName,
  keywordWrapperClassName,
  keywordClassName,
}: TextRevealBoxProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const resolvedTiming = useMemo(
    () => resolveTiming(timingProp),
    [
      timingProp?.revealOverlap,
      timingProp?.revealPortion,
      timingProp?.reverseOnScroll,
      timingProp?.reverseOverlap,
    ]
  );

  const keywordLookup = useMemo(() => {
    if (matchKeyword) {
      return null;
    }

    return new Set(keywords.map((keyword) => normalizeWord(keyword)));
  }, [keywords, matchKeyword, normalizeWord]);

  const isKeyword = (word: string) => {
    if (matchKeyword) {
      return matchKeyword(word, keywords);
    }

    return keywordLookup?.has(normalizeWord(word)) ?? false;
  };

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) {
        return;
      }

      let disposed = false;
      let frameId = 0;
      let scrollTrigger: import("gsap/ScrollTrigger").ScrollTrigger | null =
        null;
      let resizeObserver: ResizeObserver | undefined;

      const mountScrollReveal = async () => {
        const [gsapMod, stMod] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (disposed || !trackRef.current) {
          return;
        }

        const gsap = gsapMod.default ?? gsapMod.gsap;
        const { ScrollTrigger } = stMod;

        gsap.registerPlugin(ScrollTrigger);

        const activeTrack = trackRef.current;
        const cachedWords = cacheWords(activeTrack);
        const { rgb: resolvedHighlight, alpha: resolvedAlpha } =
          readHighlightConfig(activeTrack, highlightBg, highlightAlpha);

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          updateWords(
            1,
            cachedWords,
            resolvedHighlight,
            resolvedAlpha,
            resolvedTiming
          );
          return;
        }

        const scroller = scrollerProp ?? window;

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });

        if (disposed || !trackRef.current) {
          return;
        }

        scrollTrigger = ScrollTrigger.create({
          trigger: activeTrack,
          scroller,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            updateWords(
              self.progress,
              cachedWords,
              resolvedHighlight,
              resolvedAlpha,
              resolvedTiming
            );
          },
        });

        if (scroller instanceof HTMLElement) {
          resizeObserver = new ResizeObserver(() => {
            ScrollTrigger.refresh();
          });
          resizeObserver.observe(scroller);
        }

        ScrollTrigger.refresh();
        scrollTrigger.refresh();
      };

      frameId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          void mountScrollReveal();
        });
      });

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        resizeObserver?.disconnect();
        scrollTrigger?.kill();
        scrollTrigger = null;
      };
    },
    {
      scope: trackRef,
      dependencies: [
        paragraphs,
        keywords,
        highlightBg,
        highlightAlpha,
        pinDuration,
        scrollerProp,
        resolvedTiming,
      ],
    }
  );

  const rootStyle = {
    "--trb-pin-duration": pinDuration,
  } as CSSProperties;

  return (
    <section
      className={cn(
        "antialiased [-webkit-tap-highlight-color:transparent]",
        embedded
          ? "bg-transparent text-foreground [--trb-highlight-alpha:0.14] [--trb-highlight-bg:0,0,0] dark:[--trb-highlight-alpha:0.12] dark:[--trb-highlight-bg:255,255,255]"
          : "bg-background text-foreground",
        className
      )}
      data-slot="text-reveal-box"
      style={rootStyle}
    >
      <div
        className={cn(
          "relative z-0 w-full",
          "h-[calc(var(--trb-pin-duration)*100svh)]",
          "max-lg:h-[calc(var(--trb-pin-duration)*100dvh)]",
          "@/preview:h-[calc(var(--trb-pin-duration)*100cqh)]",
          trackClassName
        )}
        ref={trackRef}
      >
        <div
          className={cn(
            "sticky top-0 flex h-svh w-full overflow-hidden p-8",
            "max-lg:h-dvh",
            "@/preview:h-[100cqh]",
            embedded ? "bg-transparent" : "bg-background",
            stickyClassName
          )}
        >
          <div
            className={cn(
              "flex h-full w-full items-center justify-center text-center",
              innerClassName
            )}
          >
            <div className="w-full">
              <div
                className={cn(
                  "relative mx-auto h-full w-full max-w-3xl p-3",
                  containerClassName
                )}
              >
                {paragraphs.map((para, pi) => (
                  <p
                    className={cn("mb-6 text-pretty", paragraphClassName)}
                    key={pi}
                  >
                    {para
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((word, wi) => {
                        const keyword = isKeyword(word);
                        const color = keywordColors[normalizeWord(word)];
                        return (
                          <span
                            className={cn(
                              "trb-word relative inline-block rounded-lg p-[0.1rem_0.2rem] align-top leading-none opacity-0 will-change-[background-color,opacity]",
                              "mb-[0.2rem] mr-[0.2rem] max-[1000px]:mb-[0.15rem] max-[1000px]:mr-[0.1rem]",
                              wordClassName,
                              keyword &&
                                cn(
                                  "mt-0 mb-[0.2rem] ml-[0.2rem] mr-[0.4rem] max-[1000px]:mb-[0.1rem] max-[1000px]:ml-[0.1rem] max-[1000px]:mr-[0.2rem]",
                                  keywordWrapperClassName
                                )
                            )}
                            key={wi}
                          >
                            <span
                              className={cn(
                                "relative leading-none opacity-0",
                                keyword && keywordClassName
                              )}
                              style={
                                keyword && color
                                  ? ({ "--kw-color": color } as CSSProperties)
                                  : undefined
                              }
                            >
                              {word}
                            </span>
                          </span>
                        );
                      })}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
