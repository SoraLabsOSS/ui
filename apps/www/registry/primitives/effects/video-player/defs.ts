import type {
  ComponentPropsWithoutRef,
  ReactNode,
  Ref,
  RefCallback,
  RefObject,
} from "react";

export interface VideoPlayerChapter {
  /** Chapter start time, in seconds. */
  start: number;
  /** Chapter label shown in the hover-scrub preview pill. */
  title: string;
}

export interface VideoPlayerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Chapter markers segmenting the seek timeline. */
  chapters?: VideoPlayerChapter[];
  /**
   * Content rendered inside the trigger button that opens the player.
   * @default Video icon + "Open video player"
   */
  children?: ReactNode;
  /**
   * Initial playback speed.
   * @default 1
   */
  defaultSpeed?: number;
  /**
   * aria-label for the player dialog.
   * @default "Custom video player"
   */
  dialogLabel?: string;
  /** iOS-optimized fallback source for the main video (iPad/iPhone/touch Mac). */
  iosSrc?: string;
  /** Class name merged onto the `.media-01` player root. */
  playerClassName?: string;
  /** iOS-optimized fallback source for the hover-scrub preview video. */
  previewIosSrc?: string;
  /**
   * Hosted MP4 URL for the muted hover-scrub preview video.
   * @default src
   */
  previewSrc?: string;
  ref?: Ref<HTMLDivElement>;
  /**
   * Playback speed choices shown in the speed menu.
   * @default [1, 1.25, 1.5, 1.75, 2]
   */
  speedOptions?: number[];
  /**
   * Hosted MP4 URL for the main video. Also used for the hover-scrub
   * preview video unless `previewSrc` is set.
   */
  src: string;
  /** Class name merged onto the trigger button. */
  triggerClassName?: string;
}

export type ExtendedVideoElement = HTMLVideoElement & {
  preservesPitch?: boolean;
  webkitPreservesPitch?: boolean;
  webkitEnterFullscreen?: () => void;
  webkitPresentationMode?: string;
  webkitSetPresentationMode?: (mode: string) => void;
  webkitSupportsPresentationMode?: (mode: string) => boolean;
};

export interface ChapterRange {
  end: number;
  start: number;
  title: string;
}

export interface SegmentPart {
  element: HTMLElement;
  end: number;
  fill: HTMLElement;
  start: number;
  title?: string;
}

export const DEFAULT_SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];
export const IOS_USER_AGENT_PATTERN = /iPad|iPhone|iPod/;

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }

      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as RefObject<T | null>).current = node;
      }
    }
  };
}

export function formatSpeedLabel(value: number) {
  return `${Number(value.toFixed(2))}x`;
}

export function sanitizeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function formatTime(value: number) {
  if (!Number.isFinite(value)) {
    return "0:00";
  }

  const total = Math.max(0, Math.floor(value));
  const seconds = total % 60;
  const minutes = Math.floor(total / 60) % 60;
  const hours = Math.floor(total / 3600);
  const secondsPadded = String(seconds).padStart(2, "0");

  if (hours > 0) {
    const minutesPadded = String(minutes).padStart(2, "0");
    return `${hours}:${minutesPadded}:${secondsPadded}`;
  }

  return `${minutes}:${secondsPadded}`;
}

export function easeOutQuart(progress: number) {
  return 1 - (1 - progress) ** 4;
}

export function getSubpath(points: readonly (readonly [number, number])[]) {
  const lines = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`;
    })
    .join(" ");

  return `${lines} Z`;
}

export const PLAY_ICON_SHAPES = {
  play: [
    [
      [11, 10],
      [18, 13.74],
      [18, 22.28],
      [11, 26],
    ],
    [
      [18, 13.74],
      [26, 18],
      [26, 18],
      [18, 22.28],
    ],
  ],
  pause: [
    [
      [11, 10],
      [17, 10],
      [17, 26],
      [11, 26],
    ],
    [
      [20, 10],
      [26, 10],
      [26, 26],
      [20, 26],
    ],
  ],
} as const;
