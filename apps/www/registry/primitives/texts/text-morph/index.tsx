"use client";

import { cn } from "@workspace/ui/lib/utils";
import React, {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  useCallback,
  useEffect,
  useRef,
} from "react";

// --- Constants & Regexes -----------------------------------------------------

const ATTR_ROOT = "torph-root";
const ATTR_ITEM = "torph-item";
const ATTR_ID = "torph-id";
const ATTR_KIND = "torph-kind";
const ATTR_SLOT = "torph-slot";
const ATTR_EXITING = "torph-exiting";
const ATTR_SR = "torph-sr";
const ATTR_DEBUG = "torph-debug";
const EMPTY_ID = "empty";

const WHITESPACE_REGEX = /\s+/;
const BEZIER_REGEX = /^cubic-bezier\(([^)]*)\)$/;
const LINEAR_REGEX = /^linear\(([^)]*)\)$/;
const MATRIX_REGEX = /matrix\(([^)]+)\)/;
const WORD_SPLIT_REGEX = /( |\n)/;
const HTML_AMP_REGEX = /&/g;
const HTML_LT_REGEX = /</g;
const HTML_GT_REGEX = />/g;
const HTML_QUOT_REGEX = /"/g;
const HTML_APOS_REGEX = /'/g;
const NEWLINE_GLOBAL_REGEX = /\n/g;

const TORPH_CSS = `
[${ATTR_ROOT}] {
  display: inline-block;
  position: relative;
  vertical-align: top;
  will-change: width, height;
  white-space: nowrap;
  text-align: inherit;
}

[${ATTR_ITEM}]:not(br) {
  display: inline-block;
  position: relative;
  will-change: opacity, transform;
  transform: none;
  opacity: 1;
}

[${ATTR_SR}] {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: pre;
  -webkit-user-select: none;
  user-select: none;
}

[${ATTR_SLOT}] {
  clip-path: inset(0 -100vw);
}

[${ATTR_SLOT}] > span {
  display: inline-block;
  will-change: opacity, transform;
}

@supports (mask-clip: no-clip) or (-webkit-mask-clip: no-clip) {
  [${ATTR_SLOT}] {
    --torph-mask: linear-gradient(
      to bottom,
      transparent,
      #000 var(--torph-fade, 0.15em),
      #000 calc(100% - var(--torph-fade, 0.15em)),
      transparent
    );
    -webkit-mask-image: var(--torph-mask);
    mask-image: var(--torph-mask);
    -webkit-mask-repeat: repeat-x;
    mask-repeat: repeat-x;
    -webkit-mask-clip: no-clip;
    mask-clip: no-clip;
  }
}

[${ATTR_ROOT}][${ATTR_DEBUG}] {
  outline: 2px solid magenta;
}

[${ATTR_ROOT}][${ATTR_DEBUG}] [${ATTR_ITEM}] {
  outline: 2px solid cyan;
  outline-offset: -4px;
}
`;

let styleEl: HTMLStyleElement | null = null;
let styleRefCount = 0;

function addStyles() {
  if (typeof document === "undefined") {
    return;
  }
  styleRefCount++;
  if (styleEl) {
    return;
  }

  styleEl = document.createElement("style");
  styleEl.dataset.torph = "true";
  styleEl.textContent = TORPH_CSS;
  document.head.appendChild(styleEl);
}

function removeStyles() {
  styleRefCount--;
  if (styleRefCount > 0 || !styleEl) {
    return;
  }

  styleEl.remove();
  styleEl = null;
}

// --- Reduced Motion ---------------------------------------------------------

export interface ReducedMotionState {
  destroy: () => void;
  readonly prefersReducedMotion: boolean;
}

export function createReducedMotionListener(): ReducedMotionState {
  if (typeof window === "undefined") {
    return {
      destroy: () => {
        // no-op on server
      },
      prefersReducedMotion: false,
    };
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = { destroy, prefersReducedMotion: mediaQuery.matches };

  function onChange(event: MediaQueryListEvent) {
    state.prefersReducedMotion = event.matches;
  }

  function destroy() {
    mediaQuery.removeEventListener("change", onChange);
  }

  mediaQuery.addEventListener("change", onChange);
  return state;
}

// --- Spring Physics & Easing ------------------------------------------------

export interface SpringParams {
  damping?: number;
  mass?: number;
  precision?: number;
  stiffness?: number;
}

export interface SpringResult {
  duration: number;
  easing: string;
}

function springPosition(t: number, omega0: number, zeta: number): number {
  if (zeta < 1) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    return (
      1 -
      Math.exp(-zeta * omega0 * t) *
        (Math.cos(omegaD * t) +
          ((zeta * omega0) / omegaD) * Math.sin(omegaD * t))
    );
  }

  const s = Math.sqrt(zeta * zeta - 1);
  const r1 = -omega0 * (zeta + s);
  const r2 = -omega0 * (zeta - s);
  const B = -r1 / (r2 - r1);
  const A = 1 - B;
  return 1 - A * Math.exp(r1 * t) - B * Math.exp(r2 * t);
}

function computeDuration(
  omega0: number,
  zeta: number,
  precision: number
): number {
  const step = 0.001;
  const maxDuration = 10;
  let settledSince = 0;

  for (let t = 0; t < maxDuration; t += step) {
    if (Math.abs(springPosition(t, omega0, zeta) - 1) > precision) {
      settledSince = 0;
    } else {
      settledSince += step;
      if (settledSince > 0.1) {
        return Math.ceil((t - settledSince + step) * 1000);
      }
    }
  }

  return Math.ceil(maxDuration * 1000);
}

const springCache = new Map<string, SpringResult>();

export function spring(params?: SpringParams): SpringResult {
  const {
    stiffness = 100,
    damping = 10,
    mass = 1,
    precision = 0.001,
  } = params ?? {};

  const key = `${stiffness}:${damping}:${mass}:${precision}`;
  const cached = springCache.get(key);
  if (cached) {
    return cached;
  }

  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  const duration = computeDuration(omega0, zeta, precision);
  const numPoints = Math.min(100, Math.max(32, Math.round(duration / 15)));

  const points: string[] = [];
  for (let i = 0; i < numPoints; i++) {
    const t = (i / (numPoints - 1)) * (duration / 1000);
    const value = i === numPoints - 1 ? 1 : springPosition(t, omega0, zeta);
    points.push(String(Math.round(value * 10_000) / 10_000));
  }

  while (points.length > 2 && points.at(-2) === "1") {
    points.splice(points.length - 2, 1);
  }

  const result: SpringResult = {
    duration,
    easing: `linear(${points.join(", ")})`,
  };

  springCache.set(key, result);
  return result;
}

export function resolveEase(
  ease: string | SpringParams | undefined,
  fallbackDuration: number
): { duration: number; ease: string } {
  if (typeof ease === "object") {
    const resolved = spring(ease);
    return { duration: resolved.duration, ease: resolved.easing };
  }
  return {
    duration: fallbackDuration,
    ease: ease ?? "cubic-bezier(0.19, 1, 0.22, 1)",
  };
}

export type EasingFn = (t: number) => number;

const KEYWORDS: Record<string, [number, number, number, number]> = {
  ease: [0.25, 0.1, 0.25, 1],
  "ease-in": [0.42, 0, 1, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
  "ease-out": [0, 0, 0.58, 1],
  linear: [0, 0, 1, 1],
};

const axis = (p1: number, p2: number, t: number) => {
  const u = 1 - t;
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
};

function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFn {
  return (t) => {
    if (t <= 0) {
      return 0;
    }
    if (t >= 1) {
      return 1;
    }
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      if (axis(x1, x2, mid) < t) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return axis(y1, y2, (lo + hi) / 2);
  };
}

function fillStops(stops: (number | null)[]): number[] {
  const filled = [...stops];
  if (filled[0] === null || filled[0] === undefined) {
    filled[0] = 0;
  }
  if (filled.at(-1) === null) {
    filled[filled.length - 1] = 1;
  }

  for (let i = 1; i < filled.length; i += 1) {
    if (filled[i] !== null) {
      continue;
    }
    let next = i;
    while (filled[next] === null) {
      next += 1;
    }
    const start = filled[i - 1] ?? 0;
    const nextVal = filled[next] ?? 1;
    const step = (nextVal - start) / (next - i + 1);
    for (let j = i; j < next; j += 1) {
      filled[j] = start + step * (j - i + 1);
    }
  }

  return filled.map((stop, i, all) => {
    const prev = all[i - 1] ?? 0;
    const current = stop ?? 0;
    return i === 0 ? current : Math.max(current, prev);
  });
}

function linearEasing(body: string): EasingFn | null {
  const values: number[] = [];
  const stops: (number | null)[] = [];

  for (const part of body.split(",")) {
    const tokens = part.trim().split(WHITESPACE_REGEX).filter(Boolean);
    const value = Number(tokens[0]);
    if (!Number.isFinite(value)) {
      return null;
    }

    const percents = tokens.slice(1);
    if (percents.length > 2) {
      return null;
    }
    if (percents.length === 0) {
      values.push(value);
      stops.push(null);
      continue;
    }
    for (const percent of percents) {
      if (!percent.endsWith("%")) {
        return null;
      }
      const stop = Number(percent.slice(0, -1));
      if (!Number.isFinite(stop)) {
        return null;
      }
      values.push(value);
      stops.push(stop / 100);
    }
  }

  if (values.length < 2) {
    return null;
  }
  const positions = fillStops(stops);

  return (t) => {
    const firstPos = positions[0] ?? 0;
    if (t <= firstPos) {
      return values[0] ?? 0;
    }
    const lastPos = positions.at(-1) ?? 1;
    if (t >= lastPos) {
      return values.at(-1) ?? 1;
    }

    let i = 0;
    const last = positions.length - 1;
    while (i < last && (positions[i + 1] ?? 1) < t) {
      i += 1;
    }
    const pNext = positions[i + 1] ?? 1;
    const pCurrent = positions[i] ?? 0;
    const vNext = values[i + 1] ?? 1;
    const vCurrent = values[i] ?? 0;
    const span = pNext - pCurrent;
    if (span === 0) {
      return vNext;
    }
    return vCurrent + ((vNext - vCurrent) * (t - pCurrent)) / span;
  };
}

export function parseEasing(ease: string): EasingFn | null {
  const value = ease.trim().toLowerCase();

  const keyword = KEYWORDS[value];
  if (keyword) {
    return cubicBezier(...keyword);
  }

  const bezier = BEZIER_REGEX.exec(value);
  if (bezier) {
    const n = bezier[1]?.split(",").map((part) => Number(part.trim())) ?? [];
    if (
      n.length !== 4 ||
      n.some((v) => !Number.isFinite(v)) ||
      n[0] === undefined ||
      n[1] === undefined ||
      n[2] === undefined ||
      n[3] === undefined
    ) {
      return null;
    }
    return cubicBezier(n[0], n[1], n[2], n[3]);
  }

  const linear = LINEAR_REGEX.exec(value);
  if (linear?.[1]) {
    return linearEasing(linear[1]);
  }

  return null;
}

const H = 1e-4;

export function slopeAt(easing: EasingFn, t: number): number {
  const a = Math.min(Math.max(t, 0), 1 - H);
  return (easing(a + H) - easing(a)) / H;
}

// --- LCS (Longest Common Subsequence) ----------------------------------------

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: LCS dynamic programming algorithm
export function lcsIndices(a: string[], b: string[]): [number[], number[]] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = m - 1; i >= 0; i--) {
    const row = dp[i];
    const nextRow = dp[i + 1];
    if (!(row && nextRow)) {
      continue;
    }
    for (let j = n - 1; j >= 0; j--) {
      row[j] =
        a[i] === b[j]
          ? (nextRow[j + 1] ?? 0) + 1
          : Math.max(nextRow[j] ?? 0, row[j + 1] ?? 0);
    }
  }

  const ai: number[] = [];
  const bi: number[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    const nextRowVal = dp[i + 1]?.[j] ?? 0;
    const nextColVal = dp[i]?.[j + 1] ?? 0;
    if (a[i] === b[j]) {
      ai.push(i);
      bi.push(j);
      i++;
      j++;
    } else if (nextRowVal >= nextColVal) {
      i++;
    } else {
      j++;
    }
  }

  return [ai, bi];
}

