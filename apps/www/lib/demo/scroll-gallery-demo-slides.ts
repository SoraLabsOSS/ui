import type { ScrollGallerySlide } from "@/registry/primitives/effects/scroll-gallery";

const SCROLL_GALLERY_MEDIA =
  "https://sora.axyl.io.vn/media/demo/scroll-gallery" as const;

export const scrollGalleryDemoSlides: ScrollGallerySlide[] = [
  {
    title: "Room 14B",
    image: `${SCROLL_GALLERY_MEDIA}/featured-work-1.webp`,
    url: "#",
  },
  {
    title: "Subject Identified",
    image: `${SCROLL_GALLERY_MEDIA}/featured-work-2.webp`,
    url: "#",
  },
  {
    title: "Dossier 09",
    image: `${SCROLL_GALLERY_MEDIA}/featured-work-3.webp`,
    url: "#",
  },
  {
    title: "Stairwell C7",
    image: `${SCROLL_GALLERY_MEDIA}/featured-work-4.webp`,
    url: "#",
  },
];
