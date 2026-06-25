// biome-ignore-all lint: scroll-driven word reveal ported from deadlock-studios
"use client";

import "./text-reveal-box-fonts.css";
import "./text-reveal-box.css";

import { type CSSProperties, useEffect, useLayoutEffect, useRef } from "react";
import { resolveScrollRoot } from "@/lib/catalog/resolve-scroll-root";

export interface TextRevealBoxProps {
  highlightBg?: string;
  keywordColors?: Record<string, string>;
  keywords?: string[];
  paragraphs?: string[];
  pinDuration?: number;
}

function readHighlightConfig(
  track: HTMLElement,
  highlightBg: string
): { alpha: number; rgb: string } {
  const root = track.closest(".text-reveal-box-root");
  if (!root) {
    return { rgb: highlightBg, alpha: 1 };
  }

  const style = getComputedStyle(root);
  const cssRgb = style.getPropertyValue("--trb-highlight-bg").trim();
  const cssAlpha = Number.parseFloat(
    style.getPropertyValue("--trb-highlight-alpha")
  );

  if (cssRgb) {
    return {
      rgb: cssRgb,
      alpha: Number.isFinite(cssAlpha) ? cssAlpha : 0.1,
    };
  }

  return { rgb: highlightBg, alpha: 1 };
}

function updateWords(
  progress: number,
  words: Element[],
  totalWords: number,
  highlightRgb: string,
  highlightAlpha: number
) {
  for (const [index, word] of words.entries()) {
    const wordEl = word as HTMLElement;
    const wordText = wordEl.querySelector("span") as HTMLElement | null;
    if (!wordText) {
      continue;
    }

    if (progress <= 0.7) {
      const revealProgress = Math.min(1, progress / 0.7);
      const overlapWords = 15;
      const wordStart = index / totalWords;
      const wordEnd = wordStart + overlapWords / totalWords;
      const timelineScale =
        1 /
        Math.min(
          1 + overlapWords / totalWords,
          1 + (totalWords - 1) / totalWords + overlapWords / totalWords
        );
      const adjStart = wordStart * timelineScale;
      const adjEnd = wordEnd * timelineScale;
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

    const reverseProgress = (progress - 0.7) / 0.3;
    wordEl.style.opacity = "1";

    const reverseOverlap = 5;
    const rStart = index / totalWords;
    const rEnd = rStart + reverseOverlap / totalWords;
    const rScale =
      1 /
      Math.max(1, (totalWords - 1) / totalWords + reverseOverlap / totalWords);
    const rAdjStart = rStart * rScale;
    const rAdjEnd = rEnd * rScale;
    const rDur = rAdjEnd - rAdjStart;
    const rProgress =
      reverseProgress <= rAdjStart
        ? 0
        : reverseProgress >= rAdjEnd
          ? 1
          : (reverseProgress - rAdjStart) / rDur;

    if (rProgress > 0) {
      wordText.style.opacity = String(1 - rProgress);
      wordEl.style.backgroundColor = `rgba(${highlightRgb}, ${rProgress * highlightAlpha})`;
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
  pinDuration = 4,
}: TextRevealBoxProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ReturnType<
    typeof import("gsap/ScrollTrigger").ScrollTrigger.create
  > | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");

      const gsap = gsapMod.default ?? gsapMod.gsap;
      const { ScrollTrigger } = stMod;

      gsap.registerPlugin(ScrollTrigger);

      const track = trackRef.current;
      if (!track || cancelled) {
        return;
      }

      const words = Array.from(track.querySelectorAll(".trb-word"));
      const totalWords = words.length;
      const { rgb: resolvedHighlight, alpha: highlightAlpha } =
        readHighlightConfig(track, highlightBg);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        updateWords(1, words, totalWords, resolvedHighlight, highlightAlpha);
        return;
      }

      const scroller = resolveScrollRoot(track);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      if (cancelled) {
        return;
      }

      let resizeObserver: ResizeObserver | undefined;

      triggerRef.current = ScrollTrigger.create({
        trigger: track,
        scroller,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateWords(
            self.progress,
            words,
            totalWords,
            resolvedHighlight,
            highlightAlpha
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
      triggerRef.current.refresh();

      return () => {
        resizeObserver?.disconnect();
      };
    }

    let teardownResize: (() => void) | undefined;

    init().then((teardown) => {
      teardownResize = teardown;
    });

    return () => {
      cancelled = true;
      teardownResize?.();
      triggerRef.current?.kill();
      triggerRef.current = null;
    };
  }, [paragraphs, keywords, highlightBg, pinDuration]);

  useLayoutEffect(
    () => () => {
      triggerRef.current?.kill();
      triggerRef.current = null;
    },
    []
  );

  const normalise = (w: string) => w.toLowerCase().replace(/[.,!?;:"]/g, "");

  const trackStyle = {
    "--trb-pin-duration": pinDuration,
  } as CSSProperties;

  return (
    <section className="trb-section" style={trackStyle}>
      <div className="trb-track" ref={trackRef}>
        <div className="trb-sticky">
          <div className="trb-inner">
            <div className="trb-text">
              <div className="container">
                {paragraphs.map((para, pi) => (
                  <p key={pi}>
                    {para
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((word, wi) => {
                        const norm = normalise(word);
                        const isKeyword = keywords.includes(norm);
                        const color = keywordColors[norm];
                        return (
                          <span
                            className={`trb-word${isKeyword ? " trb-keyword-wrapper" : ""}`}
                            key={wi}
                          >
                            <span
                              className={isKeyword ? "trb-keyword" : ""}
                              style={
                                isKeyword && color
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
