"use client";

import { useEffect, useState } from "react";
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonTransition,
} from "@/registry/primitives/effects/skeleton";

const LOADING_DURATION_MS = 2000;

function ProfileCard() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-accent font-medium text-sm">
        AX
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">Axyl</p>
        <p className="text-muted-foreground text-xs">
          Building Sora UI, one primitive at a time.
        </p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <SkeletonAvatar />
      <div className="flex flex-col gap-2">
        <SkeletonText className="w-24" />
        <SkeletonText className="w-40" />
      </div>
    </div>
  );
}

export default function SkeletonDemo() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setLoading(false),
      LOADING_DURATION_MS
    );
    return () => window.clearTimeout(timer);
  }, []);

  const replay = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), LOADING_DURATION_MS);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border p-6">
      <Skeleton className="h-24 w-full" rounded="lg" variant="fade" />
      <SkeletonTransition loading={loading} skeleton={<ProfileSkeleton />}>
        <ProfileCard />
      </SkeletonTransition>
      <button
        className="self-start text-muted-foreground text-xs underline underline-offset-2 hover:text-foreground"
        onClick={replay}
        type="button"
      >
        Replay
      </button>
    </div>
  );
}
