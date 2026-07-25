import type { HeroCarouselImage } from "@/registry/primitives/effects/hero-carousel";

const HERO_CAROUSEL_MEDIA =
  "https://sora.axyl.io.vn/media/demo/hero-carousel" as const;

const HERO_CAROUSEL_FILE_PATTERN = /^([a-z]+)-(\d+)$/;

const HERO_CAROUSEL_FILES = [
  "trellis-1",
  "ray-2",
  "spotlight-1",
  "threadcheck-1",
  "trellis-2",
  "trellis-4",
  "trackit-1",
  "tastify-1",
  "trackit-2",
  "ray-3",
  "ray-1",
  "tastify-2",
  "trackit-3",
  "trellis-3",
] as const;

export const heroCarouselDemoImages: HeroCarouselImage[] =
  HERO_CAROUSEL_FILES.map((file) => {
    const [, project, number] = file.match(HERO_CAROUSEL_FILE_PATTERN) ?? [];
    const name = project
      ? project.charAt(0).toUpperCase() + project.slice(1)
      : file;
    return {
      alt: `${name} preview ${number}`,
      src: `${HERO_CAROUSEL_MEDIA}/${file}.webp`,
    };
  });
