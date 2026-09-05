"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type MouseEvent,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Run the reveal setup before browser paints so un-hidden text is never
// flashed; falls back to useEffect during SSR where layout effects warn.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// ── math helpers ──
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

const roundToStep = (v: number, step: number) => Math.round(v / step) * step;

const remap = (
  v: number,
  inLo: number,
  inHi: number,
  outLo: number,
  outHi: number
) => ((v - inLo) * (outHi - outLo)) / (inHi - inLo) + outLo;

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

export const ALL_VARIATIONS = [
  "charFill",
  "charInverse",
  "charAccent",
  "charAccentInverse",
  "charAccentFill",
  "charBorder",
] as const;

export const DEFAULT_VARIATIONS = ALL_VARIATIONS;

export type TyperVariation = (typeof ALL_VARIATIONS)[number];

export type TyperType = "initial" | "in" | "out" | "inout" | "done";

interface TyperOptions {
  cycleLength?: number;
  cycles?: number;
  delay?: number;
  fps?: number;
  initVisible?: boolean;
  onComplete?: () => void;
  variations?: TyperVariation[];
}

interface CharNode {
  cp: number;
  currentClass: string;
  el: HTMLSpanElement;
}

const WHITESPACE_SPLIT_RE = /(\s+)/;
const WHITESPACE_RE = /\s/g;
const SPACE_REPLACE_RE = / /g;

class TyperEngine {
  private readonly element: HTMLElement;
  private source: string;
  private length: number;
  private readonly fps: number;
  private readonly cycles: number;
  private readonly cycleLength: number;
  private frames: number;
  private frame = 0;
  private loop: number | null = null;
  private readonly delay: number;
  private delayTimer: number | null = null;
  private charNodes: CharNode[] = [];
  private type: TyperType = "initial";
  private divisor: number;
  private denominator: number;
  private readonly variations: TyperVariation[];
  private readonly initVisible: boolean;
  private readonly onComplete?: () => void;