// --- Types ------------------------------------------------------------------

export type SegmentKind = "digit" | "symbol";

export interface Segment {
  id: string;
  kind?: SegmentKind;
  string: string;
}

export type NumberSegment = Segment & { kind: SegmentKind };

export interface BaseMorphOptions {
  disabled?: boolean;
  duration?: number;
  ease?: string | SpringParams;
  element: HTMLElement;
  locale?: Intl.LocalesArgument;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  respectReducedMotion?: boolean;
}

export interface TextMorphOptions extends Omit<BaseMorphOptions, "element"> {
  charClassName?: string;
  debug?: boolean;
  decimals?: number;
  numbers?: boolean;
  onAnimationCancel?: () => void;
  scale?: boolean;
}

export const BASE_DEFAULTS = {
  disabled: false,
  duration: 400,
  ease: "cubic-bezier(0.19, 1, 0.22, 1)",
  locale: "en",
  respectReducedMotion: true,
} as const;

export const DEFAULT_TEXT_MORPH_OPTIONS = {
  ...BASE_DEFAULTS,
  debug: false,
  numbers: true,
  scale: true,
} as const;

// --- DOM Measurement & FLIP -------------------------------------------------

export function fadeDuration(duration: number, fraction: number): number {
  return duration * fraction;
}

export function parseTranslate(element: HTMLElement): {
  tx: number;
  ty: number;
} {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === "none") {
    return { tx: 0, ty: 0 };
  }
  const match = transform.match(MATRIX_REGEX);
  if (!match?.[1]) {
    return { tx: 0, ty: 0 };
  }
  const v = match[1].split(",").map(Number);
  return { tx: v[4] || 0, ty: v[5] || 0 };
}

export function layoutSize(element: HTMLElement): {
  height: number;
  width: number;
} {
  const style = getComputedStyle(element);
  const width = Number.parseFloat(style.width);
  const height = Number.parseFloat(style.height);
  if (Number.isNaN(width) || Number.isNaN(height)) {
    const rect = element.getBoundingClientRect();
    return { height: rect.height, width: rect.width };
  }
  return { height, width };
}

export function cancelAnimations(element: HTMLElement): {
  opacity: number;
  tx: number;
  ty: number;
} {
  const { tx, ty } = parseTranslate(element);
  const opacity = Number(getComputedStyle(element).opacity) || 1;
  for (const a of element.getAnimations()) {
    a.cancel();
  }
  return { opacity, tx, ty };
}

export interface Measures {
  [key: string]: { x: number; y: number };
}

export function measure(element: HTMLElement): Measures {
  const children = Array.from(element.children) as HTMLElement[];
  const measures: Measures = {};
  const rootRect = element.getBoundingClientRect();

  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    if (
      !child ||
      child.hasAttribute(ATTR_EXITING) ||
      child.hasAttribute(ATTR_SR) ||
      child.tagName === "BR"
    ) {
      continue;
    }
    const key = child.getAttribute(ATTR_ID) || `child-${index}`;
    const rect = child.getBoundingClientRect();
    const { tx, ty } = parseTranslate(child);
    measures[key] = {
      x: rect.left - rootRect.left - tx,
      y: rect.top - rootRect.top - ty,
    };
  }

  return measures;
}

export function computeDelta(
  prev: Measures,
  current: Measures,
  key: string
): { dx: number; dy: number } {
  const p = prev[key];
  const c = current[key];
  if (!(p && c)) {
    return { dx: 0, dy: 0 };
  }
  return { dx: p.x - c.x, dy: p.y - c.y };
}

export function findNearestAnchor(
  targetIndex: number,
  ids: string[],
  persistentIds: Set<string>,
  direction: "backward-first" | "forward-first" = "backward-first"
): string | null {
  const [firstDir, secondDir] =
    direction === "backward-first"
      ? (["backward", "forward"] as const)
      : (["forward", "backward"] as const);

  const search = (dir: "backward" | "forward"): string | null => {
    if (dir === "backward") {
      for (let j = targetIndex - 1; j >= 0; j--) {
        const id = ids[j];
        if (id && persistentIds.has(id)) {
          return id;
        }
      }
    } else {
      for (let j = targetIndex + 1; j < ids.length; j++) {
        const id = ids[j];
        if (id && persistentIds.has(id)) {
          return id;
        }
      }
    }
    return null;
  };

  return search(firstDir) ?? search(secondDir);
}

export function resolveExitingAnchors(
  oldChildren: HTMLElement[],
  exiting: Set<HTMLElement>,
  oldIds: string[],
  newIds: Set<string>
): Map<HTMLElement, string | null> {
  const persistentOldIds = new Set(
    oldIds.filter((id, i) => {
      const child = oldChildren[i];
      return newIds.has(id) && child && !exiting.has(child);
    })
  );

  const anchors = new Map<HTMLElement, string | null>();
  for (let i = 0; i < oldChildren.length; i++) {
    const child = oldChildren[i];
    if (!(child && exiting.has(child))) {
      continue;
    }
    anchors.set(
      child,
      findNearestAnchor(i, oldIds, persistentOldIds, "forward-first")
    );
  }

  return anchors;
}

// --- Container Size Transitions ----------------------------------------------

interface AxisState {
  curve: EasingFn | null;
  easing: string;
  elapsed: number | null;
  from: number;
  to: number;
  velocity: number;
}

interface PendingTransition {
  onCancel?: () => void;
  snapshot: () => { height: AxisState; width: AxisState };
  stop: () => void;
}

interface Axis {
  anim: Animation;
  curve: EasingFn | null;
  easing: string;
  from: number;
  startedAt: number;
  to: number;
}

const CARRY_MAX = 8;
const CARRY_OVERSHOOT = 0.1;
const CARRY_MIN_DELTA = 0.5;
const SAME_TARGET = 0.5;

const now = () => performance.now();

export function carry(
  base: EasingFn,
  normalisedVelocity: number
): { curve: EasingFn; k: number } {
  const k = Math.max(
    0,
    Math.min(CARRY_MAX, normalisedVelocity) - slopeAt(base, 0)
  );
  if (!(k > 0)) {
    return { curve: base, k: 0 };
  }

  const bump = Math.max(3, Math.ceil(k / (Math.E * CARRY_OVERSHOOT)) - 1);
  return {
    curve: (t) => (t >= 1 ? 1 : base(t) + k * t * (1 - t) ** bump),
    k,
  };
}

export function sampleEasing(curve: EasingFn, duration: number): string {
  const points = Math.min(120, Math.max(32, Math.round(duration / 8)));
  const values: string[] = [];
  for (let i = 0; i < points; i += 1) {
    const t = i / (points - 1);
    const value = i === points - 1 ? 1 : curve(t);
    values.push(`${Math.round(value * 10_000) / 10_000}`);
  }
  return `linear(${values.join(", ")})`;
}

