let stylesInjected = false;

export function injectVideoPlayerStyles() {
  if (stylesInjected || typeof document === "undefined") {
    return;
  }
  if (document.getElementById("sora-video-player-styles")) {
    stylesInjected = true;
    return;
  }

  const style = document.createElement("style");
  style.id = "sora-video-player-styles";
  style.textContent = VIDEO_PLAYER_STYLES;
  document.head.append(style);
  stylesInjected = true;
}

const VIDEO_PLAYER_STYLES = /* css */ `
@keyframes media-01-pulse {
  0% {
    opacity: 0;
    filter: blur(10px);
    transform: translate(-50%, -50%) scale(0.72);
  }

  32% {
    opacity: 1;
    filter: blur(0);
    transform: translate(-50%, -50%) scale(1);
  }

  72% {
    opacity: 1;
    filter: blur(0);
    transform: translate(-50%, -50%) scale(1);
  }

  100% {
    opacity: 0;
    filter: blur(0);
    transform: translate(-50%, -50%) scale(1.08);
  }
}

@keyframes media-01-spin {
  to {
    transform: rotate(360deg);
  }
}

[data-media-01-open],
.media-01 button {
  border: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

[data-media-01-open],
[data-media-01-open] *,
.media-01,
.media-01 *,
.media-01 *::before,
.media-01 *::after {
  box-sizing: border-box;
}

[data-media-01-open] {
  --corner-shape: superellipse(1.2);
  --ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --media-01-open-text: #ffffff;

  position: relative;
  height: 48px;
  padding: 0 24px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border-radius: 999px;
  corner-shape: var(--corner-shape);
  background: rgba(53, 53, 53, 0.498);
  backdrop-filter: blur(10px);
  color: var(--media-01-open-text);
  font-size: 14px;
  font-weight: 450;
  transition:
    background 180ms ease-out,
    scale 260ms var(--ease-out-quart);
}

[data-media-01-open]:hover {
  background: rgba(53, 53, 53, 0.598);
}

[data-media-01-open]:active {
  scale: 0.96;
}

[data-media-01-open] svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.media-01 {
  --corner-shape: superellipse(1.2);
  --box-shadow:
    0px 4px 4px 0px hsla(0, 0%, 0%, 0.039),
    0px 0px 1px 0px hsla(0, 0%, 0%, 0.62);
  --ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --white: #ffffff;
  --black: #050505;
  --control: 26px;
  --icon: 20px;
  --icon-stroke: 2;
  --gap: 12px;
  --inset: 22px;
  --bottom: 16px;
  --timeline-bottom: 50px;
  --time-size: 14px;
  --time-width: 88px;
  --volume-open: calc(var(--control) + var(--volume-range) + var(--gap));
  --volume-range: 54px;
  --track-height: 4px;
  --track-gap: 3px;

  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 24px;
  color: var(--white);
  -webkit-user-select: none;
  user-select: none;

  &[hidden] {
    display: none;
  }

  &.is-player-open {
    .backdrop {
      opacity: 1;
    }

    .shell {
      opacity: 1;
      clip-path: inset(0 round 12px);
      transform: translateY(0) scale(1);
    }
  }

  &.has-preview,
  &.is-scrubbing {
    .seek {
      .preview {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
      }
    }
  }

  &.is-scrubbing {
    .video {
      filter: blur(3px) brightness(0.72);
      transform: scale(1);
    }
  }

  &:not(.is-scrubbing) {
    .timeline {
      &:hover,
      &:focus-visible {
        .scrubber {
          width: 14px;
          height: 14px;
        }
      }
    }
  }

  &.is-preview-fallback {
    .seek {
      .preview {
        width: 190px;

        .thumb {
          display: none;
        }
      }
    }
  }

  &.is-muted {
    .controls {
      .volume-icon {
        display: none;
      }

      .muted {
        display: block;
      }
    }
  }

  &.is-volume-low {
    .controls {
      .volume-icon {
        display: none;
      }

      .volume-low {
        display: block;
      }
    }
  }

  &.is-volume-mid {
    .controls {
      .volume-icon {
        display: none;
      }

      .volume-mid {
        display: block;
      }
    }
  }

  &.is-volume-high {
    .controls {
      .volume-icon {
        display: none;
      }

      .volume-high {
        display: block;
      }
    }
  }

  &.is-fullscreen {
    --bottom: 24px;
    --timeline-bottom: 58px;

    .controls {
      .enter {
        display: none;
      }

      .exit {
        display: block;
      }
    }
  }

  &:not(.is-chrome-visible):not(.has-preview):not(.is-scrubbing) {
    .shade,
    .seek,
    .controls {
      pointer-events: none;
      opacity: 0;
    }

    .seek,
    .controls {
      transform: translateY(6px);
    }
  }

  &.is-loading {
    .video {
      opacity: 0;
    }

    .loader {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .shade,
    .seek,
    .controls {
      visibility: hidden;
      pointer-events: none;
      opacity: 0;
    }
  }

  .backdrop {
    position: absolute;
    inset: 0;
    cursor: default;
    background: rgba(0, 0, 0, 0.22);
    opacity: 0;
    backdrop-filter: blur(10px);
    transition: opacity 360ms var(--ease-out-quart);
  }

  .frame {
    position: relative;
    z-index: 1;
    width: min(
      940px,
      100%,
      calc((100dvh - 48px) * var(--video-ratio-number, 1.7778))
    );
    max-height: calc(100dvh - 48px);
    aspect-ratio: var(--video-ratio, 16 / 9);
    transition:
      width 520ms var(--ease-out-expo),
      aspect-ratio 520ms var(--ease-out-expo);
  }

  .shell {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid rgba(119, 119, 119, 0.31);
    border-radius: 12px;
    box-shadow: var(--box-shadow);
    opacity: 0;
    clip-path: inset(8% round 12px);
    transform: translateY(20px) scale(0.95);
    transition:
      opacity 420ms var(--ease-out-quart),
      transform 520ms var(--ease-out-expo),
      clip-path 520ms var(--ease-out-expo);

    &:fullscreen {
      width: 100vw;
      height: 100vh;
      max-width: none;
      border-radius: 0;
      corner-shape: var(--corner-shape);
      aspect-ratio: auto;

      .stage {
        height: 100vh;
      }

      .video {
        object-fit: contain;
      }
    }
  }

  .stage,
  .video {
    width: 100%;
    height: 100%;
  }

  .stage {
    position: relative;
    background: var(--black);
  }

  .video {
    object-fit: cover;
    opacity: 1;
    filter: blur(0) brightness(1);
    transform: scale(1);
    transition:
      opacity 280ms ease,
      filter 180ms ease,
      transform 180ms ease;
  }

  .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    color: rgba(255, 255, 255, 0.82);
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.92);
    transition:
      opacity 220ms ease,
      transform 260ms var(--ease-out-quart);

    svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      animation: media-01-spin 900ms linear infinite;
    }
  }

  .shade {
    position: absolute;
    inset: auto 0 0;
    height: 52%;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(0, 0, 0, 0.36) 28%,
      rgba(0, 0, 0, 0.88) 100%
    );
    opacity: 1;
    transition: opacity 260ms ease;
  }

  .pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    width: 80px;
    height: 80px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    corner-shape: var(--corner-shape);
    background: rgba(86, 86, 86, 0.28);
    color: var(--white);
    opacity: 0;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    transform: translate(-50%, -50%) scale(0.72);
    pointer-events: none;

    svg {
      width: 42px;
      height: 42px;
      fill: currentColor;
    }

    .pulse-play {
      transform: translateX(2px);
    }

    .pulse-pause {
      display: none;
    }

    &.show-play,
    &.show-pause {
      animation: media-01-pulse 1500ms var(--ease-out-expo) both;
    }

    &.show-pause {
      .pulse-play {
        display: none;
      }

      .pulse-pause {
        display: block;
      }
    }
  }

  .center-toggle {
    display: none;
  }

  .center-pause {
    display: none;
  }

  &.is-playing {
    .center-play {
      display: none;
    }

    .center-pause {
      display: block;
    }
  }

  .close {
    position: absolute;
    top: -58px;
    left: 50%;
    z-index: 2;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    corner-shape: var(--corner-shape);
    background: rgba(53, 53, 53, 0.498);
    color: var(--white);
    backdrop-filter: blur(10px);
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, 54px);
    transition:
      opacity 500ms ease-out,
      transform 360ms var(--ease-out-expo),
      background 180ms ease,
      scale 180ms ease;

    &:hover {
      background: rgba(37, 37, 37, 0.598);
    }

    &:active {
      scale: 0.94;
    }

    svg {
      width: 18px;
      height: auto;
      fill: none;
      stroke: currentColor;
      stroke-width: 2.1;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  &.is-player-open.is-close-ready {
    .close {
      pointer-events: auto;
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  &.is-closing {
    .shade,
    .seek,
    .controls {
      visibility: hidden;
      pointer-events: none;
      opacity: 0;
      transition: none;
    }

    .close {
      transition:
        background 180ms ease,
        scale 180ms ease;
    }
  }

  .seek {
    position: absolute;
    right: var(--inset);
    bottom: var(--timeline-bottom);
    left: var(--inset);
    z-index: 3;
    display: flex;
    align-items: flex-end;
    height: 34px;
    opacity: 1;
    transition:
      opacity 240ms ease,
      transform 240ms ease;

    .timeline {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 18px;
      touch-action: none;
      cursor: pointer;

      .track {
        position: relative;
        width: 100%;
        height: var(--track-height);
        display: flex;
        align-items: center;
        border-radius: 999px;
        gap: var(--track-gap);
        corner-shape: var(--corner-shape);
        transform-origin: center;
        transition: transform 180ms var(--ease-out-quart);

        .chapter {
          position: relative;
          min-width: 10px;
          height: 100%;
          flex-basis: 0;
          flex-grow: var(--chapter-grow, 1);
          overflow: hidden;
          corner-shape: var(--corner-shape);
          background: rgba(255, 255, 255, 0.22);
          transform-origin: center;
          transition: transform 180ms var(--ease-out-quart);

          .fill {
            position: absolute;
            inset: 0 auto 0 0;
            width: var(--chapter-progress, 0%);
            border-radius: inherit;
            corner-shape: inherit;
            background: rgba(255, 255, 255, 0.76);
          }
        }
      }

      &:hover,
      &:focus-visible {
        .track {
          transform: scaleY(1.5);
        }

        .chapter:hover,
        .chapter.is-hovered {
          transform: scaleY(1.34);
        }
      }

      .scrubber {
        position: absolute;
        top: 50%;
        left: var(--scrubber-left, 0%);
        width: 10px;
        height: 10px;
        border-radius: 999px;
        corner-shape: var(--corner-shape);
        background: var(--white);
        transform: translate(-50%, -50%);
        pointer-events: none;
        transition:
          width 180ms var(--ease-out-quart),
          height 180ms var(--ease-out-quart);
      }
    }

    .preview {
      position: absolute;
      bottom: 84px;
      left: 50%;
      width: clamp(150px, 22vw, 230px);
      pointer-events: none;
      opacity: 0;
      transform: translateX(-50%) translateY(8px) scale(0.96);
      transition:
        opacity 160ms ease,
        transform 160ms ease;

      .thumb {
        display: block;
        width: 100%;
        aspect-ratio: var(--video-ratio, 16 / 9);
        border: 0;
        border-radius: 10px;
        corner-shape: var(--corner-shape);
        object-fit: cover;
        background: #111;
        box-shadow: var(--box-shadow);
      }

      .meta {
        position: absolute;
        top: calc(100% + 7px);
        left: 50%;
        max-width: min(100%, 240px);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 7px 12px 8px;
        border-radius: 999px;
        corner-shape: var(--corner-shape);
        background: rgba(86, 86, 86, 0.28);
        backdrop-filter: blur(10px);
        box-shadow: none;
        color: rgba(255, 255, 255, 0.96);
        font-size: 14px;
        font-weight: 450;
        line-height: 1;
        filter: drop-shadow(0 1px 8px rgba(0, 0, 0, 0.72));
        white-space: nowrap;
        transform: translateX(-50%);

        span:first-child {
          flex: 0 0 auto;
        }

        span:last-child {
          flex: 1 1 auto;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
        }
      }

      &:not(.has-title) {
        .meta {
          min-width: 0;
        }

        [data-media-preview-title] {
          display: none;
        }
      }
    }
  }

  &.is-scrubbing {
    .seek {
      .timeline {
        .scrubber {
          width: 17px;
          height: 17px;
        }
      }
    }
  }

  .controls {
    position: absolute;
    right: var(--inset);
    bottom: var(--bottom);
    left: var(--inset);
    z-index: 4;
    display: flex;
    gap: var(--gap);
    align-items: center;
    pointer-events: none;
    opacity: 1;
    transition:
      opacity 240ms ease,
      transform 240ms ease;

    .control,
    .time,
    .volume,
    .speed {
      pointer-events: auto;
      background: transparent;
      box-shadow: none;
    }

    .control {
      width: var(--control);
      height: var(--control);
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 8px;
      corner-shape: var(--corner-shape);
      color: var(--white);
      opacity: 0.96;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
      transition:
        opacity 180ms ease,
        scale 180ms ease;

      svg {
        width: var(--icon);
        height: var(--icon);
        fill: currentColor;
      }

      &:hover {
        opacity: 1;
      }

      &:active {
        scale: 0.95;
      }

      &:disabled {
        pointer-events: none;
        opacity: 0.38;
      }
    }

    .play {
      position: relative;
      width: 30px;
      overflow: visible;

      svg {
        position: absolute;
        inset: 0;
        width: 31px;
        height: 31px;
        margin: auto;
      }
    }

    .morph {
      overflow: visible;
      fill: currentColor;
      transform: translateX(1px);
    }

    .volume-icon,
    .exit {
      display: none;
    }

    .volume-high {
      display: block;
    }

    .volume {
      width: var(--control);
      height: var(--control);
      display: flex;
      align-items: center;
      flex: 0 0 auto;
      overflow: hidden;
      border-radius: 8px;
      corner-shape: var(--corner-shape);
      transition: width 260ms var(--ease-out-quart);

      &:hover,
      &:focus-within {
        width: var(--volume-open);
      }

      .control {
        background: transparent;
        box-shadow: none;
        backdrop-filter: none;
      }

      .range {
        width: var(--volume-range);
        height: 20px;
        margin: 0 0 0 var(--gap);
        appearance: none;
        cursor: pointer;
        background: transparent;
        opacity: 0;
        transition: opacity 180ms ease;

        &::-webkit-slider-runnable-track {
          height: 3px;
          border: 0;
          border-radius: 999px;
          corner-shape: var(--corner-shape);
          background: linear-gradient(
            90deg,
            var(--white) 0 var(--volume-percent, 100%),
            rgba(255, 255, 255, 0.42) var(--volume-percent, 100%) 100%
          );
        }

        &::-webkit-slider-thumb {
          width: 10px;
          height: 10px;
          margin-top: -3.5px;
          appearance: none;
          border: 0;
          border-radius: 999px;
          corner-shape: var(--corner-shape);
          background: var(--white);
        }

        &::-moz-range-track {
          height: 3px;
          border: 0;
          border-radius: 999px;
          corner-shape: var(--corner-shape);
          background: linear-gradient(
            90deg,
            var(--white) 0 var(--volume-percent, 100%),
            rgba(255, 255, 255, 0.42) var(--volume-percent, 100%) 100%
          );
        }

        &::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border: 0;
          border-radius: 999px;
          corner-shape: var(--corner-shape);
          background: var(--white);
        }
      }

      &:hover .range,
      &:focus-within .range {
        opacity: 1;
      }
    }

    .time {
      height: var(--control);
      min-width: var(--time-width);
      margin-left: -2px;
      padding: 0 2px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      flex: 0 0 auto;
      border-radius: 999px;
      corner-shape: var(--corner-shape);
      font-size: var(--time-size);
      font-weight: 450;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      color: var(--white);
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
    }

    .speed {
      position: relative;
      margin-left: auto;
    }

    .pip {
      margin-right: 2px;
    }

    .speed-toggle {
      width: auto;
      min-width: 42px;
      padding: 0 4px;
      font-size: var(--time-size);
      font-weight: 450;
      font-variant-numeric: tabular-nums;
    }

    .speed-menu {
      position: absolute;
      right: 0;
      bottom: calc(100% + 10px);
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 4px;
      overflow: hidden;
      border-radius: 999px;
      corner-shape: var(--corner-shape);
      background: rgba(86, 86, 86, 0.28);
      -webkit-backdrop-filter: blur(24px) saturate(1.35);
      backdrop-filter: blur(24px) saturate(1.35);

      &[hidden] {
        display: none;
      }

      button {
        height: 24px;
        padding: 0 8px;
        border-radius: 999px;
        corner-shape: var(--corner-shape);
        color: rgba(255, 255, 255, 0.72);
        font-size: var(--time-size);
        font-weight: 450;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        transition:
          background 160ms ease,
          color 160ms ease;

        &:hover,
        &.is-active {
          color: var(--white);
          background: rgba(255, 255, 255, 0.16);
        }
      }
    }

    .mute svg,
    .pip svg,
    .full svg {
      fill: none;
      stroke: currentColor;
      stroke-width: var(--icon-stroke);
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .pip svg {
      width: calc(var(--icon) - 1px);
      height: calc(var(--icon) - 1px);
      stroke-width: 1.85;
    }

    .full svg {
      width: calc(var(--icon) - 2px);
      height: calc(var(--icon) - 2px);
    }
  }

  @media (max-width: 760px) {
    --control: 30px;
    --gap: 8px;
    --icon: 20px;
    --time-size: 14px;
    --time-width: 98px;
    --inset: 16px;
    --bottom: 14px;
    --timeline-bottom: 48px;

    padding: 14px;

    .frame {
      width: min(
        100%,
        calc((100dvh - 28px) * var(--video-ratio-number, 1.7778))
      );
      max-height: calc(100dvh - 28px);
      aspect-ratio: var(--video-ratio, 16 / 9);
    }

    .seek {
      height: 30px;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    &.is-chrome-visible:not(.is-loading):not(.has-preview):not(.is-scrubbing) {
      .center-toggle {
        visibility: visible;
        pointer-events: auto;
        opacity: 1;
      }
    }

    .pulse {
      width: 58px;
      height: 58px;

      svg {
        width: 30px;
        height: 30px;
      }
    }

    .center-toggle {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 4;
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      corner-shape: var(--corner-shape);
      isolation: isolate;
      overflow: hidden;
      background: transparent;
      color: var(--white);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translate(-50%, calc(-50% - 18px)) scale(1);

      &::before {
        position: absolute;
        inset: 0;
        z-index: 0;
        content: "";
        background: rgba(86, 86, 86, 0.42);
        border-radius: inherit;
        -webkit-backdrop-filter: blur(14px);
        backdrop-filter: blur(14px);
      }

      svg {
        position: absolute;
        inset: 0;
        z-index: 1;
        width: 30px;
        height: 30px;
        margin: auto;
        fill: currentColor;
      }

      .center-play {
        transform: translateX(2px);
      }
    }

    .seek {
      .preview {
        bottom: clamp(74px, 18vh, 132px);
        left: 50% !important;
        width: max-content;
        max-width: min(560px, calc(100vw - 48px));

        .thumb {
          display: none;
        }

        .meta {
          position: static;
          gap: 10px;
          max-width: 100%;
          padding: 10px 16px 11px;
          background: rgba(86, 86, 86, 0.28);
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
          transform: none;
        }
      }
    }

    .controls {
      .play,
      .volume,
      .pip {
        display: none;
      }

      .full {
        margin-left: 4px;
      }

      .range {
        display: none;
      }

      .volume:hover,
      .volume:focus-within {
        width: var(--control);
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .media-01,
  .media-01 * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
`;
