import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the OS-level Reduced Motion setting, live. Unlike a one-time
 * `matchMedia(...).matches` check, this updates if the user toggles the
 * setting while the page is open (no reload needed).
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => {
      setPrefersReducedMotion(media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  return prefersReducedMotion;
}