function animateAxis(
  element: HTMLElement,
  property: "height" | "width",
  from: number,
  to: number,
  previous: AxisState | undefined,
  duration: number,
  ease: string,
  base: EasingFn | null
): Axis {
  const run = (
    fromPos: number,
    toPos: number,
    easingVal: string,
    curveVal: EasingFn | null,
    seek?: number
  ): Axis => {
    const anim = element.animate(
      [{ [property]: `${fromPos}px` }, { [property]: `${toPos}px` }],
      { duration, easing: easingVal, fill: "both" }
    );
    if (seek !== undefined) {
      anim.currentTime = seek;
    }
    return {
      anim,
      curve: curveVal,
      easing: easingVal,
      from: fromPos,
      startedAt: now() - (seek ?? 0),
      to: toPos,
    };
  };

  if (
    previous &&
    previous.elapsed !== null &&
    Math.abs(previous.to - to) < SAME_TARGET
  ) {
    return run(
      previous.from,
      previous.to,
      previous.easing,
      previous.curve,
      previous.elapsed
    );
  }

  const delta = to - from;
  let easing = ease;
  let curve = base;

  if (base && Math.abs(delta) > CARRY_MIN_DELTA) {
    const carried = carry(base, ((previous?.velocity ?? 0) * duration) / delta);
    if (carried.k > 0) {
      curve = carried.curve;
      easing = sampleEasing(carried.curve, duration);
    }
  }

  return run(from, to, easing, curve);
}

function axisState(axisVal: Axis, duration: number): AxisState {
  const gone = axisVal.anim.currentTime === null;
  const run = now() - axisVal.startedAt;
  const settled = gone || !Number.isFinite(run) || run >= duration || run < 0;
  const elapsed = settled ? null : run;

  return {
    curve: axisVal.curve,
    easing: axisVal.easing,
    elapsed,
    from: axisVal.from,
    to: axisVal.to,
    velocity:
      elapsed === null || !axisVal.curve
        ? 0
        : ((axisVal.to - axisVal.from) *
            slopeAt(axisVal.curve, elapsed / duration)) /
          duration,
  };
}

const pendingContainerTransitions = new WeakMap<
  HTMLElement,
  PendingTransition
>();

function restoreSize(element: HTMLElement) {
  element.style.width = "";
  element.style.height = "";
  element.style.transitionProperty = "";
}

export function abortContainerTransition(element: HTMLElement) {
  const entry = pendingContainerTransitions.get(element);
  if (!entry) {
    return;
  }
  pendingContainerTransitions.delete(element);
  entry.stop();
  entry.onCancel?.();
}

export function clearContainerTransition(element: HTMLElement) {
  const entry = pendingContainerTransitions.get(element);
  if (entry) {
    pendingContainerTransitions.delete(element);
    entry.stop();
  }
  restoreSize(element);
}

export function transitionContainerSize(
  element: HTMLElement,
  oldWidth: number,
  oldHeight: number,
  duration: number,
  ease: string,
  onComplete?: () => void,
  onCancel?: () => void
) {
  const previous = pendingContainerTransitions.get(element)?.snapshot();
  abortContainerTransition(element);

  if (oldWidth === 0 || oldHeight === 0) {
    restoreSize(element);
    onCancel?.();
    return;
  }

  element.style.transitionProperty = "none";
  element.style.width = "";
  element.style.height = "";
  if (element.offsetWidth < 0) {
    // reflow
  }

  const { width: newWidth, height: newHeight } = layoutSize(element);
  const base = parseEasing(ease);

  const width = animateAxis(
    element,
    "width",
    oldWidth,
    newWidth,
    previous?.width,
    duration,
    ease,
    base
  );
  const height = animateAxis(
    element,
    "height",
    oldHeight,
    newHeight,
    previous?.height,
    duration,
    ease,
    base
  );

  const stop = () => {
    width.anim.cancel();
    height.anim.cancel();
  };

  width.anim.onfinish = () => {
    pendingContainerTransitions.delete(element);
    stop();
    restoreSize(element);
    onComplete?.();
  };

  pendingContainerTransitions.set(element, {
    onCancel,
    snapshot: () => ({
      height: axisState(height, duration),
      width: axisState(width, duration),
    }),
    stop,
  });
}

export function holdContainerSize(
  element: HTMLElement,
  width: number,
  height: number,
  duration: number,
  onComplete?: () => void,
  onCancel?: () => void
) {
  abortContainerTransition(element);

  element.style.transitionProperty = "none";
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;

  const timer = setTimeout(() => {
    pendingContainerTransitions.delete(element);
    restoreSize(element);
    onComplete?.();
  }, duration);

  const held = (value: number): AxisState => ({
    curve: null,
    easing: "linear",
    elapsed: null,
    from: value,
    to: value,
    velocity: 0,
  });

  pendingContainerTransitions.set(element, {
    onCancel,
    snapshot: () => ({ height: held(height), width: held(width) }),
    stop: () => clearTimeout(timer),
  });
}

// --- DOM Reconciliation & Helpers --------------------------------------------

function layoutOffset(child: HTMLElement, container: HTMLElement) {
  let x = 0;
  let y = 0;
  for (
    let node: HTMLElement | null = child;
    node && node !== container;
    node = node.offsetParent as HTMLElement | null
  ) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y };
}

function createItem(
  tagName: "br" | "span",
  id: string,
  charClassName?: string
): HTMLElement {
  const element = document.createElement(tagName);
  element.setAttribute(ATTR_ITEM, "");
  element.setAttribute(ATTR_ID, id);
  element.setAttribute("aria-hidden", "true");
  if (charClassName && tagName !== "br") {
    element.className = charClassName;
  }
  return element;
}

export function detachFromFlow(
  container: HTMLElement,
  elements: HTMLElement[]
) {
  const snapshots = new Map<
    HTMLElement,
    {
      height: number;
      left: number;
      opacity: number;
      top: number;
      width: number;
    }
  >();

  for (const child of elements) {
    if (child.tagName === "BR") {
      continue;
    }
    const { x, y } = layoutOffset(child, container);
    const { tx, ty } = parseTranslate(child);
    const { width, height } = layoutSize(child);
    const opacity = Number(getComputedStyle(child).opacity) || 1;
    for (const a of child.getAnimations()) {
      a.cancel();
    }
    snapshots.set(child, {
      height,
      left: x + tx,
      opacity,
      top: y + ty,
      width,
    });
  }

  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el && el.tagName === "BR") {
      el.remove();
      elements.splice(i, 1);
    }
  }

  for (const child of elements) {
    const snap = snapshots.get(child);
    if (!snap) {
      continue;
    }
    child.setAttribute(ATTR_EXITING, "");
    child.style.position = "absolute";
    child.style.pointerEvents = "none";
    child.style.left = `${snap.left}px`;
    child.style.top = `${snap.top}px`;
    child.style.width = `${snap.width}px`;
    child.style.height = `${snap.height}px`;
    child.style.opacity = String(snap.opacity);
  }
}

function syncSlot(element: HTMLElement, segment: Segment) {
  if (!segment.kind) {
    element.removeAttribute(ATTR_KIND);
    element.removeAttribute(ATTR_SLOT);
    element.textContent = segment.string;
    return;
  }

  element.setAttribute(ATTR_KIND, segment.kind);
  element.setAttribute(ATTR_SLOT, "");

  let inner = element.firstElementChild as HTMLElement | null;
  if (!inner) {
    element.textContent = "";
    inner = document.createElement("span");
    element.appendChild(inner);
  }
  inner.textContent = segment.string;
}

export function moverOf(element: HTMLElement): HTMLElement {
  return element.hasAttribute(ATTR_SLOT)
    ? ((element.firstElementChild as HTMLElement | null) ?? element)
    : element;
}

export function splitWordSpans(
  element: HTMLElement,
  splits: Map<string, Segment[]>,
  charClassName?: string
) {
  if (splits.size === 0) {
    return;
  }

  const children = Array.from(element.children) as HTMLElement[];
  const split = new Set<string>();

  for (const child of children) {
    if (child.hasAttribute(ATTR_EXITING)) {
      continue;
    }
    const id = child.getAttribute(ATTR_ID);
    if (!id || split.has(id)) {
      continue;
    }
    const charSegs = splits.get(id);
    if (!charSegs) {
      continue;
    }
    split.add(id);

    for (const seg of charSegs) {
      const span = createItem("span", seg.id, charClassName);
      syncSlot(span, seg);
      child.before(span);
    }
    child.remove();
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: DOM reconciliation logic
export function reconcileChildren(
  element: HTMLElement,
  oldChildren: HTMLElement[],
  newIds: Set<string>,
  segments: Segment[],
  charClassName?: string
) {
  const reusable = new Map<string, HTMLElement>();
  for (const child of oldChildren) {
    const id = child.getAttribute(ATTR_ID) as string;
    if (newIds.has(id) && !child.hasAttribute(ATTR_EXITING)) {
      reusable.set(id, child);
      child.remove();
    }
  }

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.remove();
    }
  }

  for (const segment of segments) {
    const existing = reusable.get(segment.id);
    if (existing) {
      reusable.delete(segment.id);
    }

    if (segment.string === "\n") {
      if (existing && existing.tagName === "BR") {
        element.appendChild(existing);
      } else {
        element.appendChild(createItem("br", segment.id));
      }
      continue;
    }

    if (existing && existing.tagName !== "BR") {
      existing.style.transformOrigin = "";
      if (charClassName) {
        existing.className = charClassName;
      }
      syncSlot(existing, segment);
      element.appendChild(existing);
    } else {
      const span = createItem("span", segment.id, charClassName);
      syncSlot(span, segment);
      element.appendChild(span);
    }
  }
}

// --- Numbers & Formatting ----------------------------------------------------

const MINTED_PREFIX = "\u0000n";
let nextNewId = 0;

function mintId(): string {
  return `${MINTED_PREFIX}${nextNewId++}`;
}

export function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

export function hasDigit(value: string): boolean {
  for (const char of value) {
    if (isDigit(char)) {
      return true;
    }
  }
  return false;
}

