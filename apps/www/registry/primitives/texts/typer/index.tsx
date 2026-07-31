"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type Ref,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Run the reveal setup before the browser paints so the un-hidden text is never
// shown for a frame; falls back to useEffect during SSR where layout effects warn.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// ── math helpers ──
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

// round v to the nearest multiple of step (quantizes the per-char progress so a
// glyph holds each state for a beat instead of flickering every frame).
const roundToStep = (v: number, step: number) => Math.round(v / step) * step;

// linear remap of v from [inLo,inHi] into [outLo,outHi].
const remap = (
  v: number,
  inLo: number,
  inHi: number,
  outLo: number,
  outHi: number
) => ((v - inLo) * (outHi - outLo)) / (inHi - inLo) + outLo;

// solve a cubic bezier easing y for a given x, control points (x1,y1)(x2,y2),
// endpoints fixed at (0,0)(1,1). Newton's method with a bisection fallback. Used
// once per character to place its reveal "control point" along an eased curve, so
// the ripple accelerates and settles like the original.
function bezierEase(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  eps = 1e-6
): number {
  const bx = (t: number) =>
    3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3;
  const by = (t: number) =>
    3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3;
  const bxDeriv = (t: number) =>
    3 * (1 - t) ** 2 * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t ** 2 * (1 - x2);

  let t = x;
  for (let i = 0; i < 8; i++) {
    const dx = bx(t) - x;
    if (Math.abs(dx) < eps) {
      return by(t);
    }
    const d = bxDeriv(t);
    if (Math.abs(d) < 1e-6) {
      break;
    }
    t -= dx / d;
  }
  let lo = 0;
  let hi = 1;
  t = x;
  while (lo < hi) {
    const cx = bx(t);
    if (Math.abs(cx - x) < eps) {
      return by(t);
    }
    if (cx < x) {
      lo = t;
    } else {
      hi = t;
    }
    t = (lo + hi) / 2;
  }
  return by(t);
}

// the full pool of per-character states (CSS class suffixes). Any subset can be
// used; they get shuffled per run so the ripple never looks the same twice.
export const ALL_VARIATIONS = [
  "charFill",
  "charInverse",
  "charAccent",
  "charAccentInverse",
  "charAccentFill",
  "charBorder",
] as const;

export type TyperVariation = (typeof ALL_VARIATIONS)[number];

type TyperType = "initial" | "in" | "out" | "inout" | "done";

interface TyperOptions {
  cycleLength?: number;
  cycles?: number;
  delay?: number;
  fps?: number;
  initVisible?: boolean;
  variations?: string[];
}

interface CharNode {
  cp: number;
  currentClass: string;
  el: HTMLSpanElement;
}

const WHITESPACE_SPLIT_RE = /(\s+)/;
const WHITESPACE_RE = /\s/g;

class TyperEngine {
  private readonly element: HTMLElement;
  private readonly source: string;
  private readonly length: number;
  private readonly fps: number;
  private readonly cycles: number;
  private readonly cycleLength: number;
  private readonly frames: number;
  private frame = 0;
  private loop: number | null = null;
  private readonly delay: number;
  private delayTimer: number | null = null;
  private charNodes: CharNode[] = [];
  private type: TyperType = "initial";
  private readonly divisor: number;
  private readonly denominator: number;
  private readonly variations: string[];
  private readonly initVisible: boolean;

  constructor(element: HTMLElement, opts: TyperOptions = {}) {
    this.element = element;
    this.source = element.textContent || "";
    this.length = this.source.replace(WHITESPACE_RE, "").length;
    this.fps = opts.fps ?? 20;
    this.cycles = opts.cycles ?? 3;
    this.cycleLength = opts.cycleLength ?? 0.5;
    // total frames scales a little with word length so long lines don't feel rushed.
    this.frames = this.length ? this.fps * (1 + this.length * 0.01) : 0;
    this.delay = opts.delay ?? 0;
    this.divisor = this.length > 1 ? this.length - 1 : 1;
    this.denominator = this.frames - this.frames * this.cycleLength || 1;

    this.variations = (opts.variations ?? [...ALL_VARIATIONS]).slice();
    this.shuffle();
    this.initVisible = opts.initVisible ?? false;

    if (this.length) {
      this.build();
      if (this.initVisible) {
        for (const n of this.charNodes) {
          this.setClass(n, "char");
        }
        this.type = "done";
        this.element.dataset.typerType = "done";
      } else {
        this.applyFrame();
        this.element.dataset.typerType = "initial";
      }
    }
  }

