"use client";

import { infiniteScrollingImagesDemoItems } from "@/lib/demo/infinite-scrolling-images-demo-items";
import { InfiniteScrollingImages } from "@/registry/primitives/effects/infinite-scrolling-images";

export function InfiniteScrollingImagesExample() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center py-6 lg:py-10">
      <InfiniteScrollingImages
        className="h-[min(56dvh,560px)] w-full md:h-screen"
        items={infiniteScrollingImagesDemoItems}
      />
    </div>
  );
}

export default InfiniteScrollingImagesExample;
