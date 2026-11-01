"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DEFAULT_SPEED_OPTIONS,
  formatSpeedLabel,
  type VideoPlayerProps as LocalVideoPlayerProps,
  mergeRefs,
  sanitizeId,
} from "./defs";
import { attachVideoPlayer } from "./runtime";
import { injectVideoPlayerStyles } from "./styles";

export type { VideoPlayerChapter, VideoPlayerProps } from "./defs";

/**
 * Dependency-free, fully animated MP4 video player: modal overlay, chaptered
 * timeline, hover-scrub preview, speed menu, PiP, fullscreen, keyboard
 * shortcuts, and focus trapping.
 */
function VideoPlayer({
  chapters,
  className,
  defaultSpeed = 1,
  dialogLabel = "Custom video player",
  children,
  iosSrc,
  playerClassName,
  previewIosSrc,
  previewSrc,
  ref,
  speedOptions = DEFAULT_SPEED_OPTIONS,
  src,
  triggerClassName,
  ...props
}: LocalVideoPlayerProps) {
  const reactId = useId();
  const playerId = `video-player-${sanitizeId(reactId)}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    injectVideoPlayerStyles();
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const root =
      modalRef.current ??
      document.querySelector<HTMLElement>(
        `[data-media-01-player="${playerId}"]`
      );
    if (!root) {
      return;
    }

    const player = attachVideoPlayer(root, container, {
      playerId,
      prefersReducedMotion,
    });

    return () => {
      player.destroy();
    };
  }, [playerId, prefersReducedMotion, mounted]);

  const resolvedPreviewSrc = previewSrc ?? src;
  const resolvedPreviewIosSrc = previewIosSrc ?? iosSrc;

  const modalContent = (
    <div
      aria-label={dialogLabel}
      aria-modal="true"
      className={cn("media-01", playerClassName)}
      data-media-01-player={playerId}
      data-media-modal=""
      data-reduced-motion={prefersReducedMotion ? "" : undefined}
      hidden
      id={playerId}
      ref={modalRef}
      role="dialog"
    >
      <div aria-hidden="true" className="backdrop" data-media-close="" />

      <div className="frame">
        <button
          aria-label="Close video player"
          className="close"
          data-media-close=""
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <section className="shell" data-media-shell="">
          <div className="stage" data-media-stage="">
            <video
              className="video"
              data-default-speed={defaultSpeed}
              data-ios-src={iosSrc}
              data-media-video=""
              data-src={src}
              playsInline
              preload="none"
            >
              <track kind="captions" />
            </video>

            <div aria-hidden="true" className="loader">
              <svg aria-hidden="true" viewBox="0 0 19 19">
                <path
                  d="M9.5 2.938v2.625
                m0 7.875v2.624
                M2.938 9.5h2.625
                m7.875 0h2.624
                M4.86 4.86l1.856 1.856
                m5.569 5.568 1.856 1.856
                m-9.28 0 1.855-1.856
                m5.569-5.568L14.14 4.86"
                  strokeLinecap="round"
                  strokeWidth="1.875"
                />
              </svg>
            </div>

            <div aria-hidden="true" className="shade" />
            <div aria-hidden="true" className="pulse" data-media-pulse="">
              <svg
                aria-hidden="true"
                className="pulse-play"
                viewBox="0 0 36 36"
              >
                <path d="M11.45 8.68C9.7 7.78 7.7 9 7.7 10.96V25.04C7.7 27 9.7 28.22 11.45 27.32L23.95 20.86C25.96 19.82 27.9 19.12 27.9 18C27.9 16.88 25.96 16.18 23.95 15.14L11.45 8.68Z" />
              </svg>
              <svg
                aria-hidden="true"
                className="pulse-pause"
                viewBox="0 0 36 36"
              >
                <rect height="20" rx="1.75" width="6.5" x="10" y="8" />
                <rect height="20" rx="1.75" width="6.5" x="19.5" y="8" />
              </svg>
            </div>

            <button
              aria-label="Play video"
              className="center-toggle"
              data-media-center-toggle=""
              type="button"
            >
              <svg
                aria-hidden="true"
                className="center-play"
                viewBox="0 0 36 36"
              >
                <path d="M11.45 8.68C9.7 7.78 7.7 9 7.7 10.96V25.04C7.7 27 9.7 28.22 11.45 27.32L23.95 20.86C25.96 19.82 27.9 19.12 27.9 18C27.9 16.88 25.96 16.18 23.95 15.14L11.45 8.68Z" />
              </svg>
              <svg
                aria-hidden="true"
                className="center-pause"
                viewBox="0 0 36 36"
              >
                <rect height="20" rx="1.75" width="6.5" x="10" y="8" />
                <rect height="20" rx="1.75" width="6.5" x="19.5" y="8" />
              </svg>
            </button>

            <div className="seek">
              <div
                aria-hidden="true"
                className="preview"
                data-media-preview-card=""
              >
                <video
                  className="thumb"
                  data-ios-src={resolvedPreviewIosSrc}
                  data-media-preview-video=""
                  data-src={resolvedPreviewSrc}
                  muted
                  playsInline
                  preload="none"
                >
                  <track kind="captions" />
                </video>
                <div className="meta">
                  <span data-media-preview-time="">0:00</span>
                  <span data-media-preview-title="">Opening</span>
                </div>
              </div>

              <div
                aria-label="Seek video"
                aria-valuemax={0}
                aria-valuemin={0}
                aria-valuenow={0}
                aria-valuetext="0:00"
                className="timeline"
                data-media-timeline=""
                role="slider"
                tabIndex={0}
              >
                <div className="track" data-media-chapter-track="" />
                <div className="scrubber" data-media-scrubber="" />
              </div>
            </div>

            <div className="controls">
              <button
                aria-label="Play video"
                className="control play"
                data-media-play=""
                type="button"
              >
                <svg aria-hidden="true" className="morph" viewBox="0 0 36 36">
                  <defs>
                    <filter
                      colorInterpolationFilters="sRGB"
                      data-media-round-filter=""
                      height="136%"
                      width="136%"
                      x="-18%"
                      y="-18%"
                    >
                      <feGaussianBlur
                        in="SourceGraphic"
                        result="blur"
                        stdDeviation="0.7"
                      />
                      <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
                      />
                    </filter>
                  </defs>
                  <path
                    d="M 11 10 L 18 13.74 L 18 22.28 L 11 26 Z M 18 13.74 L 26 18 L 26 18 L 18 22.28 Z"
                    data-media-play-path=""
                  />
                </svg>
              </button>

              <div className="volume">
                <button
                  aria-label="Mute video"
                  className="control mute"
                  data-media-mute=""
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="volume-icon volume-low"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                  </svg>
                  <svg
                    aria-hidden="true"
                    className="volume-icon volume-mid"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                    <path d="M16 9a5 5 0 0 1 0 6" />
                  </svg>
                  <svg
                    aria-hidden="true"
                    className="volume-icon volume-high"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                    <path d="M16 9a5 5 0 0 1 0 6" />
                    <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
                  </svg>
                  <svg
                    aria-hidden="true"
                    className="volume-icon muted"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                    <line x1="22" x2="16" y1="9" y2="15" />
                    <line x1="16" x2="22" y1="9" y2="15" />
                  </svg>
                </button>
                <input
                  aria-label="Volume"
                  className="range"
                  data-media-volume=""
                  defaultValue="1"
                  max="1"
                  min="0"
                  step="0.01"
                  type="range"
                />
              </div>

              <div aria-live="off" className="time">
                <span data-media-current="">0:00</span>
                <span aria-hidden="true">/</span>
                <span data-media-duration="">0:00</span>
              </div>

              <div className="speed" data-media-speed="">
                <button
                  aria-expanded="false"
                  aria-label="Playback speed"
                  className="control speed-toggle"
                  data-media-speed-toggle=""
                  type="button"
                >
                  <span data-media-speed-label="">
                    {formatSpeedLabel(defaultSpeed)}
                  </span>
                </button>
                <div className="speed-menu" data-media-speed-menu="" hidden>
                  {speedOptions.map((speed) => (
                    <button
                      data-media-speed-option=""
                      data-speed={speed}
                      key={speed}
                      type="button"
                    >
                      {formatSpeedLabel(speed)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                aria-label="Enter picture in picture"
                className="control pip"
                data-media-pip=""
                type="button"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4" />
                  <rect height="7" rx="2" width="10" x="12" y="13" />
                </svg>
              </button>

              <button
                aria-label="Enter fullscreen"
                className="control full"
                data-media-fullscreen=""
                type="button"
              >
                <svg aria-hidden="true" className="enter" viewBox="0 0 24 24">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
                <svg aria-hidden="true" className="exit" viewBox="0 0 24 24">
                  <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
                </svg>
              </button>
            </div>
          </div>

          <ul className="chapters" hidden>
            {(chapters ?? []).map((chapter) => (
              <li
                data-media-chapter=""
                data-start={chapter.start}
                data-title={chapter.title}
                key={chapter.start}
              />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );

  return (
    <div
      className={cn("contents", className)}
      ref={mergeRefs(containerRef, ref)}
      {...props}
    >
      <button
        aria-expanded="false"
        aria-haspopup="dialog"
        className={cn("video-player-open", triggerClassName)}
        data-media-01-open={playerId}
        type="button"
      >
        {children ?? (
          <>
            <svg
              aria-hidden="true"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
              <rect height="12" rx="2" width="14" x="2" y="6" />
            </svg>
            Open video player
          </>
        )}
      </button>

      {mounted && typeof document !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </div>
  );
}

export { VideoPlayer };
