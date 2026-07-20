"use client";

import { ParticleHoverButton } from "@/registry/primitives/buttons/particle-hover-button";

// Same heart path as the "Sponsor" nav link in the anime.js reference this
// primitive reimplements — kept 1:1 so the demo reads as the same mark,
// not a redraw.
const HEART_PATH =
  "M12 18.445a.778.778 0 0 1-.34-.078C11.39 18.235 5 15.077 5 9.889a3.889 3.889 0 0 1 6.638-2.75L12 7.5l.362-.361A3.889 3.889 0 0 1 19 9.889c0 5.17-6.387 8.344-6.66 8.478a.778.778 0 0 1-.34.078z";

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={HEART_PATH} />
    </svg>
  );
}

export default function ParticleHoverButtonExample() {
  return (
    <ParticleHoverButton
      className="text-[#ff4b4b]"
      particle={<HeartIcon className="h-2.5 w-2.5" />}
    >
      <button
        className="inline-flex items-center gap-1.5 font-medium text-sm"
        type="button"
      >
        <HeartIcon className="h-4 w-4" />
        Sponsor
      </button>
    </ParticleHoverButton>
  );
}