const CORE_SEPARATORS = ".,'\u00A0\u202F\u2009\u2007";
const PREFIX_CHARS = "+-\u2212(#";
const SUFFIX_CHARS = "%.,!?:;)\"'\u201D\u2019";
const CURRENCY = /\p{Sc}/u;

function isAffix(char: string, set: string): boolean {
  return set.includes(char) || CURRENCY.test(char);
}

export function numericSkeleton(word: string): string {
  let out = "";
  for (const char of word) {
    if (!(isDigit(char) || CORE_SEPARATORS.includes(char))) {
      out += char;
    }
  }
  return out;
}

export function isNumericWord(word: string): boolean {
  let start = 0;
  let end = word.length;

  while (start < end && isAffix(word[start] ?? "", PREFIX_CHARS)) {
    start++;
  }
  while (end > start && isAffix(word[end - 1] ?? "", SUFFIX_CHARS)) {
    end--;
  }

  if (start >= end) {
    return false;
  }
  if (!(isDigit(word[start] ?? "") && isDigit(word[end - 1] ?? ""))) {
    return false;
  }

  for (let i = start; i < end; i++) {
    const char = word[i] ?? "";
    if (!(isDigit(char) || CORE_SEPARATORS.includes(char))) {
      return false;
    }
  }

  return true;
}

export function classifyKind(char: string): SegmentKind {
  return isDigit(char) ? "digit" : "symbol";
}

const separators = new Map<string, string>();

export function decimalSeparator(locale: Intl.LocalesArgument): string {
  const key = String(locale);
  const cached = separators.get(key);
  if (cached) {
    return cached;
  }

  let separator = ".";
  try {
    separator =
      new Intl.NumberFormat(locale)
        .formatToParts(1.1)
        .find((part) => part.type === "decimal")?.value ?? ".";
  } catch {
    // fallback
  }

  separators.set(key, separator);
  return separator;
}

function isGrouping(char: string, decimalChar: string): boolean {
  return char !== decimalChar && CORE_SEPARATORS.includes(char);
}

function keptIndices(chars: string[], decimalChar: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i] ?? "";
    if (!isGrouping(char, decimalChar)) {
      indices.push(i);
    }
  }
  return indices;
}

function groupingIndices(chars: string[], decimalChar: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i] ?? "";
    if (isGrouping(char, decimalChar)) {
      indices.push(i);
    }
  }
  return indices;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: cursor caret matching
function cursorMatch(
  oldChars: string[],
  newChars: string[],
  cursor: number,
  decimalChar: string
): Map<number, number> {
  const matches = new Map<number, number>();

  const oldKept = keptIndices(oldChars, decimalChar);
  const newKept = keptIndices(newChars, decimalChar);
  const pair = (ni: number, oi: number) => {
    const nIndex = newKept[ni];
    const oIndex = oldKept[oi];
    if (nIndex !== undefined && oIndex !== undefined) {
      matches.set(nIndex, oIndex);
    }
  };

  let keptCursor = 0;
  while (keptCursor < newKept.length && (newKept[keptCursor] ?? 0) < cursor) {
    keptCursor++;
  }

  const lenDiff = newKept.length - oldKept.length;

  if (lenDiff > 0) {
    const editStart = keptCursor - lenDiff;
    for (let i = 0; i < editStart && i < oldKept.length; i++) {
      pair(i, i);
    }
    for (let i = keptCursor; i < newKept.length; i++) {
      const oldIdx = i - lenDiff;
      if (oldIdx >= 0 && oldIdx < oldKept.length) {
        pair(i, oldIdx);
      }
    }
  } else if (lenDiff < 0) {
    for (let i = 0; i < keptCursor && i < newKept.length; i++) {
      pair(i, i);
    }
    for (let i = keptCursor; i < newKept.length; i++) {
      const oldIdx = i - lenDiff;
      if (oldIdx >= 0 && oldIdx < oldKept.length) {
        pair(i, oldIdx);
      }
    }
  } else {
    for (let i = 0; i < newKept.length; i++) {
      const nIdx = newKept[i];
      const oIdx = oldKept[i];
      if (
        nIdx !== undefined &&
        oIdx !== undefined &&
        newChars[nIdx] === oldChars[oIdx]
      ) {
        pair(i, i);
      }
    }
  }

  const oldSeps = groupingIndices(oldChars, decimalChar);
  const newSeps = groupingIndices(newChars, decimalChar);
  for (let k = 1; k <= oldSeps.length && k <= newSeps.length; k++) {
    const oldIdx = oldSeps.at(-k);
    const newIdx = newSeps.at(-k);
    if (
      oldIdx !== undefined &&
      newIdx !== undefined &&
      oldChars[oldIdx] === newChars[newIdx]
    ) {
      matches.set(newIdx, oldIdx);
    }
  }

  return matches;
}

const MAGNITUDE_JUMP = 3;

function digitIndices(chars: string[], from: number, to: number): number[] {
  const indices: number[] = [];
  for (let i = from; i < to; i++) {
    const char = chars[i] ?? "";
    if (isDigit(char)) {
      indices.push(i);
    }
  }
  return indices;
}

function integerDigits(chars: string[], start: number, pivot: number): number {
  let count = 0;
  for (let i = start; i < pivot; i++) {
    const char = chars[i] ?? "";
    if (isDigit(char)) {
      count++;
    }
  }
  return count;
}

function findPivot(
  chars: string[],
  start: number,
  end: number,
  decimalChar: string
): number {
  for (let i = end - 1; i >= start; i--) {
    if (chars[i] === decimalChar) {
      return i;
    }
  }
  return end;
}

function placeMatch(
  oldChars: string[],
  newChars: string[],
  decimalChar: string
): Map<number, number> {
  const matches = new Map<number, number>();

  let start = 0;
  while (
    start < oldChars.length &&
    start < newChars.length &&
    oldChars[start] === newChars[start] &&
    !isDigit(oldChars[start] ?? "")
  ) {
    matches.set(start, start);
    start++;
  }

  let oldEnd = oldChars.length;
  let newEnd = newChars.length;
  while (
    oldEnd > start &&
    newEnd > start &&
    oldChars[oldEnd - 1] === newChars[newEnd - 1] &&
    !isDigit(oldChars[oldEnd - 1] ?? "")
  ) {
    matches.set(newEnd - 1, oldEnd - 1);
    oldEnd--;
    newEnd--;
  }

  const oldPivot = findPivot(oldChars, start, oldEnd, decimalChar);
  const newPivot = findPivot(newChars, start, newEnd, decimalChar);

  const oldDigits = integerDigits(oldChars, start, oldPivot);
  const newDigits = integerDigits(newChars, start, newPivot);

  if (
    oldDigits > 0 &&
    newDigits > 0 &&
    Math.abs(oldDigits - newDigits) >= MAGNITUDE_JUMP
  ) {
    return matches;
  }

  function matchSeparator(oldIndex: number, newIndex: number) {
    const char = oldChars[oldIndex] ?? "";
    if (isDigit(char)) {
      return;
    }
    if (char === newChars[newIndex]) {
      matches.set(newIndex, oldIndex);
    }
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: digit matching with LCS
  function matchDigits(
    oldFrom: number,
    oldTo: number,
    newFrom: number,
    newTo: number,
    towardsPivot: boolean
  ): boolean {
    const oldIndices = digitIndices(oldChars, oldFrom, oldTo);
    const newIndices = digitIndices(newChars, newFrom, newTo);

    if (oldIndices.length === newIndices.length || !towardsPivot) {
      const pairs = Math.min(oldIndices.length, newIndices.length);
      for (let k = 0; k < pairs; k++) {
        const oi = oldIndices[k];
        const ni = newIndices[k];
        if (
          oi !== undefined &&
          ni !== undefined &&
          oldChars[oi] === newChars[ni]
        ) {
          matches.set(ni, oi);
        }
      }
      return false;
    }

    const oldRun = oldIndices.map((i) => oldChars[i] ?? "").reverse();
    const newRun = newIndices.map((i) => newChars[i] ?? "").reverse();
    const [ai, bi] = lcsIndices(oldRun, newRun);

    for (let k = 0; k < ai.length; k++) {
      const aIdx = ai[k];
      const bIdx = bi[k];
      if (aIdx !== undefined && bIdx !== undefined) {
        const oi = oldIndices.at(-1 - aIdx);
        const ni = newIndices.at(-1 - bIdx);
        if (oi !== undefined && ni !== undefined) {
          matches.set(ni, oi);
        }
      }
    }

    return ai.length > 0;
  }

  const reshaped = matchDigits(start, oldPivot, start, newPivot, true);
  if (!reshaped) {
    for (let k = 1; oldPivot - k >= start && newPivot - k >= start; k++) {
      matchSeparator(oldPivot - k, newPivot - k);
    }
  }

  if (oldPivot < oldEnd && newPivot < newEnd) {
    matches.set(newPivot, oldPivot);

    for (let k = 1; oldPivot + k < oldEnd && newPivot + k < newEnd; k++) {
      matchSeparator(oldPivot + k, newPivot + k);
    }
    matchDigits(oldPivot + 1, oldEnd, newPivot + 1, newEnd, false);
  }

  return matches;
}

function simpleSegment(chars: string[]): NumberSegment[] {
  return chars.map((char) => ({
    id: mintId(),
    kind: classifyKind(char),
    string: char === " " ? "\u00A0" : char,
  }));
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: number segmentation logic
export function segmentNumber(
  value: string,
  prevSegments?: NumberSegment[],
  cursorIndex?: number,
  decimalChar = "."
): NumberSegment[] {
  const chars = value.split("");

  if (!prevSegments || prevSegments.length === 0) {
    return simpleSegment(chars);
  }

  const oldChars = prevSegments.map((s) =>
    s.string === "\u00A0" ? " " : s.string
  );

  const matches =
    cursorIndex == null
      ? placeMatch(oldChars, chars, decimalChar)
      : cursorMatch(oldChars, chars, cursorIndex, decimalChar);

  const usedIds = new Set<string>();
  for (const [, oldIdx] of matches) {
    const prevSeg = prevSegments[oldIdx];
    if (prevSeg) {
      usedIds.add(prevSeg.id);
    }
  }

  const result: NumberSegment[] = [];

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i] ?? "";
    const kind = classifyKind(char);
    const displayChar = char === " " ? "\u00A0" : char;

    if (matches.has(i)) {
      const oldIdx = matches.get(i);
      const prevSeg = oldIdx === undefined ? undefined : prevSegments[oldIdx];
      result.push({
        id: prevSeg ? prevSeg.id : mintId(),
        kind,
        string: displayChar,
      });
    } else {
      let id = mintId();
      while (usedIds.has(id)) {
        id = mintId();
      }
      usedIds.add(id);
      result.push({ id, kind, string: displayChar });
    }
  }

  return result;
}

