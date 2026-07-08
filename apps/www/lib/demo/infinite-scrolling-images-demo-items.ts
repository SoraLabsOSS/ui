import type { InfiniteScrollingImagesItem } from "@/registry/primitives/effects/infinite-scrolling-images";

const INFINITE_SCROLLING_IMAGES_MEDIA =
  "https://sora.axyl.io.vn/media/demo/infinite-scrolling-images" as const;

export const infiniteScrollingImagesDemoItems: InfiniteScrollingImagesItem[] = [
  {
    alt: "Infinite scrolling image 1",
    src: `${INFINITE_SCROLLING_IMAGES_MEDIA}/item-1.jpg`,
  },
  {
    alt: "Infinite scrolling image 2",
    src: `${INFINITE_SCROLLING_IMAGES_MEDIA}/item-2.jpg`,
  },
  {
    alt: "Infinite scrolling image 3",
    src: `${INFINITE_SCROLLING_IMAGES_MEDIA}/item-3.jpg`,
  },
  {
    alt: "Infinite scrolling image 4",
    src: `${INFINITE_SCROLLING_IMAGES_MEDIA}/item-4.jpg`,
  },
  {
    alt: "Infinite scrolling image 5",
    src: `${INFINITE_SCROLLING_IMAGES_MEDIA}/item-5.jpg`,
  },
  {
    alt: "Infinite scrolling image 6",
    src: `${INFINITE_SCROLLING_IMAGES_MEDIA}/item-6.jpg`,
  },
];
