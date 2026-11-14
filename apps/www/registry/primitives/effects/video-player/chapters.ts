import type { ChapterRange, SegmentPart } from "./defs";
import { clamp } from "./defs";

export function computeChapterRanges(
  rawChapters: { start: number; title: string }[],
  duration: number
): ChapterRange[] {
  const data = rawChapters
    .filter((item) => Number.isFinite(item.start) && item.start >= 0)
    .toSorted((left, right) => left.start - right.start);

  if (!data.length || (data[0] && data[0].start > 0)) {
    data.unshift({ start: 0, title: "" });
  }

  const deduped = data.filter(
    (item, index, list) => index === 0 || item.start !== list[index - 1]?.start
  );

  const eligible = deduped.filter((item) => !duration || item.start < duration);
  const result: ChapterRange[] = [];
  for (let index = 0; index < eligible.length; index += 1) {
    const item = eligible[index];
    if (!item) {
      continue;
    }
    const end = eligible[index + 1]?.start ?? duration;
    if (!duration || end > item.start) {
      result.push({
        start: item.start,
        end,
        title: item.title,
      });
    }
  }
  return result;
}

export function getChapterAt(
  chapterRanges: ChapterRange[],
  time: number,
  fallbackDuration: number
): ChapterRange {
  for (let index = chapterRanges.length - 1; index >= 0; index -= 1) {
    const chapter = chapterRanges[index];
    if (chapter && time >= chapter.start) {
      return chapter;
    }
  }

  return (
    chapterRanges[0] || {
      title: "",
      start: 0,
      end: fallbackDuration,
    }
  );
}

export function getVisualProgressPercent(
  chapterTrack: HTMLElement,
  segmentParts: SegmentPart[],
  time: number,
  duration: number
): number {
  const trackRect = chapterTrack.getBoundingClientRect();
  const fallback = duration ? (time / duration) * 100 : 0;

  if (!(duration && trackRect.width && segmentParts.length)) {
    return fallback;
  }

  const segment =
    segmentParts.find((part, index) => {
      const isLast = index === segmentParts.length - 1;

      return time >= part.start && (time < part.end || isLast);
    }) || segmentParts[0];

  const segmentRect = segment?.element?.getBoundingClientRect();

  if (!(segmentRect?.width && segment)) {
    return fallback;
  }

  const segmentDuration = Math.max(segment.end - segment.start, 0.01);
  const segmentProgress = clamp((time - segment.start) / segmentDuration, 0, 1);
  const x =
    segmentRect.left - trackRect.left + segmentRect.width * segmentProgress;

  return clamp((x / trackRect.width) * 100, 0, 100);
}

export function resolveSeekKeyTime(
  key: string,
  duration: number,
  currentTime: number
): number | null {
  const seekSmall = 5;
  const seekLarge = 15;

  if (key === "ArrowLeft") {
    return currentTime - seekSmall;
  }
  if (key === "ArrowRight") {
    return currentTime + seekSmall;
  }
  if (key === "ArrowDown") {
    return currentTime - seekLarge;
  }
  if (key === "ArrowUp") {
    return currentTime + seekLarge;
  }
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return duration;
  }

  return null;
}