  constructor(element: HTMLElement, opts: TyperOptions = {}) {
    this.element = element;
    this.source = element.textContent || "";
    this.length = this.source.replace(WHITESPACE_RE, "").length;
    this.fps = opts.fps ?? 20;
    this.cycles = opts.cycles ?? 3;
    this.cycleLength = opts.cycleLength ?? 0.5;
    this.frames = this.length ? this.fps * (1 + this.length * 0.01) : 0;
    this.delay = opts.delay ?? 0;
    this.divisor = this.length > 1 ? this.length - 1 : 1;
    this.denominator = this.frames - this.frames * this.cycleLength || 1;
    this.onComplete = opts.onComplete;

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

  private build() {
    this.element.replaceChildren();
    this.charNodes = [];
    const parts = this.source.split(WHITESPACE_SPLIT_RE);
    let i = 0;
    for (const part of parts) {
      if (part.trim() === "") {
        const space = document.createElement("span");
        space.className = "space";
        space.textContent = part.replace(SPACE_REPLACE_RE, "\u00A0");
        this.element.appendChild(space);
        continue;
      }
      const word = document.createElement("span");
      word.className = "word";
      for (const ch of part.split("")) {
        const pos = i / this.divisor;
        const cp = roundToStep(bezierEase(pos, 0, 0.75, 0.75, 0), 0.05);
        const span = document.createElement("span");
        span.className = "char charInit";
        span.textContent = ch === " " ? "\u00A0" : ch;
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

  getType(): TyperType {
    return this.type;
  }

  reset(newSource?: string) {
    this.stopLoop();
    if (newSource !== undefined && newSource !== this.source) {
      this.source = newSource;
      this.length = this.source.replace(WHITESPACE_RE, "").length;
      this.frames = this.length ? this.fps * (1 + this.length * 0.01) : 0;
      this.divisor = this.length > 1 ? this.length - 1 : 1;
      this.denominator = this.frames - this.frames * this.cycleLength || 1;
      this.build();
    }
    this.frame = 0;
    this.type = "initial";
    this.element.dataset.typerType = "initial";
    this.applyFrame();
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
    const total = this.type === "inout" ? this.frames * 2 : this.frames;
    this.frame += 1;
    this.frame = clamp(this.frame, 0, total);
    this.applyFrame();
    if (this.frame >= total) {
      this.stopLoop();
      const finalType = this.type === "out" ? "initial" : "done";
      this.type = finalType;
      this.element.dataset.typerType = finalType;
      this.onComplete?.();
    }
  }

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
    const idx = Math.round(remap(p, 0, 1, 0, this.cycles));
    const variation =
      this.variations[idx % this.variations.length] ?? "charInit";
    return variation ? `char ${variation}` : "char";
  }

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

  inOut() {
    for (const t of this.typers) {
      t.inOut();
    }
  }

  getType(): TyperType {
    return this.typers[0]?.getType() ?? "initial";
  }

  reset(newLines?: string[]) {
    for (let i = 0; i < this.typers.length; i++) {
      this.typers[i]?.reset(newLines?.[i]);
    }
  }

  destroy() {
    for (const t of this.typers) {
      t.destroy();
    }
  }
}

const STYLE_ID = "sora-typer-styles";

const TYPER_CSS = `
[data-typer] {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
}
[data-typer][data-typer-type="initial"] { opacity: 0; }
[data-typer] .word {
  white-space: pre;
  display: inline-block;
}
[data-typer] .space {
  white-space: pre;
  display: inline-block;
  flex-shrink: 0;
  width: var(--typer-space-width, 0.5em);
}
[data-typer] .word .char {
  box-sizing: content-box;
  display: inline-block;
  color: var(--typer-fg, var(--foreground, currentColor));
  background: transparent;
  transition: none;
}
[data-typer] .word .char.charInit { color: transparent !important; }
[data-typer] .word .char.charFill {
  color: var(--typer-bg, var(--background, #000));
  background: var(--typer-fg, var(--foreground, currentColor));
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
  color: var(--typer-bg, var(--background, #000));
  background: var(--typer-fg, var(--foreground, currentColor));
}
[data-typer] .word .char.charAccent {
  color: var(--typer-accent-fg, var(--typer-fg, var(--foreground, currentColor)));
  background: var(--typer-accent, var(--accent, #0044ff));
  border-radius: var(--typer-radius, 5px);
}
[data-typer] .word .char.charAccent:has(+ .charAccent) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[data-typer] .word .char.charAccent + .charAccent { border-radius: 0; }
[data-typer] .word .char.charAccent + .charAccent:last-child,
[data-typer] .word .char.charAccent + .charAccent:has(+ :not(.charAccent)) {
  border-radius: 0 var(--typer-radius, 5px) var(--typer-radius, 5px) 0;
}
[data-typer] .word .char.charAccentInverse {
  color: var(--typer-accent-ink, var(--typer-bg, var(--background, #000)));
  background: var(--typer-accent, var(--accent, #0044ff));
  border-radius: var(--typer-radius, 5px);
}
[data-typer] .word .char.charAccentInverse:has(+ .charAccentInverse) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[data-typer] .word .char.charAccentInverse + .charAccentInverse { border-radius: 0; }
[data-typer] .word .char.charAccentInverse + .charAccentInverse:last-child,
[data-typer] .word .char.charAccentInverse + .charAccentInverse:has(+ :not(.charAccentInverse)) {
  border-radius: 0 var(--typer-radius, 5px) var(--typer-radius, 5px) 0;
}
[data-typer] .word .char.charAccentFill {
  color: var(--typer-accent, var(--accent, #0044ff));
  background: var(--typer-accent, var(--accent, #0044ff));
  border-radius: var(--typer-radius, 5px);
}
[data-typer] .word .char.charAccentFill:has(+ .charAccentFill) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[data-typer] .word .char.charAccentFill + .charAccentFill { border-radius: 0; }
[data-typer] .word .char.charAccentFill + .charAccentFill:last-child,
[data-typer] .word .char.charAccentFill + .charAccentFill:has(+ :not(.charAccentFill)) {
  border-radius: 0 var(--typer-radius, 5px) var(--typer-radius, 5px) 0;
}
[data-typer] .word .char.charBorder {
  position: relative;
  color: var(--typer-fg, var(--foreground, currentColor));
}
[data-typer] .word .char.charBorder::after {
  content: "";
  display: inline-block;
  position: absolute;
  inset: 0;
  border: 1px solid var(--typer-border, var(--typer-fg, var(--foreground, currentColor)));
  border-radius: var(--typer-radius, 5px);
  box-sizing: border-box;
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
  border-right: 1px solid var(--typer-border, var(--typer-fg, var(--foreground, currentColor)));
  border-radius: 0 var(--typer-radius, 5px) var(--typer-radius, 5px) 0;
}
@media (prefers-reduced-motion: reduce) {
  [data-typer][data-typer-type="initial"] { opacity: 1; }
  [data-typer] .word .char.charInit { color: var(--typer-fg, var(--foreground, currentColor)); }
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

function dispatchGroupTrigger(
  group: TyperGroup,
  trigger: "in" | "out" | "inout"
) {
  if (trigger === "in") {
    group.in();
  } else if (trigger === "out") {
    group.out();
  } else if (trigger === "inout") {
    group.inOut();
  }
}

export interface TyperHandle {
  /** Gets current TyperType state. */
  getType: () => TyperType;
  /** Runs the reveal in phase (alias for play). */
  in: () => void;
  /** Runs the reveal in phase followed by the out phase. */
  inOut: () => void;
  /** Runs the reveal in reverse, clearing the text back out. */
  out: () => void;
  /** Reveals the text (in phase). Ignores startOnView gating. */
  play: () => void;
  /** Restarts the reveal from the beginning. */
  replay: () => void;
  /** Resets state with optional new text. */
  reset: (newText?: string | string[]) => void;
  /** Alias for in(). */
  triggerIn: () => void;
  /** Alias for inOut(). */
  triggerInOut: () => void;
  /** Alias for out(). */
  triggerOut: () => void;
}

export type TyperRef = TyperHandle;

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
  /** Color for charBorder border. Maps to `--typer-border`. @default theme `--foreground` */
  border?: string;
  /** Children string fallback if text prop is omitted. */
  children?: string;
  /** Cycle length multiplier. @default 0.5 */
  cycleLength?: number;
  /** How many random states each char rolls through before settling. @default 3 */
  cycles?: number;
  /** Delay in seconds before starting animation. @default 0 */
  delay?: number;
  /** Base ink color (plain letters, ink pills). Maps to `--typer-fg`. @default theme `--foreground` */
  fg?: string;
  /** Frames per second of the reveal loop. @default 20 */
  fps?: number;
  /** Initial visibility. If true, starts directly in "done" state. @default false */
  initVisible?: boolean;
  /** Callback when the reveal animation completes. */
  onComplete?: () => void;
  /** Corner radius of merged pills. Maps to `--typer-radius`. @default "5px" */
  radius?: string;
  /** Imperative handle exposing play / replay / in / out / inOut / reset. */
  ref?: Ref<TyperHandle>;
  /** Custom space width between words. Maps to `--typer-space-width`. @default "0.5em" */
  spaceWidth?: string;
  /** Seconds between consecutive lines cascading in. @default 0.15 */
  stagger?: number;
  /** Wait until scrolled into view before revealing. Ignored if trigger is provided. @default true */
  startOnView?: boolean;
  /** Text to reveal. Pass an array to render one cascading line per string. */
  text?: string | string[];
  /** Declarative trigger to transition "in", "out", or "inout". */
  trigger?: "in" | "out" | "inout";
  /** Trigger animation on mouse hover. @default false */
  triggerOnHover?: boolean;
  /** Trigger animation automatically on mount. @default true */
  triggerOnMount?: boolean;
  /** Which visual states each char rolls through. @default all six variations */
  variations?: TyperVariation[];
}

export function Typer({
  accent,
  accentInk,
  as: Component = "div",
  bg,
  border,
  children,
  className,
  cycleLength = 0.5,
  cycles = 3,
  delay = 0,
  fg,
  fps = 20,
  initVisible = false,
  onComplete,
  radius,
  ref,
  spaceWidth,
  stagger = 0.15,
  startOnView = true,
  style,
  text: textProp,
  trigger,
  triggerOnHover = false,
  triggerOnMount = true,
  variations,
  ...props
}: TyperProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<TyperGroup | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    setReducedMotion(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const rawText = textProp ?? (typeof children === "string" ? children : "");
  const lines = useMemo(
    () => (Array.isArray(rawText) ? rawText : [rawText]),
    [rawText]
  );

  const customStyles = useMemo(() => {
    const s: Record<string, string> = {};
    if (fg) {
      s["--typer-fg"] = fg;
    }
    if (bg) {
      s["--typer-bg"] = bg;
    }
    if (accent) {
      s["--typer-accent"] = accent;
    }
    if (accentInk) {
      s["--typer-accent-ink"] = accentInk;
    }
    if (border) {
      s["--typer-border"] = border;
    }
    if (radius) {
      s["--typer-radius"] = radius;
    }
    if (spaceWidth) {
      s["--typer-space-width"] = spaceWidth;
    }
    return { ...s, ...style } as CSSProperties;
  }, [fg, bg, accent, accentInk, border, radius, spaceWidth, style]);

  useImperativeHandle(
    ref,
    () => ({
      getType: () => groupRef.current?.getType() ?? "initial",
      in: () => groupRef.current?.in(),
      inOut: () => groupRef.current?.inOut(),
      out: () => groupRef.current?.out(),
      play: () => groupRef.current?.in(),
      replay: () => groupRef.current?.in(),
      reset: (newText?: string | string[]) => {
        if (newText === undefined) {
          groupRef.current?.reset();
        } else {
          const newLines = Array.isArray(newText) ? newText : [newText];
          groupRef.current?.reset(newLines);
        }
      },
      triggerIn: () => groupRef.current?.in(),
      triggerInOut: () => groupRef.current?.inOut(),
      triggerOut: () => groupRef.current?.out(),
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

    for (const el of lineEls) {
      el.style.removeProperty("opacity");
    }

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
      group = new TyperGroup(
        lineEls,
        {
          cycleLength,
          cycles,
          fps,
          initVisible: reducedMotion || initVisible,
          onComplete,
          variations,
        },
        stagger
      );
      groupRef.current = group;

      if (reducedMotion || initVisible) {
        return;
      }

      if (trigger) {
        dispatchGroupTrigger(group, trigger);
        return;
      }

      if (startOnView) {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                group?.in();
                observer?.disconnect();
                observer = null;
              }
            }
          },
          { threshold: 0.2 }
        );
        observer.observe(root);
        return;
      }

      if (triggerOnMount) {
        group.in();
      }
    };

    setup();
    return teardown;
  }, [
    lines,
    fps,
    cycles,
    cycleLength,
    stagger,
    startOnView,
    triggerOnMount,
    trigger,
    initVisible,
    onComplete,
    reducedMotion,
    variations,
  ]);

  useEffect(() => {
    if (groupRef.current && trigger && !reducedMotion) {
      dispatchGroupTrigger(groupRef.current, trigger);
    }
  }, [trigger, reducedMotion]);

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      props.onMouseEnter?.(e);
      if (triggerOnHover && !reducedMotion) {
        groupRef.current?.inOut();
      }
    },
    [props.onMouseEnter, triggerOnHover, reducedMotion]
  );

  return (
    <Component
      className={cn("inline-flex flex-col", className)}
      onMouseEnter={handleMouseEnter}
      ref={rootRef}
      style={customStyles}
      {...props}
    >
      {lines.map((line) => (
        <span
          data-typer=""
          data-typer-type={reducedMotion || initVisible ? "done" : "initial"}
          key={line}
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            opacity: reducedMotion || initVisible ? 1 : 0,
          }}
        >
          {line}
        </span>
      ))}
    </Component>
  );
}

export default Typer;