  // split into words (preserving whitespace nodes) and wrap each char in a span.
  // Each char gets a bezier-eased control point from its position in the word.
  private build() {
    this.element.replaceChildren();
    this.charNodes = [];
    const parts = this.source.split(WHITESPACE_SPLIT_RE);
    let i = 0;
    for (const part of parts) {
      if (part.trim() === "") {
        this.element.append(document.createTextNode(part));
        continue;
      }
      const word = document.createElement("span");
      word.className = "word";
      for (const ch of part.split("")) {
        const pos = i / this.divisor;
        // ease the control point so chars near the start reveal sooner, with a
        // smooth ramp; quantize to 0.05 so states hold for a beat.
        const cp = roundToStep(bezierEase(pos, 0, 0.75, 0.75, 0), 0.05);
        const span = document.createElement("span");
        span.className = "char charInit";
        span.textContent = ch || " ";
        this.charNodes.push({ el: span, cp, currentClass: "char charInit" });
        i += 1;
        word.appendChild(span);
      }
      this.element.appendChild(word);
    }
  }

  in() {
    this.setType("in");
  }
  out() {
    this.setType("out");
  }
  inOut() {
    this.setType("inout");
  }

  private setType(t: TyperType) {
    if (t === this.type && t !== "inout") {
      return;
    }
    this.type = t;
    this.element.dataset.typerType = t;
    this.stopLoop();
    this.frame = 0;
    this.applyFrame();
    if (t !== "initial" && this.charNodes.length) {
      this.startLoop();
    }
  }

  private startLoop() {
    if (this.loop || this.delayTimer || !this.charNodes.length) {
      return;
    }
    if (this.type === "initial") {
      return;
    }
    this.shuffle();
    const begin = () => {
      this.delayTimer = null;
      if (this.loop || this.type === "initial") {
        return;
      }
      this.applyFrame();
      this.loop = window.setInterval(() => this.tick(), 1000 / this.fps);
    };
    if (this.delay > 0) {
      this.delayTimer = window.setTimeout(begin, this.delay * 1000);
    } else {
      begin();
    }
  }

  private stopLoop() {
    if (this.delayTimer) {
      window.clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    if (this.loop) {
      window.clearInterval(this.loop);
      this.loop = null;
    }
  }

  private tick() {
    // inout runs the in phase then the out phase back to back (2x the frames).
    const total = this.type === "inout" ? this.frames * 2 : this.frames;
    this.frame += 1;
    this.frame = clamp(this.frame, 0, total);
    this.applyFrame();
    if (this.frame >= total) {
      this.stopLoop();
      this.type = "done";
      this.element.dataset.typerType = "done";
    }
  }

  // resolve the class for one character given the reveal phase and its local
  // progress p. "in" ramps charInit → states → plain; "out" runs it in reverse.
  private resolveClass(phase: TyperType, p: number) {
    if (phase === "in") {
      if (p <= 0) {
        return "char charInit";
      }
      if (p >= 1) {
        return "char";
      }
    } else {
      if (p <= 0) {
        return "char";
      }
      if (p >= 1) {
        return "char charInit";
      }
    }
    // mid-reveal: roll through the shuffled pool by cycle.
    const idx = Math.round(remap(p, 0, 1, 0, this.cycles));
    const variation =
      this.variations[idx % this.variations.length] ?? "charInit";
    return variation ? `char ${variation}` : "char";
  }

  // paint every char's class for the current frame.
  private applyFrame() {
    if (!(this.length && this.charNodes.length)) {
      return;
    }
    if (this.type === "initial") {
      for (const n of this.charNodes) {
        this.setClass(n, "char charInit");
      }
      return;
    }
    // in the inout case, the second half is the "out" phase.
    let phase: TyperType = this.type;
    if (this.type === "inout") {
      phase = this.frame > this.frames ? "out" : "in";
    }
    const rawFrame =
      this.type === "inout" && phase === "out"
        ? this.frame - this.frames
        : this.frame;
    const progress = rawFrame / this.denominator;

    for (const node of this.charNodes) {
      // this char's local progress = global progress minus its control-point offset.
      let p = progress - node.cp;
      p = roundToStep(p, 0.1);
      p = clamp(p, 0, 1);
      this.setClass(node, this.resolveClass(phase, p));
    }
  }

  private setClass(node: CharNode, cls: string) {
    if (cls === node.currentClass) {
      return;
    }
    node.currentClass = cls;
    node.el.className = cls;
  }

  private shuffle() {
    this.variations.sort(() => 0.5 - Math.random());
  }

  destroy() {
    this.stopLoop();
    this.element.textContent = this.source;
    this.element.removeAttribute("data-typer-type");
  }
}

// Runs several typers together with a per-line stagger, so a stacked block
// cascades in top-to-bottom. Each line's `delay` offsets when its reveal starts.
class TyperGroup {
  private readonly typers: TyperEngine[];

