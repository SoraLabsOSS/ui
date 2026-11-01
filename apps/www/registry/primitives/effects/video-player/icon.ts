import { easeOutQuart, getSubpath, PLAY_ICON_SHAPES } from "./defs";

export interface PlayIconMorpher {
  destroy: () => void;
  morph: (isPlaying: boolean) => void;
  render: (progress: number) => void;
}

export function createPlayIconMorpher(
  playPath: SVGPathElement | null,
  prefersReducedMotion: boolean
): PlayIconMorpher {
  let playIconFrame = 0;
  let playIconProgress = 0;
  let playIconTarget: number | null = null;

  function render(progress: number) {
    if (!playPath) {
      return;
    }

    const subpaths = PLAY_ICON_SHAPES.play.map((playPoints, pathIndex) => {
      const pausePoints = PLAY_ICON_SHAPES.pause[pathIndex];
      if (!pausePoints) {
        return "";
      }

      const points = playPoints.map((point, pointIndex) => {
        const pausePoint = pausePoints[pointIndex] ?? point;

        return [
          point[0] + (pausePoint[0] - point[0]) * progress,
          point[1] + (pausePoint[1] - point[1]) * progress,
        ] as const;
      });

      return getSubpath(points);
    });

    playPath.setAttribute("d", subpaths.join(" "));
  }

  function morph(isPlaying: boolean) {
    const target = isPlaying ? 1 : 0;

    if (playIconTarget === target) {
      return;
    }
    playIconTarget = target;
    cancelAnimationFrame(playIconFrame);

    if (prefersReducedMotion) {
      playIconProgress = target;
      render(playIconProgress);
      return;
    }

    const startProgress = playIconProgress;
    const distance = target - startProgress;
    const startTime = performance.now();
    const duration = 240;

    function tick(now: number) {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = easeOutQuart(elapsed);

      playIconProgress = startProgress + distance * eased;
      render(playIconProgress);

      if (elapsed < 1) {
        playIconFrame = requestAnimationFrame(tick);
      } else {
        playIconProgress = target;
        render(playIconProgress);
      }
    }

    playIconFrame = requestAnimationFrame(tick);
  }

  function destroy() {
    cancelAnimationFrame(playIconFrame);
  }

  return { morph, render, destroy };
}
