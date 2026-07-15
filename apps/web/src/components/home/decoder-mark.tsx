"use client";

import { useEffect, useRef } from "react";

/**
 * Per-letter "decoder" scramble effect, ported from the static home.html build.
 * Builds glyph-width-matched substitution pools per character so scrambling
 * never reflows the line, then randomizes letters on hover plus an ambient
 * auto-scramble loop shared across every mounted <DecoderMark>.
 */

const SPEED = 85;
const SETTLE_N = 4;
const SKIP = new Set([" ", ",", ".", "-", "&", "/", ":"]);
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const TOLERANCE = 0.15;

interface DecoderItem {
  ch: string;
  intervalId: ReturnType<typeof setInterval> | null;
  rnd: () => string;
  settleId: ReturnType<typeof setTimeout> | null;
  span: HTMLSpanElement;
}

interface RegistryEntry {
  isHovering: () => boolean;
  words: DecoderItem[][];
}

const registry = new Set<RegistryEntry>();
let ambientStarted = false;

function buildGlyphMap(el: HTMLElement) {
  const probe = document.createElement("span");
  Object.assign(probe.style, {
    pointerEvents: "none",
    position: "absolute",
    visibility: "hidden",
    whiteSpace: "nowrap",
  });
  el.appendChild(probe);
  const all = LOWER + UPPER;
  const widths: Record<string, number> = {};
  for (const ch of all) {
    probe.textContent = ch;
    widths[ch] = probe.getBoundingClientRect().width;
  }
  el.removeChild(probe);

  const map: Record<string, string> = {};
  for (const ch of all) {
    const isUpper = ch >= "A" && ch <= "Z";
    const pool = (isUpper ? UPPER : LOWER).split("").filter((g) => g !== ch);
    const w = widths[ch];
    let compat = pool.filter((g) => Math.abs(widths[g] - w) / w <= TOLERANCE);
    if (compat.length < 3) {
      compat = pool
        .sort((a, b) => Math.abs(widths[a] - w) - Math.abs(widths[b] - w))
        .slice(0, 4);
    }
    map[ch] = compat.join("");
  }
  return map;
}

function scrambleItemBriefly(item: DecoderItem, bursts: number) {
  if (item.intervalId || item.settleId) {
    return;
  }
  let n = 0;
  const total = bursts + SETTLE_N;
  function step() {
    if (n < total) {
      item.span.textContent = item.rnd();
      n++;
      item.settleId = setTimeout(step, SPEED);
    } else {
      item.span.textContent = item.ch;
      item.settleId = null;
    }
  }
  item.settleId = setTimeout(step, SPEED);
}

function ambientTick() {
  const candidates = Array.from(registry).filter(
    (entry) => !entry.isHovering() && entry.words.length > 0
  );
  if (candidates.length) {
    const entry = candidates[Math.floor(Math.random() * candidates.length)];
    const words = entry.words;
    const runLen = Math.min(words.length, 1 + Math.floor(Math.random() * 3));
    const start = Math.floor(Math.random() * (words.length - runLen + 1));
    let delay = 0;
    for (let w = start; w < start + runLen; w++) {
      const word = words[w];
      for (const item of word) {
        setTimeout(
          () => scrambleItemBriefly(item, 3 + Math.floor(Math.random() * 4)),
          delay
        );
        delay += 28;
      }
      delay += 40;
    }
  }
  setTimeout(ambientTick, 2500 + Math.random() * 3500);
}

function ensureAmbientLoop() {
  if (ambientStarted) {
    return;
  }
  ambientStarted = true;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (!prefersReduced) {
    setTimeout(ambientTick, 3000 + Math.random() * 3000);
  }
}

export function DecoderMark({ children }: { children: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const mark = ref.current;
    if (!mark) {
      return;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      return; // leave as plain text
    }

    const original = children;
    const glyphMap = buildGlyphMap(mark);
    mark.innerHTML = "";

    const words: DecoderItem[][] = [];
    let curWord: DecoderItem[] | null = null;
    let wordWrap: HTMLSpanElement | null = null;

    for (const ch of original) {
      if (SKIP.has(ch)) {
        if (wordWrap) {
          mark.appendChild(wordWrap);
          wordWrap = null;
        }
        if (curWord) {
          words.push(curWord);
          curWord = null;
        }
        mark.appendChild(document.createTextNode(ch));
        continue;
      }
      if (!wordWrap) {
        wordWrap = document.createElement("span");
        wordWrap.style.whiteSpace = "nowrap";
      }
      const pool = glyphMap[ch] || LOWER;
      const span = document.createElement("span");
      span.textContent = ch;
      span.style.display = "inline-block";
      span.style.textAlign = "center";
      wordWrap.appendChild(span);
      const rnd = () => pool[Math.floor(Math.random() * pool.length)];
      const item: DecoderItem = {
        ch,
        intervalId: null,
        rnd,
        settleId: null,
        span,
      };
      if (!curWord) {
        curWord = [];
      }
      curWord.push(item);
    }
    if (wordWrap) {
      mark.appendChild(wordWrap);
    }
    if (curWord) {
      words.push(curWord);
    }

    const flat = words.flat();
    // freeze widths first so scrambled glyphs never reflow the line
    const widths = flat.map(({ span }) => span.getBoundingClientRect().width);
    flat.forEach(({ span }, i) => {
      span.style.width = `${Math.ceil(widths[i])}px`;
    });

    const listeners: Array<() => void> = [];
    for (const item of flat) {
      const { span, ch, rnd } = item;
      const onEnter = () => {
        if (item.settleId) {
          clearTimeout(item.settleId);
        }
        item.settleId = null;
        if (item.intervalId) {
          return;
        }
        item.intervalId = setInterval(() => {
          span.textContent = rnd();
        }, SPEED);
      };
      const onLeave = () => {
        if (item.intervalId) {
          clearInterval(item.intervalId);
        }
        item.intervalId = null;
        let n = 0;
        function settle() {
          if (n < SETTLE_N) {
            span.textContent = rnd();
            n++;
            item.settleId = setTimeout(settle, SPEED);
          } else {
            span.textContent = ch;
            item.settleId = null;
          }
        }
        item.settleId = setTimeout(settle, SPEED);
      };
      span.addEventListener("mouseenter", onEnter);
      span.addEventListener("mouseleave", onLeave);
      listeners.push(() => {
        span.removeEventListener("mouseenter", onEnter);
        span.removeEventListener("mouseleave", onLeave);
      });
    }

    let hovering = false;
    const onMarkEnter = () => {
      hovering = true;
    };
    const onMarkLeave = () => {
      hovering = false;
    };
    mark.addEventListener("mouseenter", onMarkEnter);
    mark.addEventListener("mouseleave", onMarkLeave);

    const entry: RegistryEntry = { isHovering: () => hovering, words };
    registry.add(entry);
    ensureAmbientLoop();

    return () => {
      registry.delete(entry);
      mark.removeEventListener("mouseenter", onMarkEnter);
      mark.removeEventListener("mouseleave", onMarkLeave);
      for (const removeListener of listeners) {
        removeListener();
      }
      for (const item of flat) {
        if (item.intervalId) {
          clearInterval(item.intervalId);
        }
        if (item.settleId) {
          clearTimeout(item.settleId);
        }
      }
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: `children` must stay static for a given mark instance
  }, []);

  return (
    <mark className="rounded-sm bg-transparent px-0.5 text-white/55" ref={ref}>
      {children}
    </mark>
  );
}
