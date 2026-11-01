import {
  ATTR_EXITING,
  ATTR_ID,
  ATTR_ITEM,
  ATTR_KIND,
  ATTR_SLOT,
  ATTR_SR,
  type EasingFn,
  MATRIX_REGEX,
  type Segment,
} from "./defs";
import { parseEasing, slopeAt } from "./easing";

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