  constructor(
    elements: HTMLElement[],
    opts: Omit<TyperOptions, "delay"> = {},
    stagger = 0.15
  ) {
    this.typers = elements.map(
      (el, i) => new TyperEngine(el, { ...opts, delay: i * stagger })
    );
  }

  in() {
    for (const t of this.typers) {
      t.in();
    }
  }
  out() {
    for (const t of this.typers) {
      t.out();
    }
  }
  destroy() {
    for (const t of this.typers) {
      t.destroy();
    }
  }
}

// ── injected styles (ships as a <style> tag, no .css file) ──
const STYLE_ID = "sora-typer-styles";

const TYPER_CSS = `
[data-typer][data-typer-type="initial"] { opacity: 0; }
[data-typer] .word { white-space: pre; }
[data-typer] .word .char {
  box-sizing: content-box;
  display: inline-block;
  color: var(--typer-fg, var(--foreground, #1b1b1b));
  background: transparent;
  transition: none;
}
[data-typer] .word .char.charInit { color: transparent; }
[data-typer] .word .char.charFill {
  color: var(--typer-bg, var(--background, #fcfcfc));
  background: var(--typer-fg, var(--foreground, #1b1b1b));
  border-radius: var(--typer-radius, 5px);
}
[data-typer] .word .char.charFill:has(+ .charFill) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[data-typer] .word .char.charFill + .charFill { border-radius: 0; }
[data-typer] .word .char.charFill + .charFill:last-child,
[data-typer] .word .char.charFill + .charFill:has(+ :not(.charFill)) {
  border-radius: 0 var(--typer-radius, 5px) var(--typer-radius, 5px) 0;
}
[data-typer] .word .char.charInverse {
  color: var(--typer-bg, var(--background, #fcfcfc));
  background: var(--typer-fg, var(--foreground, #1b1b1b));
}
[data-typer] .word .char.charAccent {
  color: var(--typer-accent, #12a150);
  background: transparent;
}
[data-typer] .word .char.charAccentInverse {
  color: var(--typer-accent-ink, #fcfcfc);
  background: var(--typer-accent, #12a150);
  border-radius: var(--typer-radius, 5px);
}
[data-typer] .word .char.charAccentInverse:has(+ .charAccentInverse) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[data-typer] .word .char.charAccentInverse + .charAccentInverse { border-radius: 0; }
[data-typer] .word .char.charAccentInverse + .charAccentInverse:last-child,
[data-typer]
  .word
  .char.charAccentInverse
  + .charAccentInverse:has(+ :not(.charAccentInverse)) {
  border-radius: 0 var(--typer-radius, 5px) var(--typer-radius, 5px) 0;
}
[data-typer] .word .char.charAccentFill {
  color: var(--typer-accent, #12a150);
  background: var(--typer-accent, #12a150);
}
[data-typer] .word .char.charBorder {
  position: relative;
  color: var(--typer-fg, var(--foreground, #1b1b1b));
}
[data-typer] .word .char.charBorder::after {
  content: "";
  display: inline-block;
  position: absolute;
  inset: 0;
  border: 1px solid var(--typer-accent, #12a150);
  border-radius: var(--typer-radius, 5px);
}
[data-typer] .word .char.charBorder:has(+ .charBorder)::after {
  border-right: 1px solid transparent;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[data-typer] .word .char.charBorder + .charBorder::after {
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  border-radius: 0;
}
[data-typer] .word .char.charBorder + .charBorder:last-child::after,
[data-typer] .word .char.charBorder + .charBorder:has(+ :not(.charBorder))::after {
  border-left: 1px solid transparent;
  border-right: 1px solid var(--typer-accent, #12a150);
  border-radius: 0 var(--typer-radius, 5px) var(--typer-radius, 5px) 0;
}
@media (prefers-reduced-motion: reduce) {
  [data-typer][data-typer-type="initial"] { opacity: 1; }
  [data-typer] .word .char.charInit { color: var(--typer-fg, var(--foreground, #1b1b1b)); }
}
`;

function ensureTyperStyles() {
  if (typeof document === "undefined") {
    return;
  }
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = TYPER_CSS;
}

export interface TyperHandle {
  /** Runs the reveal in reverse, clearing the text back out. */
  out: () => void;
  /** Reveals the text (in phase). Ignores startOnView gating. */
  play: () => void;
  /** Restarts the reveal from the beginning. */
  replay: () => void;
}

export interface TyperProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children" | "color"> {
  /** Accent surface color (accent pills and borders). Maps to `--typer-accent`. */
  accent?: string;
  /** Text color sitting on an accent fill. Maps to `--typer-accent-ink`. */
  accentInk?: string;
  /** Render as a different element instead of `div`. @default "div" */
  as?: ElementType;
  /** Knockout / page color inside filled pills. Maps to `--typer-bg`. @default theme `--background` */
  bg?: string;
  /** How many random states each char rolls through before settling. @default 3 */
  cycles?: number;
  /** Base ink color (plain letters, ink pills). Maps to `--typer-fg`. @default theme `--foreground` */
  fg?: string;
  /** Frames per second of the reveal loop. @default 20 */
  fps?: number;
  /** Corner radius of merged pills. Maps to `--typer-radius`. */
  radius?: string;
  /** Imperative handle exposing play / replay / out. */
  ref?: Ref<TyperHandle>;
  /** Seconds between consecutive lines cascading in. @default 0.15 */
  stagger?: number;
  /** Wait until scrolled into view before revealing. @default true */
  startOnView?: boolean;
  /** Text to reveal. Pass an array to render one cascading line per string. */
  text: string | string[];
  /** Which visual states each char rolls through. @default all six variations */
  variations?: TyperVariation[];
}

