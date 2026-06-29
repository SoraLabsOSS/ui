import type { ComponentGalleryCardPreview } from "@/lib/registry/types";

export interface ComponentPreviewMedia {
  poster: string;
  videoWebm: string;
}

const COMPONENT_MEDIA_BASE_URL = "https://sora.axyl.io.vn/media/components";

export function getComponentPreviewMedia(slug: string): ComponentPreviewMedia {
  const base = `${COMPONENT_MEDIA_BASE_URL}/${slug}`;
  return {
    poster: `${base}/poster.webp`,
    videoWebm: `${base}/preview.webm`,
  };
}

export function resolveComponentCardPreview(
  slug: string,
  cardPreview?: ComponentGalleryCardPreview,
  legacyVideo?: string
): ComponentGalleryCardPreview | undefined {
  if (cardPreview) {
    return cardPreview;
  }

  if (legacyVideo) {
    return { videoMp4: legacyVideo };
  }

  return getComponentPreviewMedia(slug);
}
