/**
 * Text roll core — per-character vertical slide transitions.
 * Ported from slot-text (motion-primitives TextRoll variant).
 */

/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: Ported animation engine with per-glyph timing branches. */

export interface TextRollOptions {
  /**
   * Per-letter personality: 0 = every glyph lands identically, 1 = lots of
   * individual variation in speed and a little tilt-wobble as each settles.
   */
  bounce?: number;
  /**
   * Chromatic flash: each incoming glyph rolls in tinted, then fades to its
   * resting color once it lands.
   */
  color?: string | ((index: number, total: number) => string);
  /** How long the chromatic tint takes to fade back to rest, in ms (default 280). */
  colorFade?: number;
  /** "down" rolls glyphs downward (enter from top); "up" rolls upward. */
  direction?: "up" | "down";
  /** Slide duration per character in ms (default 300). */
  duration?: number;
  /** Easing — defaults to a springy, overshooting "back" curve. */
  easing?: string;
  /** How long the incoming glyph trails the outgoing one, in ms (default 50). */
  exitOffset?: number;
  /** Interrupt in-flight rolls when a new target text is set (default true). */
  interrupt?: boolean;
  /** Keep characters that are identical at the same index static. */
  skipUnchanged?: boolean;
  /** Per-character stagger in ms (default 45). */
  stagger?: number;
}

export interface ChromaticOptions {
  from?: number;
  lightness?: number;
  saturation?: number;
  spread?: number;
}

const DEFAULTS = {
  direction: "down" as const,
  stagger: 45,
  duration: 300,
  exitOffset: 50,
  easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: 0.6,
  colorFade: 280,
  skipUnchanged: true,
  interrupt: true,
};

const NBSP = "\u00A0";

const SLOT_TEXT_CLASS = "inline-flex whitespace-pre";
const CHAR_SLOT_CLASS =
  "relative inline-flex flex-none justify-center overflow-hidden overflow-x-visible overflow-y-clip align-bottom leading-[1.3]";
const CHAR_SLOT_RESIZING_CLASS = "overflow-x-clip";
const CHAR_SIZER_CLASS = "invisible whitespace-pre";
const CHAR_FACE_CLASS =
  "absolute inset-0 flex items-center justify-center whitespace-pre will-change-transform";

const glyph = (char: string) => (char === " " ? NBSP : char);

/** Build a `color` function that sweeps hue across the line. */
export function chromatic({
  from = 0,
  spread = 320,
  saturation = 92,
  lightness = 60,
}: ChromaticOptions = {}) {
  return (index: number, total: number) => {
    const t = total <= 1 ? 0 : index / (total - 1);
    return `hsl(${(from + t * spread) % 360} ${saturation}% ${lightness}%)`;
  };
}

interface SlotState {
  pending?: { text: string; options: TextRollOptions };
  target: string;
  timers: number[];
}

const states = new WeakMap<HTMLElement, SlotState>();

function settle(container: HTMLElement) {
  const state = states.get(container);
  if (!state) {
    return;
  }
  for (const timer of state.timers) {
    window.clearTimeout(timer);
  }
  states.delete(container);
  buildTextRoll(container, state.target);
}

function makeFace(char: string) {
  const face = document.createElement("span");
  face.className = CHAR_FACE_CLASS;
  face.dataset.charFace = "";
  face.textContent = glyph(char);
  return face;
}

function buildSlot(char: string) {
  const slot = document.createElement("span");
  slot.className = CHAR_SLOT_CLASS;
  slot.dataset.char = char;
  slot.dataset.charSlot = "";

  const sizer = document.createElement("span");
  sizer.className = CHAR_SIZER_CLASS;
  sizer.dataset.charSizer = "";
  sizer.textContent = glyph(char);

  slot.append(sizer, makeFace(char));
  return slot;
}

export function buildTextRoll(container: HTMLElement, text: string) {
  container.classList.add(...SLOT_TEXT_CLASS.split(" "));
  container.replaceChildren(...Array.from(text, buildSlot));
}

