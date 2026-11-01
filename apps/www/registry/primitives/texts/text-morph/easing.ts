import {
  BEZIER_REGEX,
  type EasingFn,
  LINEAR_REGEX,
  type SpringParams,
  type SpringResult,
  WHITESPACE_REGEX,
} from "./defs";

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
