// biome-ignore-all lint: scroll-driven word reveal ported from deadlock-studios
"use client";

import { useGSAP } from "@gsap/react";
import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type CSSProperties, useMemo, useRef } from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";
import {
  isWindowScroller,
  observeWindowResize,
  waitForScrollerReady,
} from "@/registry/lib/scroll-trigger-utils";

gsap.registerPlugin(ScrollTrigger);

function getScrollerHeight(scroller: Element | Window): number {
  if (isWindowScroller(scroller)) {
    return window.innerHeight;
  }

  return (scroller as HTMLElement).clientHeight;
}

/** Deadlock Studios–style typography and layout preset — used by `variant="studio"`. */
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

export type TextRevealBoxVariant = "minimal" | "studio";

/** Structural-only preset for `variant="minimal"`. Override slots via the `classNames` prop. */
export const TEXT_REVEAL_BOX_MINIMAL_CLASSES = {
  root: "",
  sticky: "",
  container: "",
  paragraph: "",
  word: "",
  keywordWrapper: "",
  keyword: "",
} as const;

const STRIP_EDGE_PUNCTUATION_RE = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

const FULL_PAGE_PIN_LAYOUT =
  "relative h-svh w-full overflow-hidden p-8 max-lg:h-dvh";

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

export interface TextRevealBoxClassNames {
  /** Width container (default `max-w-3xl`). */
  container?: string;
  /** Flex center wrapper. */
  inner?: string;
  /** Keyword pill span (`before:` utilities). */
  keyword?: string;
  /** Extra classes on keyword words. */
  keywordWrapper?: string;
  /** Each `<p>` block. */
  paragraph?: string;
  /** Pinned viewport surface (legacy slot name from the CSS-sticky version). */
  sticky?: string;
  /** Scroll track (embedded) or pinned section (full page). */
  track?: string;
  /** `.trb-word` wrapper — preserve spacing if overriding. */
  word?: string;
}