// --- Text Segmentation & Diffing ---------------------------------------------

export function createIdAllocator() {
  const used = new Set<string>();

  return {
    has(id: string) {
      return used.has(id);
    },
    reserve(id: string) {
      used.add(id);
    },
    take(base: string): string {
      if (!used.has(base)) {
        used.add(base);
        return base;
      }
      let i = 1;
      while (used.has(`${base}~${i}`)) {
        i++;
      }
      const id = `${base}~${i}`;
      used.add(id);
      return id;
    },
  };
}

export type IdAllocator = ReturnType<typeof createIdAllocator>;

export function groupIntoWords(segments: Segment[]): {
  segments: Segment[];
  word: string;
}[] {
  const groups: { segments: Segment[]; word: string }[] = [];
  let current: Segment[] = [];

  const flush = () => {
    if (current.length === 0) {
      return;
    }
    groups.push({
      segments: current,
      word: current.map((s) => s.string).join(""),
    });
    current = [];
  };

  for (const seg of segments) {
    if (seg.string === "\u00A0" || seg.string === "\n") {
      flush();
    } else {
      current.push(seg);
    }
  }
  flush();

  return groups;
}

function expandNumbers(segments: Segment[]): Segment[] {
  const out: Segment[] = [];
  let run: Segment[] = [];

  const flush = () => {
    if (run.length === 0) {
      return;
    }
    const word = run.map((s) => s.string).join("");
    if (isNumericWord(word)) {
      out.push(...segmentNumber(word));
    } else {
      out.push(...run);
    }
    run = [];
  };

  for (const seg of segments) {
    if (seg.string === "\u00A0" || seg.string === "\n") {
      flush();
      out.push(seg);
    } else {
      run.push(seg);
    }
  }
  flush();

  return out;
}

function allocSegmentId(
  part: string,
  index: number,
  alloc: IdAllocator
): string {
  return alloc.has(part) ? alloc.take(`${part}-${index}`) : alloc.take(part);
}

function segmentsFromIntl(
  iterator: Intl.SegmentIterator<Intl.SegmentData>,
  offset: number,
  alloc: IdAllocator
): Segment[] {
  const segments: Segment[] = [];

  for (const data of Array.from(iterator)) {
    const index = offset + data.index;
    if (data.segment === " ") {
      segments.push({ id: alloc.take(`space-${index}`), string: "\u00A0" });
    } else {
      segments.push({
        id: allocSegmentId(data.segment, index, alloc),
        string: data.segment,
      });
    }
  }

  return segments;
}

function segmentsFallback(
  value: string,
  byWord: boolean,
  offset: number,
  alloc: IdAllocator
): Segment[] {
  const parts = byWord ? value.split(" ") : value.split("");
  const segments: Segment[] = [];
  let index = offset;

  parts.forEach((part, i) => {
    if (byWord && i > 0) {
      segments.push({ id: alloc.take(`space-${index}`), string: "\u00A0" });
      index += 1;
    }
    segments.push({ id: allocSegmentId(part, index, alloc), string: part });
    index += part.length;
  });

  return segments;
}

function segmentLine(
  line: string,
  locale: Intl.LocalesArgument,
  byWord: boolean,
  offset: number,
  alloc: IdAllocator
): Segment[] {
  if (typeof Intl.Segmenter !== "undefined") {
    const segmenter = new Intl.Segmenter(locale, {
      granularity: byWord ? "word" : "grapheme",
    });
    return segmentsFromIntl(
      segmenter.segment(line)[Symbol.iterator](),
      offset,
      alloc
    );
  }

  return segmentsFallback(line, byWord, offset, alloc);
}

export function segmentText(
  value: string,
  locale: Intl.LocalesArgument,
  numbers = true
): Segment[] {
  const hasNewlines = value.includes("\n");
  const byWord = value.includes(" ") || hasNewlines;
  const alloc = createIdAllocator();

  if (hasNewlines) {
    const lines = value.split("\n");
    const allSegments: Segment[] = [];
    let offset = 0;

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        allSegments.push({
          id: alloc.take(`newline-${offset}`),
          string: "\n",
        });
        offset += 1;
      }
      if (line.length > 0) {
        allSegments.push(...segmentLine(line, locale, true, offset, alloc));
      }
      offset += line.length;
    });

    return numbers ? expandNumbers(allSegments) : allSegments;
  }

  const segments = segmentLine(value, locale, byWord, 0, alloc);
  return numbers ? expandNumbers(segments) : segments;
}

const NUMBER_TOKEN = "\u0000#";

function splitIfWhole(
  oldGroup: { segments: Segment[]; word: string },
  splits: Map<string, Segment[]>
): Segment[] {
  if (oldGroup.segments.length !== 1 || oldGroup.word.length <= 1) {
    return oldGroup.segments;
  }

  const wordSeg = oldGroup.segments[0];
  if (!wordSeg) {
    return oldGroup.segments;
  }

  const charSegs = oldGroup.word.split("").map((char, i) => ({
    id: `${wordSeg.id}:${i}`,
    string: char,
  }));
  splits.set(wordSeg.id, charSegs);

  return charSegs;
}

function asNumberSegments(segments: Segment[]): NumberSegment[] {
  return segments.map((seg) => ({
    ...seg,
    kind: seg.kind ?? classifyKind(seg.string),
  }));
}

type WordPlan =
  | { mode: "fresh" }
  | { mode: "morph"; oi: number }
  | { mode: "number"; oi: number }
  | { mode: "reuse"; oi: number };

function charSimilarity(a: string, b: string): number {
  if (a.length === 0 || b.length === 0) {
    return 0;
  }
  const [matched] = lcsIndices(a.split(""), b.split(""));
  return matched.length / Math.max(a.length, b.length);
}

function gapIndices(count: number, matched: Set<number>): number[] {
  const gaps: number[] = [];
  let anchors = 0;
  for (let i = 0; i < count; i++) {
    gaps.push(anchors);
    if (matched.has(i)) {
      anchors++;
    }
  }
  return gaps;
}

const MIN_SIMILARITY = 0.4;

function pairAffinity(a: string, b: string): number {
  if (
    (hasDigit(a) || hasDigit(b)) &&
    numericSkeleton(a) === numericSkeleton(b)
  ) {
    return 1;
  }
  return charSimilarity(a, b);
}

const MAX_MORPH_PAIRINGS = 2500;
const MAX_LCS_CELLS = 1_000_000;

export interface DiffResult {
  segments: Segment[];
  splits: Map<string, Segment[]>;
}

