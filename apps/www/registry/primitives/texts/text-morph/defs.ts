// --- Constants & Regexes -----------------------------------------------------

export const ATTR_ROOT = "torph-root";
export const ATTR_ITEM = "torph-item";
export const ATTR_ID = "torph-id";
export const ATTR_KIND = "torph-kind";
export const ATTR_SLOT = "torph-slot";
export const ATTR_EXITING = "torph-exiting";
export const ATTR_SR = "torph-sr";
export const ATTR_DEBUG = "torph-debug";
export const EMPTY_ID = "empty";

export const WHITESPACE_REGEX = /\s+/;
export const BEZIER_REGEX = /^cubic-bezier\(([^)]*)\)$/;
export const LINEAR_REGEX = /^linear\(([^)]*)\)$/;
export const MATRIX_REGEX = /matrix\(([^)]+)\)/;
export const WORD_SPLIT_REGEX = /( |\n)/;
export const HTML_AMP_REGEX = /&/g;
export const HTML_LT_REGEX = /</g;
export const HTML_GT_REGEX = />/g;
export const HTML_QUOT_REGEX = /"/g;
export const HTML_APOS_REGEX = /'/g;
export const NEWLINE_GLOBAL_REGEX = /\n/g;

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

export type EasingFn = (t: number) => number;

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