export function animateTextRoll(
  container: HTMLElement,
  toText: string,
  options: TextRollOptions = {}
) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  const {
    direction,
    stagger,
    duration,
    exitOffset,
    easing,
    bounce,
    color,
    colorFade,
    skipUnchanged,
    interrupt,
  } = {
    ...DEFAULTS,
    ...options,
  };

  const running = states.get(container);
  if (running && !interrupt) {
    if (toText !== running.target) {
      running.pending = { text: toText, options };
    }
    return;
  }

  settle(container);

  if (!container.querySelector("[data-char-slot]")) {
    buildTextRoll(container, toText);
    return;
  }

  const slots = Array.from(
    container.querySelectorAll<HTMLElement>("[data-char-slot]")
  );
  const fromText = slots.map((slot) => slot.dataset.char ?? "").join("");
  if (!interrupt && fromText === toText) {
    return;
  }
  const maxLen = Math.max(fromText.length, toText.length);

  const sample =
    slots.find((slot) => (slot.dataset.char ?? "") !== "") ?? slots[0];
  const computedStyle = getComputedStyle(container);
  const H =
    Math.ceil(
      sample?.getBoundingClientRect().height ||
        sample?.offsetHeight ||
        container.getBoundingClientRect().height ||
        Number.parseFloat(computedStyle.lineHeight) ||
        0
    ) ||
    Math.ceil(Number.parseFloat(computedStyle.fontSize) * 1.3) ||
    18;

  const restColor = color ? computedStyle.color : "";

  for (let i = slots.length; i < maxLen; i++) {
    const slot = buildSlot("");
    container.appendChild(slot);
    slots.push(slot);
  }

  const timers: number[] = [];
  const state: SlotState = { timers, target: toText };
  states.set(container, state);

  const outY = direction === "down" ? H : -H;
  const inStart = direction === "down" ? -H : H;

  const wobble = (index: number, salt: number) => {
    const n = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43_758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  };

  let maxEnd = 0;

  for (let i = 0; i < maxLen; i++) {
    const fromChar = fromText[i] || "";
    const toChar = toText[i] || "";
    if (fromChar === toChar && (skipUnchanged || fromChar === "")) {
      continue;
    }

    const slot = slots[i];
    const sizer = slot.querySelector<HTMLElement>("[data-char-sizer]");
    if (!sizer) {
      continue;
    }
    const oldFace = slot.querySelector<HTMLElement>("[data-char-face]");

    const oldW = slot.getBoundingClientRect().width;
    sizer.textContent = glyph(toChar);
    const newW = sizer.getBoundingClientRect().width;
    const widthChanges = Math.abs(newW - oldW) > 0.5;
    if (widthChanges) {
      slot.style.width = `${oldW}px`;
    }

    if (fromChar === "" || toChar === "") {
      slot.classList.add(CHAR_SLOT_RESIZING_CLASS);
    }

    const tint = typeof color === "function" ? color(i, maxLen) : color;

    const isTail = toChar === "";
    const d = Math.round(
      duration * (isTail ? 0.75 : 1) * (1 + bounce * 0.45 * wobble(i, 1))
    );
    const staggerIndex = isTail
      ? toText.length * 0.5 + (i - toText.length) * 0.25
      : i;
    const base = Math.round(
      staggerIndex * stagger * (1 + bounce * 0.25 * wobble(i, 2))
    );
    const tilt = (bounce * 5 * wobble(i, 3)).toFixed(2);

    const rollTrans = `transform ${d}ms ${easing}`;
    const trans = color
      ? `${rollTrans}, color ${colorFade}ms linear ${d}ms`
      : rollTrans;

    const newFace = makeFace(toChar);
    newFace.style.transformOrigin = "50% 50%";
    newFace.style.transform = `translateY(${inStart}px) rotate(${tilt}deg)`;
    if (tint) {
      newFace.style.color = tint;
    }
    slot.appendChild(newFace);

    slot.getBoundingClientRect();

    if (widthChanges) {
      let wDelay = base;
      let wDur = d;
      if (isTail) {
        wDelay = base + Math.round(d * 0.55);
        wDur = Math.max(140, Math.round(d * 0.6));
      } else if (fromChar === "") {
        wDur = Math.max(140, Math.round(d * 0.45));
      }
      timers.push(
        window.setTimeout(() => {
          slot.style.transition = `width ${wDur}ms cubic-bezier(0.2, 0, 0, 1)`;
          slot.style.width = `${newW}px`;
        }, wDelay)
      );
      maxEnd = Math.max(maxEnd, wDelay + wDur);
    }

    maxEnd = Math.max(maxEnd, base + exitOffset + d + (color ? colorFade : 0));

    if (oldFace) {
      timers.push(
        window.setTimeout(() => {
          oldFace.style.transition = rollTrans;
          oldFace.style.transform = `translateY(${outY}px) rotate(${-Number(tilt)}deg)`;
        }, base)
      );
    }

    timers.push(
      window.setTimeout(() => {
        newFace.style.transition = trans;
        newFace.style.transform = "translateY(0) rotate(0deg)";
        if (color) {
          newFace.style.color = restColor;
        }

        const done = (event: TransitionEvent) => {
          if (event.propertyName !== "transform") {
            return;
          }
          newFace.removeEventListener("transitionend", done);
          slot.dataset.char = toChar;
          slot.style.removeProperty("transition");
          slot.style.removeProperty("width");
          slot.classList.remove(CHAR_SLOT_RESIZING_CLASS);
          for (const face of slot.querySelectorAll("[data-char-face]")) {
            if (face !== newFace) {
              face.remove();
            }
          }
        };
        newFace.addEventListener("transitionend", done);
      }, base + exitOffset)
    );
  }

  const total = maxEnd + 80;
  timers.push(
    window.setTimeout(() => {
      const pending = state.pending;
      states.delete(container);
      buildTextRoll(container, toText);
      if (pending) {
        animateTextRoll(container, pending.text, pending.options);
      }
    }, total)
  );
}

export function clearTextRoll(container: HTMLElement, text = "") {
  settle(container);
  for (const className of SLOT_TEXT_CLASS.split(" ")) {
    container.classList.remove(className);
  }
  container.textContent = text;
}