export interface DiffOptions {
  cursorIndex?: number;
  numbers?: boolean;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: text and number diffing engine
export function diffSegments(
  oldSegments: Segment[],
  newText: string,
  locale: Intl.LocalesArgument,
  options: DiffOptions = {}
): DiffResult {
  const newHasSpaces = newText.includes(" ");
  const newHasNewlines = newText.includes("\n");
  const oldWords = groupIntoWords(oldSegments);

  const numbersOn = options.numbers !== false;
  const isNum = (word: string) => numbersOn && isNumericWord(word);
  const token = (word: string) => (isNum(word) ? NUMBER_TOKEN : word);

  const digitsInvolved =
    numbersOn && (hasDigit(newText) || oldWords.some((g) => hasDigit(g.word)));

  if (
    oldWords.length <= 1 &&
    !newHasSpaces &&
    !newHasNewlines &&
    !digitsInvolved
  ) {
    return {
      segments: segmentText(newText, locale, numbersOn),
      splits: new Map(),
    };
  }

  const newWordStrings: string[] = [];
  const newSeparators: string[][] = [];
  const parts = newText.split(WORD_SPLIT_REGEX);
  let pendingSeps: string[] = [];
  for (const part of parts) {
    if (part === " " || part === "\n") {
      pendingSeps.push(part);
    } else if (part.length > 0) {
      newSeparators.push(pendingSeps);
      newWordStrings.push(part);
      pendingSeps = [];
    }
  }
  const trailingSeparators = pendingSeps;

  const oldWordStrings = oldWords.map((g) => g.word);

  if (oldWordStrings.length * newWordStrings.length > MAX_LCS_CELLS) {
    return {
      segments: segmentText(newText, locale, numbersOn),
      splits: new Map(),
    };
  }

  const [oldLcsIdx, newLcsIdx] = lcsIndices(
    oldWordStrings.map(token),
    newWordStrings.map(token)
  );
  const oldMatchedSet = new Set(oldLcsIdx);
  const newMatchedSet = new Set(newLcsIdx);

  const newToOldWord = new Map<number, number>();
  for (let k = 0; k < newLcsIdx.length; k++) {
    const nIndex = newLcsIdx[k];
    const oIndex = oldLcsIdx[k];
    if (nIndex !== undefined && oIndex !== undefined) {
      newToOldWord.set(nIndex, oIndex);
    }
  }

  let oldUnmatched = oldWordStrings
    .map((_, i) => i)
    .filter((i) => !oldMatchedSet.has(i));
  let newUnmatched = newWordStrings
    .map((_, i) => i)
    .filter((i) => !newMatchedSet.has(i));

  const exactUsed = new Set<number>();
  for (const ni of newUnmatched) {
    for (const oi of oldUnmatched) {
      if (exactUsed.has(oi)) {
        continue;
      }
      const newW = newWordStrings[ni];
      const oldW = oldWordStrings[oi];
      if (newW && oldW && token(newW) === token(oldW)) {
        newToOldWord.set(ni, oi);
        exactUsed.add(oi);
        break;
      }
    }
  }
  if (exactUsed.size > 0) {
    oldUnmatched = oldUnmatched.filter((i) => !exactUsed.has(i));
    newUnmatched = newUnmatched.filter((i) => !newToOldWord.has(i));
  }

  const morphPairs = new Map<number, number>();
  const usedOld = new Set<number>();

  const oldGaps = gapIndices(oldWordStrings.length, oldMatchedSet);
  const newGaps = gapIndices(newWordStrings.length, newMatchedSet);

  if (oldUnmatched.length * newUnmatched.length <= MAX_MORPH_PAIRINGS) {
    for (const ni of newUnmatched) {
      let bestOi = -1;
      let bestSim = MIN_SIMILARITY;

      for (const oi of oldUnmatched) {
        if (usedOld.has(oi)) {
          continue;
        }
        if (oldGaps[oi] !== newGaps[ni]) {
          continue;
        }
        const oldW = oldWordStrings[oi] ?? "";
        const newW = newWordStrings[ni] ?? "";
        const sim = pairAffinity(oldW, newW);
        if (sim > bestSim) {
          bestSim = sim;
          bestOi = oi;
        }
      }

      if (bestOi >= 0) {
        morphPairs.set(ni, bestOi);
        usedOld.add(bestOi);
      }
    }
  }

  const plans: WordPlan[] = newWordStrings.map((newWord, ni): WordPlan => {
    const lcsOi = newToOldWord.get(ni);
    const oi = lcsOi ?? morphPairs.get(ni);
    if (oi === undefined) {
      return { mode: "fresh" };
    }
    if (isNum(newWord)) {
      return { mode: "number", oi };
    }
    return lcsOi === undefined ? { mode: "morph", oi } : { mode: "reuse", oi };
  });

  const cursorIndex =
    plans.filter((plan) => plan.mode === "number").length === 1
      ? options.cursorIndex
      : undefined;
  const decimalChar = decimalSeparator(locale);

  const alloc = createIdAllocator();

  for (const plan of plans) {
    if (plan.mode === "fresh") {
      continue;
    }
    const oldGroup = oldWords[plan.oi];
    if (!oldGroup) {
      continue;
    }

    if (plan.mode !== "reuse" && oldGroup.segments.length === 1) {
      const wordSeg = oldGroup.segments[0];
      if (wordSeg) {
        for (let i = 0; i < oldGroup.word.length; i++) {
          alloc.reserve(`${wordSeg.id}:${i}`);
        }
      }
    } else {
      for (const seg of oldGroup.segments) {
        alloc.reserve(seg.id);
      }
    }
  }

  const segments: Segment[] = [];
  const splits = new Map<string, Segment[]>();
  let charOffset = 0;

  function pushSeparators(seps: string[]) {
    for (const sep of seps) {
      if (sep === "\n") {
        segments.push({
          id: alloc.take(`newline-${charOffset}`),
          string: "\n",
        });
      } else {
        segments.push({
          id: alloc.take(`space-${charOffset}`),
          string: "\u00A0",
        });
      }
      charOffset++;
    }
  }

  for (let ni = 0; ni < newWordStrings.length; ni++) {
    pushSeparators(newSeparators[ni] ?? (ni > 0 ? [" "] : []));

    const plan = plans[ni];
    const newWord = newWordStrings[ni] ?? "";

    if (plan && plan.mode === "reuse") {
      const oldGroup = oldWords[plan.oi];
      if (oldGroup) {
        for (const seg of oldGroup.segments) {
          segments.push(seg);
        }
      }
    } else if (plan && plan.mode === "number") {
      const oldGroup = oldWords[plan.oi];
      if (oldGroup) {
        segments.push(
          ...segmentNumber(
            newWord,
            asNumberSegments(splitIfWhole(oldGroup, splits)),
            cursorIndex === undefined ? undefined : cursorIndex - charOffset,
            decimalChar
          )
        );
      }
    } else if (plan && plan.mode === "morph") {
      const oldGroup = oldWords[plan.oi];
      if (oldGroup) {
        const oldWord = oldGroup.word;
        const oldCharSegs = splitIfWhole(oldGroup, splits);

        const oldChars = oldWord.split("");
        const newChars = newWord.split("");
        const [oldCharLcs, newCharLcs] = lcsIndices(oldChars, newChars);

        const newCharToOldSeg = new Map<number, Segment>();
        for (let k = 0; k < newCharLcs.length; k++) {
          const oIdx = oldCharLcs[k];
          const nIdx = newCharLcs[k];
          if (oIdx !== undefined && nIdx !== undefined) {
            const oldSeg = oldCharSegs[oIdx];
            if (oldSeg) {
              newCharToOldSeg.set(nIdx, oldSeg);
            }
          }
        }

        for (let ci = 0; ci < newChars.length; ci++) {
          const charStr = newChars[ci] ?? "";
          if (newCharToOldSeg.has(ci)) {
            const oldSeg = newCharToOldSeg.get(ci);
            if (oldSeg) {
              segments.push({ id: oldSeg.id, string: charStr });
            }
          } else {
            segments.push({
              id: alloc.take(`${newWord}~${ci}`),
              string: charStr,
            });
          }
        }
      }
    } else if (isNum(newWord)) {
      segments.push(...segmentNumber(newWord));
    } else {
      segments.push({ id: alloc.take(newWord), string: newWord });
    }

    charOffset += newWord.length;
  }

  pushSeparators(trailingSeparators);

  return { segments, splits };
}

// --- Animation Routines ------------------------------------------------------

export function animateExit(
  child: HTMLElement,
  options: {
    duration: number;
    dx: number;
    dy: number;
    ease: string;
    scale: boolean;
  }
) {
  const { dx, dy, duration, ease, scale } = options;

  child.animate(
    {
      offset: 1,
      transform: scale
        ? `translate(${dx}px, ${dy}px) scale(0.95)`
        : `translate(${dx}px, ${dy}px)`,
    },
    {
      duration,
      easing: ease,
      fill: "both",
    }
  );

  const fadeAnimation = child.animate(
    {
      offset: 1,
      opacity: 0,
    },
    {
      duration: fadeDuration(duration, 0.25),
      easing: "linear",
      fill: "both",
    }
  );

  fadeAnimation.onfinish = () => {
    child.remove();
  };
}

export function animateEnterOrPersist(
  child: HTMLElement,
  options: {
    deltaX: number;
    deltaY: number;
    duration: number;
    ease: string;
    isNew: boolean;
  }
) {
  const { deltaX, deltaY, isNew, duration, ease } = options;

  const prev = cancelAnimations(child);

  const startX = deltaX + prev.tx;
  const startY = deltaY + prev.ty;
  const startOpacity = isNew && prev.opacity >= 1 ? 0 : prev.opacity;

  child.animate(
    [
      {
        transform: `translate(${startX}px, ${startY}px) scale(${isNew ? 0.95 : 1})`,
      },
      { transform: "none" },
    ],
    {
      duration,
      easing: ease,
      fill: "both",
    }
  );

  if (startOpacity < 1) {
    child.animate([{ opacity: startOpacity }, { opacity: 1 }], {
      delay: isNew ? fadeDuration(duration, 0.25) : 0,
      duration: fadeDuration(duration, isNew ? 0.5 : 0.25),
      easing: "linear",
      fill: "both",
    });
  }
}

const EXIT_FADE = 0.45;
const ENTER_FADE = 0.25;

export function animateNumberExit(
  slot: HTMLElement,
  options: {
    duration: number;
    dx: number;
    dy: number;
    ease: string;
    slideDistance: number;
  }
) {
  const { dx, dy, slideDistance, duration, ease } = options;
  const mover = moverOf(slot);

  slot.animate(
    { offset: 1, transform: `translate(${dx}px, ${dy}px)` },
    { duration, easing: ease, fill: "both" }
  );

  mover.animate(
    { offset: 1, transform: `translate(0px, ${slideDistance}px)` },
    { duration, easing: ease, fill: "both" }
  );

  const fadeAnimation = mover.animate(
    { offset: 1, opacity: 0 },
    { duration: duration * EXIT_FADE, easing: "linear", fill: "both" }
  );

  fadeAnimation.onfinish = () => {
    slot.remove();
  };
}

export function animateNumberEnter(
  slot: HTMLElement,
  options: {
    deltaX: number;
    deltaY: number;
    duration: number;
    ease: string;
    kind: "digit" | "symbol";
    slideDistance: number;
  }
) {
  const { deltaX, deltaY, slideDistance, kind, duration, ease } = options;

  animateNumberPersist(slot, { deltaX, deltaY, duration, ease });

  const mover = moverOf(slot);
  const prev = cancelAnimations(mover);

  const from = kind === "digit" ? -slideDistance : slideDistance;

  mover.animate(
    { offset: 0, transform: `translate(0px, ${prev.ty + from}px)` },
    { duration, easing: ease, fill: "both" }
  );

  const startOpacity = prev.opacity >= 1 ? 0 : prev.opacity;
  if (startOpacity < 1) {
    mover.animate([{ opacity: startOpacity }, { opacity: 1 }], {
      duration: duration * ENTER_FADE,
      easing: "linear",
      fill: "both",
    });
  }
}

export function animateNumberPersist(
  slot: HTMLElement,
  options: {
    deltaX: number;
    deltaY: number;
    duration: number;
    ease: string;
  }
) {
  const { deltaX, deltaY, duration, ease } = options;

  const { tx, ty } = parseTranslate(slot);
  for (const a of slot.getAnimations()) {
    a.cancel();
  }

  const startX = deltaX + tx;
  const startY = deltaY + ty;

  if (startX === 0 && startY === 0) {
    return;
  }

  slot.animate(
    { offset: 0, transform: `translate(${startX}px, ${startY}px)` },
    { duration, easing: ease, fill: "both" }
  );
}

export const GROUP_MIN = 6;
const GROUP_SCALE = 0.8;
const GROUP_EXIT_FADE = 0.45;
const GROUP_ENTER_FADE = 0.35;

function originsFor(elements: HTMLElement[]): string[] {
  const rects = elements.map((element) => element.getBoundingClientRect());
  const left = Math.min(...rects.map((r) => r.left));
  const right = Math.max(...rects.map((r) => r.right));
  const top = Math.min(...rects.map((r) => r.top));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  const centreX = (left + right) / 2;
  const centreY = (top + bottom) / 2;

  return rects.map((r) => `${centreX - r.left}px ${centreY - r.top}px`);
}

export function animateGroupExit(
  elements: HTMLElement[],
  options: { duration: number; ease: string }
) {
  const { duration, ease } = options;
  const origins = originsFor(elements);

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (!element) {
      continue;
    }
    for (const animation of element.getAnimations()) {
      animation.cancel();
    }
    const origin = origins[i];
    if (origin) {
      element.style.transformOrigin = origin;
    }

    element.animate(
      { offset: 1, transform: `scale(${GROUP_SCALE})` },
      { duration, easing: ease, fill: "both" }
    );

    const fade = element.animate(
      { offset: 1, opacity: 0 },
      { duration: duration * GROUP_EXIT_FADE, easing: "linear", fill: "both" }
    );
    fade.onfinish = () => {
      element.remove();
    };
  }
}

