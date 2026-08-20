"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
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
import { Button } from "@/registry/ui/base/button";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BANNER_HEIGHT = 120;
const AVATAR_SIZE = 56;

const PROFILE_NAME = "Motion";
const PROFILE_HANDLE = "@motiondotdev";
const PROFILE_BIO =
  "Free and open source. Create stunning web animations for React, JavaScript and Vue.";
const PROFILE_STATS = [
  { value: "127", label: "Posts" },
  { value: "11K", label: "Followers" },
  { value: "5", label: "Following" },
] as const;

// ---------------------------------------------------------------------------
// Motion Logo SVG (used as avatar in the content card)
// ---------------------------------------------------------------------------

function MotionLogo() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      style={{ width: "65%", height: "65%" }}
      viewBox="0 0 1260 454"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M475.753 0L226.8 453.6L0 453.6L194.392 99.4116C224.526 44.5081 299.724 0 362.353 0L475.753 0Z" />
      <path d="M1031.93 113.4C1031.93 50.7709 1082.7 0 1145.33 0C1207.96 0 1258.73 50.7709 1258.73 113.4C1258.73 176.029 1207.96 226.8 1145.33 226.8C1082.7 226.8 1031.93 176.029 1031.93 113.4Z" />
      <path d="M518.278 0L745.078 0L496.125 453.6L269.325 453.6L518.278 0Z" />
      <path d="M786.147 0L1012.95 0L818.555 354.188C788.422 409.092 713.223 453.6 650.594 453.6L537.194 453.6L786.147 0Z" />
    </svg>
  );
}

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
          <div style={sAvatarSkeleton}>
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
      {/* Banner — CSS gradient, same as sandbox original */}
      <div style={sBannerContainer} />

      <div style={sBody}>
        {/* Avatar — Motion SVG logo */}
        <div style={sAvatarRow}>
          <div style={sAvatarRing}>
            <MotionLogo />
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
  background:
    "linear-gradient(135deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 60%, var(--accent)) 100%)",
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

/** Skeleton avatar: card-colored disc, no brand fill. */
const sAvatarSkeleton: CSSProperties = {
  width: AVATAR_SIZE,
  height: AVATAR_SIZE,
  borderRadius: "50%",
  backgroundColor: "var(--card)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Revealed avatar: Motion yellow logo disc with a card-colored ring. */
const sAvatarRing: CSSProperties = {
  width: AVATAR_SIZE,
  height: AVATAR_SIZE,
  borderRadius: "50%",
  backgroundColor: "#f5e725",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "3px solid var(--card)",
  boxSizing: "border-box",
  color: "#000",
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