export function Typer({
  text,
  as: Component = "div",
  variations,
  fps = 20,
  cycles = 3,
  stagger = 0.15,
  startOnView = true,
  fg,
  bg,
  accent,
  accentInk,
  radius,
  className,
  style,
  ref,
  ...props
}: TyperProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<TyperGroup | null>(null);

  const lines = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  useImperativeHandle(
    ref,
    () => ({
      play: () => groupRef.current?.in(),
      replay: () => groupRef.current?.in(),
      out: () => groupRef.current?.out(),
    }),
    []
  );

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    ensureTyperStyles();

    const lineEls = Array.from(
      root.querySelectorAll<HTMLElement>("[data-typer]")
    );
    if (!lineEls.length) {
      return;
    }

    // Clear the SSR inline opacity hint now that JS controls visibility; the
    // injected stylesheet keeps lines hidden while their reveal is pending.
    for (const el of lineEls) {
      el.style.removeProperty("opacity");
    }

    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    let group: TyperGroup | null = null;
    let observer: IntersectionObserver | null = null;

    const teardown = () => {
      observer?.disconnect();
      observer = null;
      group?.destroy();
      group = null;
      groupRef.current = null;
    };

    const setup = () => {
      const reduced = mql.matches;
      group = new TyperGroup(
        lineEls,
        {
          fps,
          cycles,
          variations,
          initVisible: reduced,
        },
        stagger
      );
      groupRef.current = group;

      if (reduced) {
        return;
      }

      if (startOnView) {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                group?.in();
                observer?.disconnect();
                break;
              }
            }
          },
          { threshold: 0.15 }
        );
        observer.observe(root);
      } else {
        group.in();
      }
    };

    const onChange = () => {
      teardown();
      setup();
    };

    setup();
    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
      teardown();
    };
  }, [lines, variations, fps, cycles, stagger, startOnView]);

  const cssVars = {
    ...(fg && { "--typer-fg": fg }),
    ...(bg && { "--typer-bg": bg }),
    ...(accent && { "--typer-accent": accent }),
    ...(accentInk && { "--typer-accent-ink": accentInk }),
    ...(radius && { "--typer-radius": radius }),
    ...style,
  } as CSSProperties;

  return (
    <Component
      aria-label={lines.join(". ")}
      className={cn("select-none", className)}
      ref={rootRef}
      style={cssVars}
      {...props}
    >
      {lines.map((line, i) => (
        <span
          aria-hidden="true"
          className="block"
          data-typer
          // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
          key={`${i}-${line}`}
          style={{ opacity: 0 }}
        >
          {line}
        </span>
      ))}
    </Component>
  );
}
