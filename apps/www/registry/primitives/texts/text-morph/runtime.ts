import {
  ATTR_DEBUG,
  ATTR_EXITING,
  ATTR_ID,
  ATTR_KIND,
  ATTR_ROOT,
  ATTR_SR,
  DEFAULT_TEXT_MORPH_OPTIONS,
  EMPTY_ID,
  type Segment,
  type TextMorphOptions,
} from "./defs";
import {
  createReducedMotionListener,
  type ReducedMotionState,
  resolveEase,
} from "./easing";
import {
  cancelAnimations,
  clearContainerTransition,
  computeDelta,
  detachFromFlow,
  fadeDuration,
  findNearestAnchor,
  holdContainerSize,
  layoutSize,
  type Measures,
  measure,
  moverOf,
  parseTranslate,
  reconcileChildren,
  resolveExitingAnchors,
  splitWordSpans,
  transitionContainerSize,
} from "./layout";
import { diffSegments, segmentText } from "./segments";
import { addStyles, removeStyles } from "./styles";

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
    const { width: oldWidth, height: oldHeight } = this.isInitialRender
      ? { height: 0, width: 0 }
      : layoutSize(element);
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

    this.prevMeasures = this.isInitialRender ? {} : measure(this.element);
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

    this.currentMeasures = this.isInitialRender ? {} : measure(this.element);

    const lineCount = segments.reduce(
      (lines, segment) => (segment.string === "\n" ? lines + 1 : lines),
      1
    );
    const slideDistance = this.isInitialRender
      ? 0
      : (element.offsetHeight || 20 * lineCount) / lineCount;

    if (!this.isInitialRender) {
      element.style.width = `${oldWidth}px`;
      if (element.offsetWidth < 0) {
        // reflow
      }
      const firstFrameMeasures = measure(this.element);
      element.style.width = "";

      this.updateStyles(segments, firstFrameMeasures, slideDistance);
    }

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
