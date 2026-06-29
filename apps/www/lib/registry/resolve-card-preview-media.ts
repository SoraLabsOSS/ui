import type { ComponentGalleryCardPreview } from "@/lib/registry/types";

export interface ResolvedCardPreviewMedia {
  poster?: string;
  videoMp4?: string;
  videoWebm?: string;
}

let preferredVideoFormat: "webm" | "mp4" | null = null;

const LEGACY_PREVIEW_VIDEO_REGEX = /^(.*)\.(mov|mp4|webm)(\?.*)?$/i;

export function resolveCardPreviewMedia(
  cardPreview?: ComponentGalleryCardPreview,
  legacyVideo?: string
): ResolvedCardPreviewMedia | null {
  if (cardPreview) {
    const { poster, videoMp4, videoWebm } = cardPreview;
    if (poster ?? videoMp4 ?? videoWebm) {
      return { poster, videoMp4, videoWebm };
    }
  }

  if (!legacyVideo) {
    return null;
  }

  const match = legacyVideo.match(LEGACY_PREVIEW_VIDEO_REGEX);
  if (!match) {
    return { videoMp4: legacyVideo };
  }

  const [, base, , query = ""] = match;
  return {
    videoMp4: `${base}.mp4${query}`,
    videoWebm: `${base}.webm${query}`,
  };
}

export function getPreferredCardPreviewVideoSrc(
  media: ResolvedCardPreviewMedia
): string | null {
  if (!(media.videoWebm ?? media.videoMp4)) {
    return null;
  }

  if (typeof window === "undefined") {
    return media.videoMp4 ?? media.videoWebm ?? null;
  }

  if (!preferredVideoFormat) {
    const probe = document.createElement("video");
    const supportsWebm = Boolean(
      probe.canPlayType('video/webm; codecs="vp9,opus"')
    );
    preferredVideoFormat = supportsWebm ? "webm" : "mp4";
  }

  if (preferredVideoFormat === "webm" && media.videoWebm) {
    return media.videoWebm;
  }

  return media.videoMp4 ?? media.videoWebm ?? null;
}

const warmedVideoUrls = new Set<string>();

export function warmCardPreviewVideo(url: string) {
  if (typeof window === "undefined" || warmedVideoUrls.has(url)) {
    return;
  }

  warmedVideoUrls.add(url);

  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  video.load();
}