export function animateGroupEnter(
  elements: HTMLElement[],
  options: { duration: number; ease: string }
) {
  const { duration, ease } = options;
  const origins = originsFor(elements);

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (!element) {
      continue;
    }
    const prev = cancelAnimations(element);
    const origin = origins[i];
    if (origin) {
      element.style.transformOrigin = origin;
    }

    element.animate(
      { offset: 0, transform: `scale(${GROUP_SCALE})` },
      { duration, easing: ease, fill: "both" }
    );

    const startOpacity = prev.opacity >= 1 ? 0 : prev.opacity;
    element.animate([{ opacity: startOpacity }, { opacity: 1 }], {
      duration: duration * GROUP_ENTER_FADE,
      easing: "linear",
      fill: "both",
    });
  }
}

export function replacedRuns(
  all: HTMLElement[],
  members: Set<HTMLElement>
): HTMLElement[][] {
  const runs: HTMLElement[][] = [];
  let run: HTMLElement[] = [];

  const flush = () => {
    if (run.length >= GROUP_MIN) {
      runs.push(run);
    }
    run = [];
  };

  for (const element of all) {
    if (members.has(element)) {
      run.push(element);
    } else {
      flush();
    }
  }
  flush();

  return runs;
}

// --- TextMorph Engine --------------------------------------------------------

export class TextMorphEngine {
  private readonly element: HTMLElement;
  private readonly options: Omit<TextMorphOptions, "ease"> & { ease?: string } =
    {};
  private data: number | string = "";
  private currentMeasures: Measures = {};
  private prevMeasures: Measures = {};
  private previousSegments: Segment[] = [];
  private isInitialRender = true;
  private readonly reducedMotion: ReducedMotionState | null = null;
  private srNode: HTMLElement | null = null;
  private hasSetup = false;

  constructor(options: TextMorphOptions & { element: HTMLElement }) {
    const given = Object.fromEntries(
      Object.entries(options).filter(([, value]) => value !== undefined)
    ) as TextMorphOptions & { element: HTMLElement };

    const { ease: rawEase, ...rest } = {
      ...DEFAULT_TEXT_MORPH_OPTIONS,
      ...given,
    };
    const { ease, duration } = resolveEase(rawEase, rest.duration ?? 400);

    this.options = { ...rest, duration, ease };
    this.element = options.element;

    if (this.options.respectReducedMotion) {
      this.reducedMotion = createReducedMotionListener();
    }

    if (!this.isDisabled()) {
      this.setup();
    }
  }

  private setup() {
    if (this.hasSetup) {
      return;
    }
    this.hasSetup = true;

    this.element.setAttribute(ATTR_ROOT, "");
    if (this.options.debug) {
      this.element.setAttribute(ATTR_DEBUG, "");
    }
    addStyles();
  }

  destroy() {
    this.reducedMotion?.destroy();
    clearContainerTransition(this.element);
    for (const anim of this.element.getAnimations()) {
      anim.cancel();
    }
    this.srNode?.remove();
    this.srNode = null;
    this.element.removeAttribute(ATTR_ROOT);
    this.element.removeAttribute(ATTR_DEBUG);
    if (this.hasSetup) {
      this.hasSetup = false;
      removeStyles();
    }
  }

  private isDisabled(): boolean {
    return Boolean(
      this.options.disabled || this.reducedMotion?.prefersReducedMotion
    );
  }

