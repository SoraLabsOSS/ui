"use client";

import { infiniteScrollingImagesDemoItems } from "@/lib/demo/infinite-scrolling-images-demo-items";
import { InfiniteScrollingImages } from "@/registry/primitives/effects/infinite-scrolling-images";

export function InfiniteScrollingImagesDemoPage() {
  return (
    <main className="h-svh w-full overflow-hidden">
      <InfiniteScrollingImages
        className="h-full w-full"
        items={infiniteScrollingImagesDemoItems}
      />
    </main>
  );
}
