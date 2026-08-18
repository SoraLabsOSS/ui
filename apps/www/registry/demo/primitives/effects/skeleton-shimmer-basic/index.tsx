"use client";

import { Button } from "@workspace/ui/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  SkeletonOverlay,
  SkeletonShimmer,
} from "@/registry/primitives/effects/skeleton-shimmer";

const BANNER_IMAGE_URL = "https://sora.axyl.io.vn/media/axyl-banner.jpg";
const AVATAR_IMAGE_URL = "https://sora.axyl.io.vn/media/axyl-avt.jpg";

export interface SkeletonShimmerBasicDemoProps {
  /**
   * Shimmer sweep duration in seconds.
   * @default 1.5
   */
  shimmerDuration?: number;
}

export function SkeletonShimmerBasicDemo({
  shimmerDuration = 1.5,
}: SkeletonShimmerBasicDemoProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  const handleReplay = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 2200);
  };

  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-4 px-0 py-3 sm:p-6">
      <div className="w-full max-w-none overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-colors sm:max-w-sm sm:p-5">
        {loading ? (
          /* Skeleton Loading State without View Transitions */
          <div className="flex flex-col gap-4">
            {/* Top row: Avatar + Header lines */}
            <div className="flex items-center gap-3">
              <SkeletonShimmer
                borderRadius="50%"
                className="size-11 shrink-0"
                duration={shimmerDuration}
              />
              <div className="flex flex-1 flex-col gap-2">
                <SkeletonShimmer
                  borderRadius="4px"
                  className="h-4 w-3/4"
                  duration={shimmerDuration}
                />
                <SkeletonShimmer
                  borderRadius="4px"
                  className="h-3 w-1/2"
                  duration={shimmerDuration}
                />
              </div>
            </div>

            {/* Media placeholder banner */}
            <SkeletonShimmer
              borderRadius="12px"
              className="h-36 w-full"
              duration={shimmerDuration}
            />

            {/* Content paragraph with Zero-Layout-Shift overlay */}
            <SkeletonOverlay borderRadius="6px" duration={shimmerDuration}>
              <p className="text-sm leading-relaxed">
                Skeleton placeholder sized to the incoming card content so the
                layout never shifts.
              </p>
            </SkeletonOverlay>

            {/* Bottom action buttons */}
            <div className="flex items-center justify-between pt-1">
              <SkeletonShimmer
                borderRadius="6px"
                className="h-8 w-20"
                duration={shimmerDuration}
              />
              <SkeletonShimmer
                borderRadius="6px"
                className="h-8 w-24"
                duration={shimmerDuration}
              />
            </div>
          </div>
        ) : (
          /* Real Content State with images */
          <div className="flex flex-col gap-4">
            {/* Top row: Avatar + Header lines */}
            <div className="flex items-center gap-3">
              <Image
                alt="Axyl"
                className="size-11 shrink-0 rounded-full object-cover"
                draggable={false}
                height={44}
                referrerPolicy="no-referrer"
                src={AVATAR_IMAGE_URL}
                unoptimized
                width={44}
              />
              <div className="flex flex-1 flex-col">
                <h4 className="font-semibold text-foreground text-sm">Axyl</h4>
                <p className="text-muted-foreground text-xs">
                  @axyl1410 • Sora UI
                </p>
              </div>
            </div>

            {/* Media Banner Image */}
            <div className="relative h-36 w-full overflow-hidden rounded-xl">
              <Image
                alt="Featured Banner"
                className="size-full object-cover"
                draggable={false}
                height={144}
                referrerPolicy="no-referrer"
                src={BANNER_IMAGE_URL}
                unoptimized
                width={336}
              />
            </div>

            {/* Content paragraph */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              Skeleton placeholder sized to the incoming card content so the
              layout never shifts.
            </p>

            {/* Bottom action buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                className="rounded-lg border px-3 py-1.5 font-medium text-foreground text-xs hover:bg-muted"
                type="button"
              >
                Bookmark
              </button>
              <button
                className="rounded-lg bg-primary px-3.5 py-1.5 font-medium text-primary-foreground text-xs hover:opacity-90"
                type="button"
              >
                Read More
              </button>
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleReplay} size="sm" type="button" variant="outline">
        {loading ? "Loading..." : "Replay Loading"}
      </Button>
    </div>
  );
}

export default SkeletonShimmerBasicDemo;
