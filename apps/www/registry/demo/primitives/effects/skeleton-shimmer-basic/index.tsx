"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useState } from "react";
import { SkeletonOverlay } from "@/registry/primitives/effects/skeleton-shimmer";
import { Button } from "@/registry/ui/base/button";

const BANNER_IMAGE_URL = "https://cdn.soralabs.io.vn/media/axyl-banner.jpg";
const AVATAR_IMAGE_URL = "https://cdn.soralabs.io.vn/media/axyl-avt.jpg";
const LOAD_DELAY_MS = 2200;
const CARD_COPY =
  "Skeleton placeholder sized to the incoming card content so the layout never shifts.";

export interface SkeletonShimmerBasicDemoProps {
  /**
   * Shimmer sweep duration in seconds.
   * @default 1.5
   */
  shimmerDuration?: number;
}

function CoverIfLoading({
  borderRadius,
  children,
  className,
  duration,
  loading,
}: {
  borderRadius?: string;
  children: ReactNode;
  className?: string;
  duration: number;
  loading: boolean;
}) {
  if (!loading) {
    return children;
  }

  return (
    <SkeletonOverlay
      borderRadius={borderRadius}
      className={className}
      duration={duration}
    >
      {children}
    </SkeletonOverlay>
  );
}

export function SkeletonShimmerBasicDemo({
  shimmerDuration = 1.5,
}: SkeletonShimmerBasicDemoProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = window.setTimeout(() => setLoading(false), LOAD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-4 px-0 py-3 sm:p-6">
      <div className="w-full max-w-none overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-colors sm:max-w-sm sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CoverIfLoading
              borderRadius="50%"
              className="shrink-0"
              duration={shimmerDuration}
              loading={loading}
            >
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
            </CoverIfLoading>
            <CoverIfLoading
              borderRadius="6px"
              className="min-w-0 flex-1"
              duration={shimmerDuration}
              loading={loading}
            >
              <div className="flex min-w-0 flex-col">
                <h4 className="font-semibold text-foreground text-sm">Axyl</h4>
                <p className="text-muted-foreground text-xs">
                  @axyl1410 • Sora UI
                </p>
              </div>
            </CoverIfLoading>
          </div>

          <CoverIfLoading
            borderRadius="12px"
            className="w-full"
            duration={shimmerDuration}
            loading={loading}
          >
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
          </CoverIfLoading>

          <CoverIfLoading
            borderRadius="6px"
            className="w-full"
            duration={shimmerDuration}
            loading={loading}
          >
            <p className="text-muted-foreground text-sm leading-relaxed">
              {CARD_COPY}
            </p>
          </CoverIfLoading>

          <div className="flex items-center justify-between pt-1">
            <CoverIfLoading
              borderRadius="8px"
              duration={shimmerDuration}
              loading={loading}
            >
              <button
                className="rounded-lg border px-3 py-1.5 font-medium text-foreground text-xs hover:bg-muted"
                type="button"
              >
                Bookmark
              </button>
            </CoverIfLoading>
            <CoverIfLoading
              borderRadius="8px"
              duration={shimmerDuration}
              loading={loading}
            >
              <button
                className="rounded-lg bg-primary px-3.5 py-1.5 font-medium text-primary-foreground text-xs hover:opacity-90"
                type="button"
              >
                Read More
              </button>
            </CoverIfLoading>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setLoading(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        {loading ? "Loading..." : "Replay Loading"}
      </Button>
    </div>
  );
}

export default SkeletonShimmerBasicDemo;