  update(value: number | string, cursorIndex?: number) {
    const formatted =
      typeof value === "number"
        ? value.toLocaleString(this.options.locale, {
            maximumFractionDigits: this.options.decimals,
            minimumFractionDigits: this.options.decimals,
          })
        : value;

    if (formatted === this.data) {
      return;
    }
    this.data = formatted;

    if (this.isDisabled()) {
      if (typeof formatted === "string") {
        this.srNode = null;
        this.element.textContent = formatted;
        this.previousSegments = [];
        this.isInitialRender = true;
      }
      return;
    }

    this.setup();

    if (this.options.onAnimationStart && !this.isInitialRender) {
      this.options.onAnimationStart();
    }
    this.createTextGroup(String(this.data), this.element, cursorIndex);
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: text group layout creation
  private createTextGroup(
    value: string,
    element: HTMLElement,
    cursorIndex?: number
  ) {
    const { width: oldWidth, height: oldHeight } = layoutSize(element);
    const numbers = this.options.numbers !== false;

    this.syncAccessibleText(value);

    let segments: Segment[];
    let splits: Map<string, Segment[]>;

    if (this.previousSegments.length > 0) {
      const result = diffSegments(
        this.previousSegments,
        value,
        this.options.locale,
        { cursorIndex, numbers }
      );
      segments = result.segments;
      splits = result.splits;
    } else {
      segments = segmentText(value, this.options.locale, numbers);
      splits = new Map();
    }

    const isEmptyTransition = segments.length === 0;
    if (isEmptyTransition) {
      segments = [{ id: EMPTY_ID, string: "\u200B" }];
    }

    splitWordSpans(element, splits, this.options.charClassName);

    this.prevMeasures = measure(this.element);
    const oldChildren = (Array.from(element.children) as HTMLElement[]).filter(
      (child) => !child.hasAttribute(ATTR_SR)
    );
    const newIds = new Set(segments.map((b) => b.id));

    const exiting = oldChildren.filter(
      (child) =>
        !(
          newIds.has(child.getAttribute(ATTR_ID) as string) ||
          child.hasAttribute(ATTR_EXITING)
        )
    );

    const exitingSet = new Set(exiting);
    const oldIds = oldChildren.map((c) => c.getAttribute(ATTR_ID) as string);
    const exitingAnchorId = resolveExitingAnchors(
      oldChildren,
      exitingSet,
      oldIds,
      newIds
    );

    detachFromFlow(element, exiting);
    reconcileChildren(
      element,
      oldChildren,
      newIds,
      segments,
      this.options.charClassName
    );

    this.currentMeasures = measure(this.element);

    const lineCount = segments.reduce(
      (lines, segment) => (segment.string === "\n" ? lines + 1 : lines),
      1
    );
    const slideDistance = (element.offsetHeight || 20 * lineCount) / lineCount;

    element.style.width = `${oldWidth}px`;
    if (element.offsetWidth < 0) {
      // reflow
    }
    const firstFrameMeasures = measure(this.element);
    element.style.width = "";

    this.updateStyles(segments, firstFrameMeasures, slideDistance);

    const leavingRuns = this.isInitialRender
      ? []
      : replacedRuns(oldChildren, new Set(exiting));
    const leavingTogether = new Set(leavingRuns.flat());

    for (const run of leavingRuns) {
      animateGroupExit(run, {
        duration: this.options.duration ?? 400,
        ease: this.options.ease ?? "cubic-bezier(0.19, 1, 0.22, 1)",
      });
    }

    for (const child of exiting) {
      if (this.isInitialRender || child.getAttribute(ATTR_ID) === EMPTY_ID) {
        child.remove();
        continue;
      }
      if (leavingTogether.has(child)) {
        continue;
      }

      const anchorId = exitingAnchorId.get(child);
      const { dx, dy } = anchorId
        ? computeDelta(this.currentMeasures, this.prevMeasures, anchorId)
        : { dx: 0, dy: 0 };

      if (child.hasAttribute(ATTR_KIND)) {
        animateNumberExit(child, {
          duration: this.options.duration ?? 400,
          dx,
          dy,
          ease: this.options.ease ?? "cubic-bezier(0.19, 1, 0.22, 1)",
          slideDistance,
        });
      } else {
        animateExit(child, {
          duration: this.options.duration ?? 400,
          dx,
          dy,
          ease: this.options.ease ?? "cubic-bezier(0.19, 1, 0.22, 1)",
          scale: this.options.scale ?? true,
        });
      }
    }

    this.previousSegments = segments;

    if (this.isInitialRender) {
      this.isInitialRender = false;
      element.style.width = "";
      element.style.height = "";
      return;
    }

    if (isEmptyTransition) {
      holdContainerSize(
        element,
        oldWidth,
        oldHeight,
        this.options.duration ?? 400,
        this.options.onAnimationComplete,
        this.options.onAnimationCancel
      );
    } else {
      transitionContainerSize(
        element,
        oldWidth,
        oldHeight,
        this.options.duration ?? 400,
        this.options.ease ?? "cubic-bezier(0.19, 1, 0.22, 1)",
        this.options.onAnimationComplete,
        this.options.onAnimationCancel
      );
    }
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: updates element styles per frame
  private updateStyles(
    segments: Segment[],
    firstFrameMeasures: Measures,
    slideDistance: number
  ) {
    if (this.isInitialRender) {
      return;
    }

    const children = (
      Array.from(this.element.children) as HTMLElement[]
    ).filter((child) => !child.hasAttribute(ATTR_SR));
    const segmentIds = segments.map((b) => b.id);
    const kinds = new Map(segments.map((b) => [b.id, b.kind]));

    const settled = children.filter(
      (child) =>
        !child.hasAttribute(ATTR_EXITING) &&
        child.tagName !== "BR" &&
        child.getAttribute(ATTR_ID) !== EMPTY_ID
    );
    const arriving = new Set(
      settled.filter(
        (child) => !this.prevMeasures[child.getAttribute(ATTR_ID) || ""]
      )
    );
    const arrivingTogether = new Set<HTMLElement>();
    for (const run of replacedRuns(settled, arriving)) {
      for (const child of run) {
        arrivingTogether.add(child);
      }
      animateGroupEnter(run, {
        duration: this.options.duration ?? 400,
        ease: this.options.ease ?? "cubic-bezier(0.19, 1, 0.22, 1)",
      });
    }

    const persistentIds = new Set(
      segmentIds.filter((id) => this.prevMeasures[id])
    );

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (!child) {
        continue;
      }
      if (child.hasAttribute(ATTR_EXITING)) {
        continue;
      }
      if (child.tagName === "BR") {
        continue;
      }
      if (arrivingTogether.has(child)) {
        continue;
      }
      const key = child.getAttribute(ATTR_ID) || `child-${index}`;
      if (key === EMPTY_ID) {
        continue;
      }
      const isNew = !this.prevMeasures[key];

      const deltaKey = isNew
        ? findNearestAnchor(
            segments.findIndex((b) => b.id === key),
            segmentIds,
            persistentIds
          )
        : key;

      const { dx: deltaX, dy: deltaY } = deltaKey
        ? computeDelta(this.prevMeasures, firstFrameMeasures, deltaKey)
        : { dx: 0, dy: 0 };

      const kind = kinds.get(key);

      if (kind && isNew) {
        animateNumberEnter(child, {
          deltaX,
          deltaY,
          duration: this.options.duration ?? 400,
          ease: this.options.ease ?? "cubic-bezier(0.19, 1, 0.22, 1)",
          kind,
          slideDistance,
        });
      } else if (kind) {
        animateNumberPersist(child, {
          deltaX,
          deltaY,
          duration: this.options.duration ?? 400,
          ease: this.options.ease ?? "cubic-bezier(0.19, 1, 0.22, 1)",
        });
      } else {
        animateEnterOrPersist(child, {
          deltaX,
          deltaY,
          duration: this.options.duration ?? 400,
          ease: this.options.ease ?? "cubic-bezier(0.19, 1, 0.22, 1)",
          isNew,
        });
      }
    }
  }

  private syncAccessibleText(value: string) {
    if (!this.srNode || this.srNode.parentNode !== this.element) {
      const node = document.createElement("span");
      node.setAttribute(ATTR_SR, "");
      this.element.prepend(node);
      this.srNode = node;
    }

    this.srNode.textContent = value;
  }
}

// --- Controller --------------------------------------------------------------

export class MorphController {
  private instance: TextMorphEngine | null = null;
  private lastCursorIndex?: number;
  private lastText: number | string = "";

  attach(element: HTMLElement, options: TextMorphOptions) {
    this.instance?.destroy();
    this.instance = new TextMorphEngine({ element, ...options });

    if (this.lastText !== "") {
      this.instance.update(this.lastText, this.lastCursorIndex);
    }
  }

  update(text: number | string, cursorIndex?: number) {
    this.lastText = text;
    this.lastCursorIndex = cursorIndex;
    this.instance?.update(text, cursorIndex);
  }

  destroy() {
    this.instance?.destroy();
    this.instance = null;
  }

  static serializeConfig(options: TextMorphOptions): string {
    return JSON.stringify({
      charClassName: options.charClassName,
      debug: options.debug,
      decimals: options.decimals,
      disabled: options.disabled,
      duration: options.duration,
      ease: options.ease,
      locale: options.locale,
      numbers: options.numbers,
      respectReducedMotion: options.respectReducedMotion,
      scale: options.scale,
    });
  }
}

// --- React Helpers & Hook ----------------------------------------------------

function childrenToValue(node: React.ReactNode): number | string {
  if (typeof node === "number") {
    return node;
  }
  return childrenToString(node);
}

function childrenToString(node: React.ReactNode): string {
  if (typeof node === "string") {
    return node;
  }
  if (typeof node === "number") {
    return String(node);
  }
  if (!node || typeof node === "boolean") {
    return "";
  }
  if (Array.isArray(node)) {
    return node.map(childrenToString).join("");
  }
  if (React.isValidElement(node)) {
    throw new Error(
      "TextMorph only accepts text content. Found a React element — use strings, numbers, or expressions instead."
    );
  }
  return String(node);
}

function escapeHTML(value: string): string {
  return value
    .replace(HTML_AMP_REGEX, "&amp;")
    .replace(HTML_LT_REGEX, "&lt;")
    .replace(HTML_GT_REGEX, "&gt;")
    .replace(HTML_QUOT_REGEX, "&quot;")
    .replace(HTML_APOS_REGEX, "&#39;");
}

export function useTextMorph(props: TextMorphOptions) {
  const ref = useRef<HTMLElement | null>(null);
  const controllerRef = useRef(new MorphController());

  const configKey = MorphController.serializeConfig(props);

  const handlers = useRef(props);
  handlers.current = props;

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-attach only when serialized configKey changes; props identity changes every render
  useEffect(() => {
    const controller = controllerRef.current;
    if (ref.current) {
      controller.attach(ref.current, {
        ...props,
        onAnimationCancel: () => {
          handlers.current.onAnimationCancel?.();
        },
        onAnimationComplete: () => {
          handlers.current.onAnimationComplete?.();
        },
        onAnimationStart: () => {
          handlers.current.onAnimationStart?.();
        },
      });
    }

    return () => {
      controller.destroy();
    };
  }, [configKey]);

  const update = useCallback((value: number | string, cursorIndex?: number) => {
    controllerRef.current.update(value, cursorIndex);
  }, []);

  return { ref, update };
}

// --- React Component ---------------------------------------------------------

export type TextMorphProps = TextMorphOptions & {
  /**
   * Semantic HTML element for the root container.
   * @default "span"
   */
  as?: ElementType;
  /**
   * The text or numeric content to morph between updates.
   */
  children: React.ReactNode;
  /**
   * CSS class name applied to the root container.
   */
  className?: string;
  /**
   * Caret position for a single-number value: place matching becomes caret matching.
   */
  cursorIndex?: number;
  /**
   * Live region politeness when the label updates.
   * @default "off"
   */
  live?: "assertive" | "off" | "polite";
  /**
   * Forwarded ref to the container element.
   */
  ref?: React.Ref<HTMLElement>;
  /**
   * Inline styles applied to the root container.
   */
  style?: CSSProperties;
} & Omit<ComponentPropsWithoutRef<"span">, "children" | "style">;

export function TextMorph({
  children,
  cursorIndex,
  className,
  style,
  as: Component = "span",
  charClassName,
  duration,
  ease,
  scale,
  numbers,
  decimals,
  locale,
  debug,
  disabled,
  respectReducedMotion,
  onAnimationStart,
  onAnimationComplete,
  onAnimationCancel,
  live = "off",
  ref,
  ...restProps
}: TextMorphProps) {
  const morphOptions: TextMorphOptions = {
    charClassName,
    debug,
    decimals,
    disabled,
    duration,
    ease,
    locale,
    numbers,
    onAnimationCancel,
    onAnimationComplete,
    onAnimationStart,
    respectReducedMotion,
    scale,
  };

  const { ref: internalRef, update } = useTextMorph(morphOptions);
  const value = childrenToValue(children);
  const cursorRef = useRef(cursorIndex);
  cursorRef.current = cursorIndex;

  const initialHTML = useRef({
    __html: escapeHTML(String(value)).replace(NEWLINE_GLOBAL_REGEX, "<br>"),
  });

  useEffect(() => {
    update(value, cursorRef.current);
  }, [value, update]);

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && "current" in ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [ref, internalRef]
  );

  const elementProps = {
    "aria-live": live === "off" ? undefined : live,
    className: cn(className),
    dangerouslySetInnerHTML: initialHTML.current,
    ref: setRefs,
    style,
    ...restProps,
  };

  return <Component {...elementProps} />;
}

export default TextMorph;