export interface TextRevealBoxProps {
  className?: string;
  /** Per-slot class overrides. `cn()` merges after built-ins. */
  classNames?: TextRevealBoxClassNames;
  /**
   * Use container query height (`cqh`) instead of viewport height (`svh/dvh`)
   * for embedded mode. Enable when the component lives inside a
   * `container-type: size` ancestor (e.g. a preview panel).
   * @default false
   */
  containerQuery?: boolean;
  /**
   * Catalog/docs preview — CSS sticky scroll track (no GSAP pin).
   * Full-page usage omits this for Deadlock-style GSAP pin.
   */
  embedded?: boolean;
  highlightAlpha?: number;
  highlightBg?: string;
  keywordColors?: Record<string, string>;
  keywords?: string[];
  /**
   * Custom keyword matcher — overrides the default `keywords` set-membership check.
   * Note: `keywordColors` lookup always uses `normalizeWord(word)` as the key,
   * regardless of this matcher. If your matcher's notion of "the same keyword"
   * diverges from `normalizeWord`, colors may not line up with matched words.
   */
  matchKeyword?: (word: string, keywords: string[]) => boolean;
  normalizeWord?: (word: string) => string;
  paragraphs?: string[];
  /** Scroll-pin length as multiples of the scroller viewport height. @default 4 */
  pinDuration?: number;
  /**
   * GSAP ScrollTrigger refresh priority. Lower numbers refresh later.
   * Set below any pinned section that appears earlier in the DOM to ensure
   * their spacers are re-added before this trigger measures its position.
   * @default -1
   */
  refreshPriority?: number;
  /** Scroll container for ScrollTrigger. Defaults to the window. */
  scroller?: Element | Window;
  timing?: TextRevealBoxTiming;
  /**
   * Visual preset. `studio` applies Deadlock Studios editorial styling;
   * `minimal` uses theme tokens (override via the `classNames` prop).
   * @default "minimal"
   */
  variant?: TextRevealBoxVariant;
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

function cacheWords(root: HTMLElement): CachedWord[] {
  const cached: CachedWord[] = [];

  for (const node of root.querySelectorAll(".trb-word")) {
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

function resolveMinimalRootSurface(embedded: boolean): string {
  return embedded
    ? "bg-transparent text-foreground [--trb-highlight-alpha:0.14] [--trb-highlight-bg:0,0,0] dark:[--trb-highlight-alpha:0.12] dark:[--trb-highlight-bg:255,255,255]"
    : "bg-background text-foreground";
}

function resolveTextRevealBoxClasses(
  variant: TextRevealBoxVariant,
  embedded: boolean,
  className: string | undefined,
  classNames: TextRevealBoxClassNames | undefined
) {
  const preset =
    variant === "studio"
      ? TEXT_REVEAL_BOX_STUDIO_CLASSES
      : TEXT_REVEAL_BOX_MINIMAL_CLASSES;

  const rootSurface =
    variant === "studio" ? preset.root : resolveMinimalRootSurface(embedded);

  return {
    root: cn(
      "antialiased [-webkit-tap-highlight-color:transparent]",
      rootSurface,
      className
    ),
    sticky: cn(preset.sticky, classNames?.sticky),
    container: cn(preset.container, classNames?.container),
    paragraph: cn(preset.paragraph, classNames?.paragraph),
    word: cn(preset.word, classNames?.word),
    keywordWrapper: cn(preset.keywordWrapper, classNames?.keywordWrapper),
    keyword: cn(preset.keyword, classNames?.keyword),
    inner: cn(classNames?.inner),
    track: classNames?.track,
  };
}

function readHighlightConfig(
  root: HTMLElement,
  highlightBg: string,
  highlightAlpha?: number
): { alpha: number; rgb: string } {
  const slot = root.closest('[data-slot="text-reveal-box"]');
  if (!slot) {
    return { rgb: highlightBg, alpha: highlightAlpha ?? 1 };
  }

  const style = getComputedStyle(slot);
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

function getPinScrollDistance(
  scroller: Element | Window,
  pinDuration: number
): number {
  return getScrollerHeight(scroller) * pinDuration;
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

function TextRevealContent({
  paragraphs,
  isKeyword,
  normalizeWord,
  keywordColors,
  containerClassName,
  paragraphClassName,
  wordClassName,
  keywordWrapperClassName,
  keywordClassName,
  innerClassName,
}: {
  paragraphs: string[];
  isKeyword: (word: string) => boolean;
  normalizeWord: (word: string) => string;
  keywordColors: Record<string, string>;
  containerClassName?: string;
  paragraphClassName?: string;
  wordClassName?: string;
  keywordWrapperClassName?: string;
  keywordClassName?: string;
  innerClassName?: string;
}) {
  return (
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
            <p className={cn("mb-6 text-pretty", paragraphClassName)} key={pi}>
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
  );
}

export function TextRevealBox({
  paragraphs = [],
  keywords = [],
  keywordColors = {},
  highlightBg = "237, 235, 231",
  highlightAlpha,
  pinDuration = 4,
  refreshPriority = -1,
  scroller: scrollerProp,
  embedded = false,
  containerQuery = false,
  timing: timingProp,
  normalizeWord = lowercaseNormalizeWord,
  matchKeyword,
  className,
  classNames,
  variant = "minimal",
}: TextRevealBoxProps) {
  const classes = useMemo(
    () => resolveTextRevealBoxClasses(variant, embedded, className, classNames),
    [variant, embedded, className, classNames]
  );

  const pinRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

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

  const contentProps = {
    paragraphs,
    isKeyword,
    normalizeWord,
    keywordColors,
    containerClassName: classes.container,
    paragraphClassName: classes.paragraph,
    wordClassName: classes.word,
    keywordWrapperClassName: classes.keywordWrapper,
    keywordClassName: classes.keyword,
    innerClassName: classes.inner,
  };

  const rootStyle = {
    "--trb-pin-duration": pinDuration,
  } as CSSProperties;

  useGSAP(
    () => {
      const triggerRoot = embedded ? trackRef.current : pinRef.current;
      if (!triggerRoot) {
        return;
      }

      if (embedded && scrollerProp === undefined) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[TextRevealBox] embedded=true requires a `scroller` prop — animation will not mount without it."
          );
        }
        return;
      }

      let disposed = false;
      let scrollTrigger: ScrollTrigger | null = null;
      let resizeObserver: ResizeObserver | undefined;
      let unbindWindowResize: (() => void) | undefined;

      const mountScrollReveal = async () => {
        if (disposed) {
          return;
        }

        const activeTrigger = embedded ? trackRef.current : pinRef.current;
        if (!activeTrigger) {
          return;
        }

        const cachedWords = cacheWords(activeTrigger);
        const { rgb: resolvedHighlight, alpha: resolvedAlpha } =
          readHighlightConfig(activeTrigger, highlightBg, highlightAlpha);

        if (prefersReducedMotion) {
          // updateWords(1, ...) would land past revealPortion, in the
          // reverse-highlight phase — every word ends up covered by a solid
          // highlight block with its text opacity at 0. lockWordsRevealed is
          // the actual "fully revealed, plain readable" end state.
          lockWordsRevealed(cachedWords, resolvedHighlight);
          return;
        }

        // usePrefersReducedMotion() defaults to `true` on first mount, so this
        // effect's first run may have already locked the words fully visible
        // above. Reset to the progress=0 (hidden) state synchronously so
        // there's no stuck "fully revealed" flash while ScrollTrigger mounts.
        updateWords(
          0,
          cachedWords,
          resolvedHighlight,
          resolvedAlpha,
          resolvedTiming
        );

        const scroller = scrollerProp ?? window;
        await waitForScrollerReady(scroller);

        if (disposed) {
          return;
        }

        const currentTrigger = embedded ? trackRef.current : pinRef.current;
        if (!currentTrigger || currentTrigger !== activeTrigger) {
          return;
        }

        const onProgress = (progress: number) => {
          updateWords(
            progress,
            cachedWords,
            resolvedHighlight,
            resolvedAlpha,
            resolvedTiming
          );
        };

        if (embedded) {
          scrollTrigger = ScrollTrigger.create({
            trigger: currentTrigger,
            scroller,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            refreshPriority: -1,
            onUpdate: (self) => {
              onProgress(self.progress);
            },
          });
        } else {
          const pinScrollDistance = getPinScrollDistance(scroller, pinDuration);
          const useWindowPin = isWindowScroller(scroller);

          scrollTrigger = ScrollTrigger.create({
            trigger: currentTrigger,
            pin: currentTrigger,
            scroller,
            start: "top top",
            end: `+=${pinScrollDistance}`,
            pinSpacing: true,
            pinReparent: !useWindowPin,
            invalidateOnRefresh: true,
            refreshPriority,
            onUpdate: (self) => {
              onProgress(self.progress);
            },
          });
        }

        if (scroller instanceof HTMLElement) {
          resizeObserver = new ResizeObserver(() => {
            ScrollTrigger.refresh();
            scrollTrigger?.refresh();
          });
          resizeObserver.observe(scroller);
        } else {
          unbindWindowResize = observeWindowResize(() => {
            ScrollTrigger.refresh();
            scrollTrigger?.refresh();
          });
        }

        ScrollTrigger.refresh();
        scrollTrigger.refresh();
      };

      void mountScrollReveal();

      return () => {
        disposed = true;
        resizeObserver?.disconnect();
        unbindWindowResize?.();
        scrollTrigger?.kill();
        scrollTrigger = null;
      };
    },
    {
      scope: embedded ? trackRef : pinRef,
      dependencies: [
        paragraphs,
        keywords,
        highlightBg,
        highlightAlpha,
        pinDuration,
        refreshPriority,
        scrollerProp,
        resolvedTiming,
        embedded,
        prefersReducedMotion,
      ],
    }
  );

  if (embedded) {
    const trackHeightStyle = (
      containerQuery ? { height: `calc(var(--trb-pin-duration) * 100cqh)` } : {}
    ) as CSSProperties;
    const stickyHeightStyle = (
      containerQuery ? { height: "100cqh" } : {}
    ) as CSSProperties;

    return (
      <section
        className={classes.root}
        data-slot="text-reveal-box"
        style={rootStyle}
      >
        <div
          className={cn(
            "relative z-0 w-full",
            !containerQuery &&
              "h-[calc(var(--trb-pin-duration)*100svh)] max-lg:h-[calc(var(--trb-pin-duration)*100dvh)]",
            classes.track
          )}
          ref={trackRef}
          style={trackHeightStyle}
        >
          <div
            className={cn(
              "sticky top-0 flex w-full overflow-hidden p-8",
              !containerQuery && "h-svh max-lg:h-dvh",
              variant === "minimal" && "bg-transparent",
              classes.sticky
            )}
            style={stickyHeightStyle}
          >
            <TextRevealContent {...contentProps} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        classes.root,
        FULL_PAGE_PIN_LAYOUT,
        classes.sticky,
        classes.track
      )}
      data-slot="text-reveal-box"
      ref={pinRef}
      style={rootStyle}
    >
      <TextRevealContent {...contentProps} />
    </section>
  );
}
