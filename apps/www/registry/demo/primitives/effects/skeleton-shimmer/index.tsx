"use client";

import { Button } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  type CSSProperties,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from "react";
import { flushSync } from "react-dom";
import {
  SkeletonOverlay,
  SkeletonShimmer,
  useViewTransitionWipeStyles,
} from "@/registry/primitives/effects/skeleton-shimmer";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BANNER_HEIGHT = 120;
const AVATAR_SIZE = 56;

const BANNER_IMAGE_URL = "https://sora.axyl.io.vn/media/axyl-banner.jpg";
const AVATAR_IMAGE_URL = "https://sora.axyl.io.vn/media/axyl-avt.jpg";

const PROFILE_NAME = "Axyl";
const PROFILE_HANDLE = "@axyl1410";
const PROFILE_BIO =
  "Building Sora UI, an open-source, fully animated React component distribution.";
const PROFILE_STATS = [
  { value: "14", label: "Posts" },
  { value: "10K", label: "Followers" },
  { value: "5", label: "Following" },
] as const;

// ---------------------------------------------------------------------------
// Skeleton Card (composed from SkeletonShimmer & SkeletonOverlay)
// ---------------------------------------------------------------------------

function ProfileSkeletonCard({ shimmerDuration }: { shimmerDuration: number }) {
  return (
    <div style={sCard}>
      {/* Banner Skeleton */}
      <SkeletonShimmer
        borderRadius={0}
        duration={shimmerDuration}
        style={{ height: BANNER_HEIGHT, width: "100%" }}
      />

      <div style={sBody}>
        {/* Avatar ring with shimmer circle */}
        <div style={sAvatarRow}>
          <div style={sAvatarRing}>
            <SkeletonShimmer
              borderRadius="50%"
              duration={shimmerDuration}
              style={{ height: AVATAR_SIZE - 6, width: AVATAR_SIZE - 6 }}
            />
          </div>
        </div>

        {/* Name + handle (Zero-layout-shift with SkeletonOverlay) */}
        <SkeletonOverlay
          borderRadius="6px"
          duration={shimmerDuration}
          style={{ alignSelf: "flex-start" }}
        >
          <div style={sNameBlock}>
            <h3 style={sName}>{PROFILE_NAME}</h3>
            <p style={sHandle}>{PROFILE_HANDLE}</p>
          </div>
        </SkeletonOverlay>

        {/* Bio */}
        <SkeletonOverlay borderRadius="6px" duration={shimmerDuration}>
          <p style={sBio}>{PROFILE_BIO}</p>
        </SkeletonOverlay>

        {/* Stats row */}
        <div style={sStatsRow}>
          {PROFILE_STATS.map((stat) => (
            <SkeletonOverlay
              borderRadius="8px"
              duration={shimmerDuration}
              key={stat.label}
              style={{ flex: 1 }}
            >
              <div style={sStatItem}>
                <span style={sStatValue}>{stat.value}</span>
                <span style={sStatLabel}>{stat.label}</span>
              </div>
            </SkeletonOverlay>
          ))}
        </div>

        {/* Follow button */}
        <SkeletonOverlay borderRadius="10px" duration={shimmerDuration}>
          <div style={sFollowPlaceholder}>Follow</div>
        </SkeletonOverlay>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content Card (Revealed real profile card with images)
// ---------------------------------------------------------------------------

function ProfileContentCard() {
  return (
    <div style={sCard}>
      {/* Banner image */}
      <div style={sBannerContainer}>
        <Image
          alt="Profile Banner"
          className="size-full object-cover"
          draggable={false}
          height={BANNER_HEIGHT}
          referrerPolicy="no-referrer"
          src={BANNER_IMAGE_URL}
          unoptimized
          width={360}
        />
      </div>

      <div style={sBody}>
        {/* Avatar */}
        <div style={sAvatarRow}>
          <div style={sAvatarRing}>
            <Image
              alt={PROFILE_NAME}
              className="size-full rounded-full object-cover"
              draggable={false}
              height={AVATAR_SIZE}
              referrerPolicy="no-referrer"
              src={AVATAR_IMAGE_URL}
              unoptimized
              width={AVATAR_SIZE}
            />
          </div>
        </div>

        {/* Name + handle */}
        <div style={sNameBlock}>
          <h3 style={sName}>{PROFILE_NAME}</h3>
          <p style={sHandle}>{PROFILE_HANDLE}</p>
        </div>

        {/* Bio */}
        <p style={sBio}>{PROFILE_BIO}</p>

        {/* Stats */}
        <div style={sStatsRow}>
          {PROFILE_STATS.map((stat) => (
            <div key={stat.label} style={sStatItem}>
              <span style={sStatValue}>{stat.value}</span>
              <span style={sStatLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Follow button */}
        <button style={sFollowBtn} type="button">
          Follow
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo Component
// ---------------------------------------------------------------------------

export interface SkeletonShimmerDemoProps {
  /**
   * Milliseconds before the skeleton auto-transitions to revealed content.
   * @default 2500
   */
  loadDelay?: number;
  /**
   * Duration of each shimmer sweep in seconds.
   * @default 1.5
   */
  shimmerDuration?: number;
}

export function SkeletonShimmerDemo({
  shimmerDuration = 1.5,
  loadDelay = 2500,
}: SkeletonShimmerDemoProps) {
  const [loaded, setLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useViewTransitionWipeStyles();

  /** Swap loaded state, triggering a view-transition wipe when supported. */
  const triggerReveal = useCallback(
    (next: boolean) => {
      if (prefersReducedMotion || !document.startViewTransition) {
        startTransition(() => setLoaded(next));
        return;
      }
      document.startViewTransition(() => {
        flushSync(() => setLoaded(next));
      });
    },
    [prefersReducedMotion]
  );

  // Reveal the profile card after loadDelay.
  useEffect(() => {
    if (loaded || loadDelay === 0) {
      return;
    }
    const id = window.setTimeout(() => {
      triggerReveal(true);
    }, loadDelay);
    return () => window.clearTimeout(id);
  }, [loaded, loadDelay, triggerReveal]);

  return (
    <div
      className={cn(
        "flex min-h-120 w-full flex-col items-center justify-center gap-4 px-0 py-3 sm:p-5"
      )}
    >
      <div style={sCardTransition}>
        {loaded ? (
          <ProfileContentCard />
        ) : (
          <ProfileSkeletonCard shimmerDuration={shimmerDuration} />
        )}
      </div>

      <Button
        onClick={() => triggerReveal(false)}
        size="sm"
        type="button"
        variant="outline"
      >
        Reload
      </Button>
    </div>
  );
}

export default SkeletonShimmerDemo;

// ---------------------------------------------------------------------------
// Card layout styles
// ---------------------------------------------------------------------------

const sCardTransition: CSSProperties = {
  width: "100%",
  maxWidth: 360,
  borderRadius: "16px",
  viewTransitionName: "skeleton-card",
};

const sCard: CSSProperties = {
  width: "100%",
  borderRadius: "16px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--card)",
  overflow: "hidden",
};

const sBannerContainer: CSSProperties = {
  width: "100%",
  height: BANNER_HEIGHT,
  overflow: "hidden",
  position: "relative",
};

const sBody: CSSProperties = {
  padding: "0 20px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const sAvatarRow: CSSProperties = {
  marginTop: -28,
};

const sAvatarRing: CSSProperties = {
  width: AVATAR_SIZE,
  height: AVATAR_SIZE,
  borderRadius: "50%",
  backgroundColor: "var(--card)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  border: "3px solid var(--card)",
  boxSizing: "border-box",
  position: "relative",
};

const sNameBlock: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const sName: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 600,
  color: "var(--card-foreground)",
  lineHeight: 1.2,
};

const sHandle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "var(--muted-foreground)",
  lineHeight: 1.2,
};

const sBio: CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.5,
  color: "var(--muted-foreground)",
};

const sStatsRow: CSSProperties = {
  display: "flex",
  gap: 8,
};

const sStatItem: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "8px 4px",
  borderRadius: "8px",
  backgroundColor: "color-mix(in oklab, var(--foreground) 4%, transparent)",
  flex: 1,
  gap: 2,
};

const sStatValue: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "var(--card-foreground)",
  lineHeight: 1.3,
};

const sStatLabel: CSSProperties = {
  fontSize: 11,
  color: "var(--muted-foreground)",
  lineHeight: 1.3,
};

const sFollowPlaceholder: CSSProperties = {
  width: "100%",
  padding: "10px 0",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  textAlign: "center",
};

const sFollowBtn: CSSProperties = {
  width: "100%",
  padding: "10px 0",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  borderRadius: "10px",
  border: "none",
  background: "var(--primary)",
  color: "var(--primary-foreground)",
  cursor: "pointer",
};
