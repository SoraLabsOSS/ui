"use client";

import {
  InfiniteScrollingImages,
  type InfiniteScrollingImagesItem,
} from "@/registry/primitives/effects/infinite-scrolling-images";

const INFINITE_SCROLLING_IMAGES_MEDIA =
  "https://cdn.soralabs.studio/media/demo/infinite-scrolling-images" as const;

const DEMO_ITEMS: InfiniteScrollingImagesItem[] = [
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

export function InfiniteScrollingImagesExample() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center py-6 lg:py-10">
      <InfiniteScrollingImages
        className="h-[min(56dvh,560px)] w-full md:h-screen"
        items={DEMO_ITEMS}
      />
    </div>
  );
}

export default InfiniteScrollingImagesExample;
