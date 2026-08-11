"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  type Ref,
  type RefCallback,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from "react";

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }

      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as RefObject<T | null>).current = node;
      }
    }
  };
}

export interface VideoPlayerChapter {
  /** Chapter start time, in seconds. */
  start: number;
  /** Chapter label shown in the hover-scrub preview pill. */
  title: string;
}

export interface VideoPlayerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Chapter markers segmenting the seek timeline. */
  chapters?: VideoPlayerChapter[];
  /**
   * Content rendered inside the trigger button that opens the player.
   * @default Video icon + "Open video player"
   */
  children?: ReactNode;
  /**
   * Initial playback speed.
   * @default 1
   */
  defaultSpeed?: number;
  /**
   * aria-label for the player dialog.
   * @default "Custom video player"
   */
  dialogLabel?: string;
  /** iOS-optimized fallback source for the main video (iPad/iPhone/touch Mac). */
  iosSrc?: string;
  /** Class name merged onto the `.media-01` player root. */
  playerClassName?: string;
  /** iOS-optimized fallback source for the hover-scrub preview video. */
  previewIosSrc?: string;
  /**
   * Hosted MP4 URL for the muted hover-scrub preview video.
   * @default src
   */
  previewSrc?: string;
  ref?: Ref<HTMLDivElement>;
  /**
   * Playback speed choices shown in the speed menu.
   * @default [1, 1.25, 1.5, 1.75, 2]
   */
  speedOptions?: number[];
  /**
   * Hosted MP4 URL for the main video. Also used for the hover-scrub
   * preview video unless `previewSrc` is set.
   */
  src: string;
  /** Class name merged onto the trigger button. */
  triggerClassName?: string;
}

type ExtendedVideoElement = HTMLVideoElement & {
  preservesPitch?: boolean;
  webkitPreservesPitch?: boolean;
  webkitEnterFullscreen?: () => void;
  webkitPresentationMode?: string;
  webkitSetPresentationMode?: (mode: string) => void;
  webkitSupportsPresentationMode?: (mode: string) => boolean;
};

const DEFAULT_SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];
const IOS_USER_AGENT_PATTERN = /iPad|iPhone|iPod/;

function formatSpeedLabel(value: number) {
  return `${Number(value.toFixed(2))}x`;
}

function sanitizeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

const PLAY_ICON_SHAPES = {
  play: [
    [
      [11, 10],
      [18, 13.74],
      [18, 22.28],
      [11, 26],
    ],
    [
      [18, 13.74],
      [26, 18],
      [26, 18],
      [18, 22.28],
    ],
  ],
  pause: [
    [
      [11, 10],
      [17, 10],
      [17, 26],
      [11, 26],
    ],
    [
      [20, 10],
      [26, 10],
      [26, 26],
      [20, 26],
    ],
  ],
} as const;

/**
 * Dependency-free, fully animated MP4 video player: modal overlay, chaptered
 * timeline, hover-scrub preview, speed menu, PiP, fullscreen, keyboard
 * shortcuts, and focus trapping. Styling lives in the injected stylesheet
 * (`VIDEO_PLAYER_STYLES`) rather than Tailwind classes so the component stays
 * a single drop-in file.
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
}: VideoPlayerProps) {
  const reactId = useId();
  const playerId = `video-player-${sanitizeId(reactId)}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    injectVideoPlayerStyles();
  }, []);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: near-verbatim port of the dependency-free `media01()` reference implementation — see registry README for the porting rationale.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rootRaw = container.querySelector<HTMLElement>(
      "[data-media-01-player]"
    );
    if (!rootRaw) {
      return;
    }
    const root = rootRaw;

    const openButtons = [
      ...container.querySelectorAll<HTMLButtonElement>("[data-media-01-open]"),
    ];
    const modal = root;
    const shellRaw = root.querySelector<HTMLElement>("[data-media-shell]");
    const stageRaw = root.querySelector<HTMLElement>("[data-media-stage]");
    const videoRaw =
      root.querySelector<ExtendedVideoElement>("[data-media-video]");
    const previewVideoRaw = root.querySelector<HTMLVideoElement>(
      "[data-media-preview-video]"
    );
    const playButtonRaw =
      root.querySelector<HTMLButtonElement>("[data-media-play]");
    const muteButtonRaw =
      root.querySelector<HTMLButtonElement>("[data-media-mute]");
    const volumeInputRaw = root.querySelector<HTMLInputElement>(
      "[data-media-volume]"
    );
    const speedRootRaw = root.querySelector<HTMLElement>("[data-media-speed]");
    const speedButtonRaw = root.querySelector<HTMLButtonElement>(
      "[data-media-speed-toggle]"
    );
    const speedMenuRaw = root.querySelector<HTMLElement>(
      "[data-media-speed-menu]"
    );
    const speedLabelRaw = root.querySelector<HTMLElement>(
      "[data-media-speed-label]"
    );
    const speedOptionEls = [
      ...root.querySelectorAll<HTMLButtonElement>("[data-media-speed-option]"),
    ];
    const pipButtonRaw =
      root.querySelector<HTMLButtonElement>("[data-media-pip]");
    const fullscreenButtonRaw = root.querySelector<HTMLButtonElement>(
      "[data-media-fullscreen]"
    );
    const centerButtonRaw = root.querySelector<HTMLButtonElement>(
      "[data-media-center-toggle]"
    );
    const currentTimeNode = root.querySelector<HTMLElement>(
      "[data-media-current]"
    );
    const durationNode = root.querySelector<HTMLElement>(
      "[data-media-duration]"
    );
    const timelineRaw = root.querySelector<HTMLElement>(
      "[data-media-timeline]"
    );
    const chapterTrackRaw = root.querySelector<HTMLElement>(
      "[data-media-chapter-track]"
    );
    const scrubberRaw = root.querySelector<HTMLElement>(
      "[data-media-scrubber]"
    );
    const previewCard = root.querySelector<HTMLElement>(
      "[data-media-preview-card]"
    );
    const previewTimeNode = root.querySelector<HTMLElement>(
      "[data-media-preview-time]"
    );
    const previewTitleNode = root.querySelector<HTMLElement>(
      "[data-media-preview-title]"
    );
    const closeButtons = [
      ...root.querySelectorAll<HTMLButtonElement>("[data-media-close]"),
    ];
    const playPath = root.querySelector<SVGPathElement>(
      "[data-media-play-path]"
    );
    const roundFilter = root.querySelector<SVGFilterElement>(
      "[data-media-round-filter]"
    );
    const pulseRaw = root.querySelector<HTMLElement>("[data-media-pulse]");

    if (!(shellRaw && stageRaw)) {
      return;
    }
    if (!(videoRaw && previewVideoRaw)) {
      return;
    }
    if (!(playButtonRaw && muteButtonRaw && volumeInputRaw)) {
      return;
    }
    if (!(speedRootRaw && speedButtonRaw && speedMenuRaw && speedLabelRaw)) {
      return;
    }
    if (!speedOptionEls.length) {
      return;
    }
    if (!(pipButtonRaw && fullscreenButtonRaw && centerButtonRaw)) {
      return;
    }
    if (!(timelineRaw && chapterTrackRaw && scrubberRaw && pulseRaw)) {
      return;
    }

    // Re-bind as definite (non-null) types: the guards above already
    // verified these at runtime, and closures below need the narrowing to
    // survive across function-declaration boundaries.
    const shell = shellRaw;
    const stage = stageRaw;
    const video = videoRaw;
    const previewVideo = previewVideoRaw;
    const playButton = playButtonRaw;
    const muteButton = muteButtonRaw;
    const volumeInput = volumeInputRaw;
    const speedRoot = speedRootRaw;
    const speedButton = speedButtonRaw;
    const speedMenu = speedMenuRaw;
    const speedLabel = speedLabelRaw;
    const pipButton = pipButtonRaw;
    const fullscreenButton = fullscreenButtonRaw;
    const centerButton = centerButtonRaw;
    const timeline = timelineRaw;
    const chapterTrack = chapterTrackRaw;
    const scrubber = scrubberRaw;
    const pulse = pulseRaw;

    const controller = new AbortController();
    const { signal } = controller;
    let activeBeforeOpen: HTMLElement | null = null;
    let closeTimer = 0;
    let closeRevealTimer = 0;
    let chromeTimer = 0;
    let previewFrame = 0;
    let isPointerOverStage = false;
    let isDragging = false;
    let activePointerId: number | null = null;
    let pendingScrubTime: number | null = null;
    let resumeAfterScrub = false;
    let lastPointerWasTouch = false;
    let touchStageHadChrome = false;
    let lastCenterTouchToggle = 0;
    let lastVolume = Number(volumeInput.value) || 1;
    let chapterRanges: { start: number; end: number; title: string }[] = [];
    let segmentParts: {
      start: number;
      end: number;
      title?: string;
      element: HTMLElement;
      fill: HTMLElement;
    }[] = [];
    let playIconFrame = 0;
    let playIconProgress = 0;
    let playIconTarget: number | null = null;
    let isMediaLoaded = false;
    let currentSpeed =
      parseSpeed(video.getAttribute("data-default-speed")) || 1;
    const volumeClasses = ["is-volume-low", "is-volume-mid", "is-volume-high"];

    if (roundFilter && playPath) {
      const filterId = `media-01-round-icon-${sanitizeId(playerId)}`;

      roundFilter.id = filterId;
      playPath.setAttribute("filter", `url(#${filterId})`);
    }

    previewVideo.muted = true;
    previewVideo.playsInline = true;

    function shouldUseIosSource() {
      return (
        IOS_USER_AGENT_PATTERN.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      );
    }

    function getMediaSource(media: HTMLVideoElement) {
      const source = media.getAttribute("data-src");
      const iosSource = media.getAttribute("data-ios-src");

      return shouldUseIosSource() && iosSource ? iosSource : source;
    }

    function loadMedia() {
      if (isMediaLoaded) {
        return;
      }
      isMediaLoaded = true;

      for (const [media, preload] of [
        [video, "auto"],
        [previewVideo, "metadata"],
      ] as const) {
        const source = getMediaSource(media);

        if (source && !media.getAttribute("src")) {
          media.setAttribute("src", source);
        }

        media.preload = preload;

        if (source || media.getAttribute("src")) {
          media.load();
        }
      }

      setPlaybackSpeed(currentSpeed, { includeDefault: true });
    }

    function getDuration() {
      return Number.isFinite(video.duration) ? video.duration : 0;
    }

    function clamp(value: number, min: number, max: number) {
      return Math.min(Math.max(value, min), max);
    }

    function formatTime(value: number) {
      if (!Number.isFinite(value)) {
        return "0:00";
      }

      const total = Math.max(0, Math.floor(value));
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      const paddedSeconds = String(seconds).padStart(2, "0");

      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`;
      }

      return `${minutes}:${paddedSeconds}`;
    }

    function parseSpeed(value: string | null) {
      const speed = Number(value);
      return Number.isFinite(speed) && speed > 0 ? speed : null;
    }

    function setPlaybackSpeed(
      speed: number,
      { includeDefault = false }: { includeDefault?: boolean } = {}
    ) {
      try {
        if (includeDefault) {
          video.defaultPlaybackRate = speed;
        }

        video.preservesPitch = true;
        video.webkitPreservesPitch = true;
      } catch {
        // Ignore unsupported media properties.
      }

      video.playbackRate = speed;
    }

    function isVideoPlaying() {
      return !(video.paused || video.ended);
    }

    function isTouchInteraction(event: { pointerType?: string } | null = null) {
      return event?.pointerType === "touch" || lastPointerWasTouch;
    }

    function hideChrome({
      allowInside = false,
      clearPreview = false,
    }: {
      allowInside?: boolean;
      clearPreview?: boolean;
    } = {}) {
      if (clearPreview) {
        root.classList.remove("has-preview");
      }

      if (
        isDragging ||
        (!allowInside && isPointerOverStage) ||
        !speedMenu.hidden ||
        root.classList.contains("has-preview")
      ) {
        return;
      }

      root.classList.remove("is-chrome-visible");
    }

    function scheduleChromeHide(
      delay = 0,
      options: { allowInside?: boolean; clearPreview?: boolean } = {}
    ) {
      clearTimeout(chromeTimer);

      if (delay <= 0) {
        hideChrome(options);
        return;
      }

      chromeTimer = window.setTimeout(() => hideChrome(options), delay);
    }

    function showChrome(shouldAutoHide = false) {
      clearTimeout(chromeTimer);

      if (modal.hidden || root.classList.contains("is-closing")) {
        return;
      }

      root.classList.add("is-chrome-visible");

      if (shouldAutoHide && isVideoPlaying()) {
        scheduleChromeHide(4000, {
          allowInside: true,
          clearPreview: true,
        });
      }
    }

    function showTouchChrome() {
      showChrome(false);

      scheduleChromeHide(3000, {
        allowInside: true,
        clearPreview: true,
      });
    }

    function hideTouchChrome() {
      clearTimeout(chromeTimer);
      closeSpeedMenu();
      root.classList.remove("is-chrome-visible", "has-preview");
      clearHoveredChapter();
    }

    function beginClosingVisualState() {
      clearTimeout(chromeTimer);
      root.classList.add("is-closing");
      root.classList.remove("is-chrome-visible", "has-preview");
      clearHoveredChapter();
    }

    function easeOutQuart(progress: number) {
      return 1 - (1 - progress) ** 4;
    }

    function getSubpath(points: readonly (readonly [number, number])[]) {
      const lines = points
        .map((point, index) => {
          const command = index === 0 ? "M" : "L";
          return `${command} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`;
        })
        .join(" ");

      return `${lines} Z`;
    }

    function renderPlayIcon(progress: number) {
      if (!playPath) {
        return;
      }

      const subpaths = PLAY_ICON_SHAPES.play.map((playPoints, pathIndex) => {
        const pausePoints = PLAY_ICON_SHAPES.pause[pathIndex];
        const points = playPoints.map((point, pointIndex) => {
          const pausePoint = pausePoints[pointIndex];

          return [
            point[0] + (pausePoint[0] - point[0]) * progress,
            point[1] + (pausePoint[1] - point[1]) * progress,
          ] as const;
        });

        return getSubpath(points);
      });

      playPath.setAttribute("d", subpaths.join(" "));
    }

    function morphPlayIcon(isPlaying: boolean) {
      const target = isPlaying ? 1 : 0;

      if (playIconTarget === target) {
        return;
      }
      playIconTarget = target;
      cancelAnimationFrame(playIconFrame);

      if (prefersReducedMotion) {
        playIconProgress = target;
        renderPlayIcon(playIconProgress);
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
        renderPlayIcon(playIconProgress);

        if (elapsed < 1) {
          playIconFrame = requestAnimationFrame(tick);
        } else {
          playIconProgress = target;
          renderPlayIcon(playIconProgress);
        }
      }

      playIconFrame = requestAnimationFrame(tick);
    }

    function readChapters() {
      const duration = getDuration();
      const data = [...root.querySelectorAll("[data-media-chapter]")]
        .map((item) => ({
          start: Number(item.getAttribute("data-start")),
          title: item.getAttribute("data-title") || "",
        }))
        .filter((item) => Number.isFinite(item.start) && item.start >= 0)
        .sort((left, right) => left.start - right.start);

      if (!data.length || data[0].start > 0) {
        data.unshift({ start: 0, title: "" });
      }

      const deduped = data.filter(
        (item, index, list) =>
          index === 0 || item.start !== list[index - 1].start
      );

      chapterRanges = deduped
        .filter((item) => !duration || item.start < duration)
        .map((item, index, list) => ({
          start: item.start,
          end: list[index + 1]?.start ?? duration,
          title: item.title,
        }))
        .filter((item) => !duration || item.end > item.start);
    }

    function renderChapters() {
      const duration = getDuration();

      readChapters();
      chapterTrack.textContent = "";
      segmentParts = [];

      if (!(duration && chapterRanges.length)) {
        const segment = document.createElement("span");
        const fill = document.createElement("span");

        segment.className = "chapter";
        fill.className = "fill";
        segment.append(fill);
        chapterTrack.append(segment);
        segmentParts.push({
          start: 0,
          end: duration || 1,
          element: segment,
          fill,
        });
        updateTimeline();
        return;
      }

      for (const chapter of chapterRanges) {
        const segment = document.createElement("span");
        const fill = document.createElement("span");
        const segmentDuration = Math.max(chapter.end - chapter.start, 0.01);

        segment.className = "chapter";
        fill.className = "fill";
        segment.style.setProperty("--chapter-grow", String(segmentDuration));
        segment.append(fill);
        chapterTrack.append(segment);
        segmentParts.push({ ...chapter, element: segment, fill });
      }

      updateTimeline();
    }

    function syncVideoRatio() {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!(width && height)) {
        return;
      }

      root.style.setProperty("--video-ratio", `${width} / ${height}`);
      root.style.setProperty("--video-ratio-number", String(width / height));
    }

    function hasReadyFrame() {
      return Boolean(
        video.readyState >= 2 && video.videoWidth && video.videoHeight
      );
    }

    function syncMediaReadyState() {
      const isReady = hasReadyFrame();
      const isLoading = !(isReady || modal.hidden);

      if (video.readyState >= 1) {
        syncVideoRatio();
      }

      root.classList.toggle("is-media-ready", isReady);
      root.classList.toggle("is-loading", isLoading);
      root.setAttribute("aria-busy", String(isLoading));

      return isReady;
    }

    function getChapterAt(time: number) {
      for (let index = chapterRanges.length - 1; index >= 0; index -= 1) {
        if (time >= chapterRanges[index].start) {
          return chapterRanges[index];
        }
      }

      return (
        chapterRanges[0] || {
          title: "",
          start: 0,
          end: getDuration(),
        }
      );
    }

    function getVisualProgressPercent(time: number) {
      const duration = getDuration();
      const trackRect = chapterTrack.getBoundingClientRect();
      const fallback = duration ? (time / duration) * 100 : 0;

      if (!(duration && trackRect.width && segmentParts.length)) {
        return fallback;
      }

      const segment =
        segmentParts.find((part, index) => {
          const isLast = index === segmentParts.length - 1;

          return time >= part.start && (time < part.end || isLast);
        }) || segmentParts[0];
      const segmentRect = segment.element?.getBoundingClientRect();

      if (!segmentRect?.width) {
        return fallback;
      }

      const segmentDuration = Math.max(segment.end - segment.start, 0.01);
      const segmentProgress = clamp(
        (time - segment.start) / segmentDuration,
        0,
        1
      );
      const x =
        segmentRect.left - trackRect.left + segmentRect.width * segmentProgress;

      return clamp((x / trackRect.width) * 100, 0, 100);
    }

    function updateTimeline(time?: number) {
      const duration = getDuration();
      const renderTime =
        time ??
        (isDragging && pendingScrubTime !== null
          ? pendingScrubTime
          : video.currentTime);
      const current = clamp(renderTime || 0, 0, duration || 0);
      const percent = getVisualProgressPercent(current);

      scrubber.style.setProperty("--scrubber-left", `${percent}%`);

      for (const segment of segmentParts) {
        const segmentDuration = Math.max(segment.end - segment.start, 0.01);
        const segmentPercent = clamp(
          ((current - segment.start) / segmentDuration) * 100,
          0,
          100
        );

        segment.fill.style.setProperty(
          "--chapter-progress",
          `${segmentPercent}%`
        );
      }

      if (currentTimeNode) {
        currentTimeNode.textContent = formatTime(current);
      }
      if (durationNode) {
        durationNode.textContent = formatTime(duration);
      }

      timeline.setAttribute("aria-valuemax", String(Math.floor(duration || 0)));
      timeline.setAttribute("aria-valuenow", String(Math.floor(current)));
      timeline.setAttribute(
        "aria-valuetext",
        `${formatTime(current)} of ${formatTime(duration)}`
      );
    }

    function syncPlayState() {
      const isPlaying = isVideoPlaying();

      root.classList.toggle("is-playing", isPlaying);
      morphPlayIcon(isPlaying);
      playButton.setAttribute(
        "aria-label",
        isPlaying ? "Pause video" : "Play video"
      );
      centerButton.setAttribute(
        "aria-label",
        isPlaying ? "Pause video" : "Play video"
      );

      if (isPlaying && isPointerOverStage) {
        showChrome(true);
      } else {
        clearTimeout(chromeTimer);
      }
    }

    function getVolumeClass(volume: number) {
      if (volume <= 0.33) {
        return "is-volume-low";
      }
      if (volume <= 0.66) {
        return "is-volume-mid";
      }
      return "is-volume-high";
    }

    function syncVolumeState() {
      const volume = video.muted ? 0 : video.volume;
      const isMuted = video.muted || video.volume === 0;
      const volumeClass = getVolumeClass(volume);

      if (!video.muted && video.volume > 0) {
        lastVolume = video.volume;
      }

      root.classList.remove(...volumeClasses);
      root.classList.toggle("is-muted", isMuted);
      if (!isMuted) {
        root.classList.add(volumeClass);
      }
      muteButton.setAttribute(
        "aria-label",
        isMuted ? "Unmute video" : "Mute video"
      );
      volumeInput.value = String(volume);
      volumeInput.style.setProperty("--volume-percent", `${volume * 100}%`);
    }

    function syncFullscreenState() {
      const isFullscreen = document.fullscreenElement === shell;

      root.classList.toggle("is-fullscreen", isFullscreen);
      fullscreenButton.setAttribute(
        "aria-label",
        isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
      );
    }

    function supportsPictureInPicture() {
      const supportsStandard =
        document.pictureInPictureEnabled &&
        typeof video.requestPictureInPicture === "function";
      const supportsWebkit =
        typeof video.webkitSetPresentationMode === "function" &&
        typeof video.webkitSupportsPresentationMode === "function" &&
        video.webkitSupportsPresentationMode("picture-in-picture");

      return supportsStandard || supportsWebkit;
    }

    function isPictureInPicture() {
      return (
        document.pictureInPictureElement === video ||
        video.webkitPresentationMode === "picture-in-picture"
      );
    }

    function syncPictureInPictureState() {
      const isSupported = supportsPictureInPicture();
      const isActive = isPictureInPicture();

      pipButton.disabled = !isSupported;
      pipButton.setAttribute("aria-disabled", String(!isSupported));
      pipButton.setAttribute(
        "aria-label",
        isActive ? "Exit picture in picture" : "Enter picture in picture"
      );
      root.classList.toggle("is-pip", isActive);
    }

    function closeSpeedMenu() {
      speedMenu.hidden = true;
      speedButton.setAttribute("aria-expanded", "false");
    }

    function openSpeedMenu() {
      speedMenu.hidden = false;
      speedButton.setAttribute("aria-expanded", "true");
      showChrome(false);
    }

    function toggleSpeedMenu() {
      if (speedMenu.hidden) {
        openSpeedMenu();
      } else {
        closeSpeedMenu();
      }
    }

    function syncSpeedOptions(speed: number) {
      speedLabel.textContent = formatSpeedLabel(speed);
      for (const option of speedOptionEls) {
        const optionSpeed = parseSpeed(option.getAttribute("data-speed"));
        const isActive = optionSpeed === speed;

        option.classList.toggle("is-active", isActive);
        option.setAttribute("aria-pressed", String(isActive));
      }
    }

    function syncSpeedState(speed: number = video.playbackRate) {
      const nextSpeed = parseSpeed(String(speed)) || 1;

      currentSpeed = nextSpeed;
      setPlaybackSpeed(nextSpeed, { includeDefault: true });
      syncSpeedOptions(nextSpeed);
    }

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: near-verbatim port of the reference implementation (see file header).
    async function changePlaybackSpeed(speed: number) {
      const nextSpeed = parseSpeed(String(speed));
      if (!nextSpeed) {
        return;
      }

      const wasPlaying = isVideoPlaying();
      const duration = getDuration();
      const currentTime = Number.isFinite(video.currentTime)
        ? video.currentTime
        : 0;
      const restoreTime = duration
        ? clamp(currentTime + 0.001, 0, Math.max(duration - 0.001, 0))
        : currentTime;

      if (wasPlaying) {
        video.pause();
      }

      currentSpeed = nextSpeed;
      setPlaybackSpeed(nextSpeed);
      syncSpeedOptions(nextSpeed);

      if (Number.isFinite(restoreTime)) {
        try {
          video.currentTime = restoreTime;
        } catch {
          // Ignore seek errors while media metadata is still settling.
        }

        updateTimeline(currentTime);
      }

      if (wasPlaying) {
        try {
          await video.play();
        } catch {
          syncPlayState();
        }
      }
    }

    function clearPulse() {
      pulse.classList.remove("show-play", "show-pause");
    }

    function showPulse(type: "play" | "pause") {
      clearPulse();
      if (prefersReducedMotion) {
        return;
      }
      // biome-ignore lint/suspicious/noUnusedExpressions: forces a reflow to restart the CSS animation.
      pulse.offsetWidth;
      pulse.classList.add(type === "pause" ? "show-pause" : "show-play");
    }

    async function togglePlay({
      showFeedback = false,
    }: {
      showFeedback?: boolean;
    } = {}) {
      const willPlay = video.paused || video.ended;

      if (showFeedback) {
        showPulse(willPlay ? "pause" : "play");
      }

      if (willPlay) {
        try {
          await video.play();
        } catch {
          syncPlayState();
        }
      } else {
        video.pause();
      }
    }

    function onStageClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const interactive = target.closest?.(
        "button, input, .controls, [data-media-timeline]"
      );

      if (interactive) {
        return;
      }

      const shouldUseTouchChrome = isTouchInteraction(
        event as unknown as PointerEvent
      );

      if (shouldUseTouchChrome) {
        if (touchStageHadChrome) {
          hideTouchChrome();
        } else {
          showTouchChrome();
        }

        return;
      }

      showChrome();
      togglePlay({ showFeedback: true })
        .catch(syncPlayState)
        .finally(() => {
          if (shouldUseTouchChrome) {
            showTouchChrome();
          }
        });
    }

    async function togglePictureInPicture() {
      if (!supportsPictureInPicture()) {
        return;
      }

      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
        return;
      }

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }

      if (
        document.pictureInPictureEnabled &&
        typeof video.requestPictureInPicture === "function"
      ) {
        await video.requestPictureInPicture();
        return;
      }

      if (typeof video.webkitSetPresentationMode === "function") {
        video.webkitSetPresentationMode(
          video.webkitPresentationMode === "picture-in-picture"
            ? "inline"
            : "picture-in-picture"
        );
      }
    }

    function toggleMute() {
      if (video.muted || video.volume === 0) {
        video.muted = false;
        video.volume = lastVolume || 0.8;
      } else {
        video.muted = true;
      }

      syncVolumeState();
    }

    function seekTo(time: number) {
      const duration = getDuration();
      if (!duration) {
        return;
      }

      video.currentTime = clamp(time, 0, duration);
      updateTimeline(video.currentTime);
    }

    function getTimelinePoint(event: { clientX: number }) {
      const duration = getDuration();
      const rect = timeline.getBoundingClientRect();
      const x = clamp(event.clientX - rect.left, 0, rect.width);
      const percent = rect.width ? x / rect.width : 0;

      return {
        x,
        percent,
        time: duration * percent,
      };
    }

    function markPreviewFallback() {
      root.classList.add("is-preview-fallback");
    }

    function setHoveredChapter(time: number) {
      const activeSegment =
        segmentParts.find((part, index) => {
          const isLast = index === segmentParts.length - 1;
          return time >= part.start && (time < part.end || isLast);
        }) || null;

      for (const part of segmentParts) {
        part.element.classList.toggle("is-hovered", part === activeSegment);
      }
    }

    function clearHoveredChapter() {
      for (const part of segmentParts) {
        part.element.classList.remove("is-hovered");
      }
    }

    function updatePreviewVideo(time: number) {
      if (!(previewVideo && Number.isFinite(time))) {
        return;
      }
      if (previewVideo.readyState < 1) {
        return;
      }

      cancelAnimationFrame(previewFrame);
      previewFrame = requestAnimationFrame(() => {
        try {
          previewVideo.pause();

          if (Math.abs(previewVideo.currentTime - time) > 0.12) {
            previewVideo.currentTime = time;
          }
        } catch {
          markPreviewFallback();
        }
      });
    }

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: near-verbatim port of the reference implementation (see file header).
    function showPreview(
      event: { clientX: number; pointerType?: string },
      time: number
    ) {
      if (modal.hidden || root.classList.contains("is-closing")) {
        return;
      }

      const duration = getDuration();
      if (!duration) {
        return;
      }

      const timelineRect = timeline.getBoundingClientRect();
      const wrapRect = timeline.parentElement?.getBoundingClientRect();
      const previewWidth = previewCard?.offsetWidth || 236;
      const left = wrapRect
        ? clamp(
            event.clientX - wrapRect.left,
            previewWidth / 2,
            wrapRect.width - previewWidth / 2
          )
        : 0;
      const chapter = getChapterAt(time);
      setHoveredChapter(time);

      if (
        !isTouchInteraction(event as unknown as PointerEvent) &&
        previewCard
      ) {
        previewCard.style.left = `${left}px`;
      }

      if (previewTimeNode) {
        previewTimeNode.textContent = formatTime(time);
      }
      if (previewTitleNode) {
        previewTitleNode.textContent = chapter.title;
      }
      if (previewCard) {
        previewCard.classList.toggle(
          "has-title",
          Boolean(chapter.title.trim())
        );
      }

      root.classList.add("has-preview");
      showChrome(false);
      if (!isTouchInteraction(event as unknown as PointerEvent)) {
        updatePreviewVideo(clamp(time, 0, duration));
      }

      if (timelineRect.width) {
        timeline.style.setProperty(
          "--preview-percent",
          `${((event.clientX - timelineRect.left) / timelineRect.width) * 100}%`
        );
      }
    }

    function hidePreview() {
      root.classList.remove("has-preview");
      clearHoveredChapter();
      scheduleChromeHide(300);
    }

    function setTriggersExpanded(isExpanded: boolean) {
      for (const button of openButtons) {
        button.setAttribute("aria-expanded", String(isExpanded));
        button.classList.toggle("is-media-open", isExpanded);
      }
    }

    function openModal(trigger: HTMLElement | null = null) {
      clearTimeout(closeTimer);
      clearTimeout(closeRevealTimer);
      loadMedia();
      activeBeforeOpen =
        trigger || (document.activeElement as HTMLElement | null);
      clearPulse();
      closeSpeedMenu();
      modal.hidden = false;
      root.classList.remove("is-close-ready", "is-closing");
      syncMediaReadyState();
      setTriggersExpanded(true);
      video.pause();
      showChrome(false);
      syncPlayState();

      requestAnimationFrame(() => {
        root.classList.add("is-player-open");
        updateTimeline();
      });

      closeRevealTimer = window.setTimeout(() => {
        root.classList.add("is-close-ready");
      }, 130);

      window.setTimeout(() => {
        const focusTarget = hasReadyFrame()
          ? playButton
          : closeButtons.find((button) => button.classList.contains("close"));

        (focusTarget || playButton).focus({ preventScroll: true });
      }, 160);
    }

    async function closeModal() {
      clearTimeout(closeTimer);
      clearTimeout(closeRevealTimer);
      beginClosingVisualState();

      if (document.fullscreenElement === shell) {
        try {
          await document.exitFullscreen();
        } catch {
          // Ignore fullscreen exit errors; the modal can still close.
        }
      }

      video.pause();
      hidePreview();
      clearTimeout(chromeTimer);
      clearPulse();
      closeSpeedMenu();
      isPointerOverStage = false;
      isDragging = false;
      activePointerId = null;
      pendingScrubTime = null;
      resumeAfterScrub = false;
      root.classList.remove(
        "is-player-open",
        "is-close-ready",
        "is-loading",
        "is-scrubbing",
        "is-chrome-visible"
      );
      root.setAttribute("aria-busy", "false");
      setTriggersExpanded(false);

      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
        root.classList.remove("is-closing");

        if (activeBeforeOpen && document.contains(activeBeforeOpen)) {
          activeBeforeOpen.focus({ preventScroll: true });
        } else if (openButtons[0]) {
          openButtons[0].focus({ preventScroll: true });
        }
      }, 360);
    }

    function trapFocus(event: KeyboardEvent) {
      const focusables = [
        ...modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
        ),
      ].filter((node) => node.offsetParent !== null);

      if (!focusables.length) {
        return;
      }

      const first = focusables[0];
      const last = focusables.at(-1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function resolveSeekKeyTime(key: string, duration: number) {
      const seekSmall = 5;
      const seekLarge = 15;

      if (key === "ArrowLeft") {
        return video.currentTime - seekSmall;
      }
      if (key === "ArrowRight") {
        return video.currentTime + seekSmall;
      }
      if (key === "ArrowDown") {
        return video.currentTime - seekLarge;
      }
      if (key === "ArrowUp") {
        return video.currentTime + seekLarge;
      }
      if (key === "Home") {
        return 0;
      }
      if (key === "End") {
        return duration;
      }

      return null;
    }

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: near-verbatim port of the reference implementation (see file header).
    function onDocumentKeydown(event: KeyboardEvent) {
      if (modal.hidden) {
        return;
      }

      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable);
      const isInteractive =
        target instanceof HTMLElement &&
        target.closest("button, a, input, textarea, select, [role='button']");

      if (!isEditable && event.key.toLowerCase() === "m") {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleMute();
        return;
      }

      if (!(isEditable || isInteractive) && event.key === " ") {
        event.preventDefault();
        event.stopImmediatePropagation();
        togglePlay({ showFeedback: true })
          .catch(syncPlayState)
          .finally(() => {
            if (isTouchInteraction()) {
              showTouchChrome();
            }
          });
        return;
      }

      if (!(isEditable || isInteractive)) {
        const duration = getDuration();
        const nextTime = duration
          ? resolveSeekKeyTime(event.key, duration)
          : null;

        if (nextTime !== null) {
          event.preventDefault();
          event.stopImmediatePropagation();
          seekTo(nextTime);
          return;
        }
      }

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (!speedMenu.hidden) {
          closeSpeedMenu();
          speedButton.focus({ preventScroll: true });
          return;
        }

        closeModal();
        return;
      }

      if (event.key === "Tab") {
        event.stopImmediatePropagation();
        trapFocus(event);
      }
    }

    function onTimelineKeydown(event: KeyboardEvent) {
      const duration = getDuration();
      if (!duration) {
        return;
      }

      const nextTime = resolveSeekKeyTime(event.key, duration);

      if (nextTime !== null) {
        event.preventDefault();
        seekTo(nextTime);
      }
    }

    function startScrub(event: PointerEvent) {
      const duration = getDuration();
      if (!duration) {
        return;
      }

      const point = getTimelinePoint(event);

      activePointerId = event.pointerId;
      isDragging = true;
      pendingScrubTime = point.time;
      resumeAfterScrub = isVideoPlaying();

      if (resumeAfterScrub) {
        video.pause();
      }

      root.classList.add("is-scrubbing");
      showChrome(false);
      timeline.setPointerCapture?.(event.pointerId);
      updateTimeline(point.time);
      showPreview(event, point.time);
      event.preventDefault();
    }

    function moveScrub(event: PointerEvent) {
      const duration = getDuration();
      if (!duration) {
        return;
      }
      if (event.pointerType === "touch" && !isDragging) {
        return;
      }

      const point = getTimelinePoint(event);

      if (isDragging) {
        if (event.pointerId !== activePointerId) {
          return;
        }

        pendingScrubTime = point.time;
        updateTimeline(point.time);
      }

      showPreview(event, point.time);
    }

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: near-verbatim port of the reference implementation (see file header).
    function endScrub(event: PointerEvent) {
      if (!(isDragging || pendingScrubTime !== null)) {
        return;
      }
      if (activePointerId !== null && event.pointerId !== activePointerId) {
        return;
      }

      const commitTime = pendingScrubTime;
      const shouldResume = resumeAfterScrub;

      isDragging = false;
      activePointerId = null;
      pendingScrubTime = null;
      resumeAfterScrub = false;
      root.classList.remove("is-scrubbing");

      if (commitTime !== null) {
        seekTo(commitTime);
      }

      if (event.pointerType === "touch") {
        root.classList.remove("has-preview");
        clearHoveredChapter();

        if (shouldResume) {
          video.play().catch(syncPlayState).finally(showTouchChrome);
        } else {
          showTouchChrome();
        }

        return;
      }

      if (shouldResume) {
        video.play().catch(syncPlayState);
      }

      scheduleChromeHide(300);
    }

    function onDocumentPointerDown(event: PointerEvent) {
      if (modal.hidden || speedMenu.hidden) {
        return;
      }
      if (speedRoot.contains(event.target as Node)) {
        return;
      }

      closeSpeedMenu();
    }

    function onWindowResize() {
      updateTimeline();
    }

    async function toggleFullscreen() {
      if (document.fullscreenElement === shell) {
        await document.exitFullscreen();
        return;
      }

      if (shell.requestFullscreen) {
        await shell.requestFullscreen();
        return;
      }

      if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    }

    for (const button of openButtons) {
      button.addEventListener("pointerenter", loadMedia, { signal });
      button.addEventListener("focus", loadMedia, { signal });
      button.addEventListener("pointerdown", loadMedia, {
        signal,
        passive: true,
      });
      button.addEventListener("click", () => openModal(button), { signal });
    }
    for (const button of closeButtons) {
      button.addEventListener("pointerdown", beginClosingVisualState, {
        signal,
      });
      button.addEventListener("click", closeModal, { signal });
    }
    playButton.addEventListener(
      "click",
      () => {
        const shouldUseTouchChrome = isTouchInteraction();

        if (shouldUseTouchChrome) {
          showTouchChrome();
        }

        togglePlay({ showFeedback: true })
          .catch(syncPlayState)
          .finally(() => {
            if (shouldUseTouchChrome) {
              showTouchChrome();
            }
          });
      },
      { signal }
    );
    centerButton.addEventListener(
      "pointerup",
      (event) => {
        if (event.pointerType !== "touch") {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        lastCenterTouchToggle = performance.now();
        showTouchChrome();

        togglePlay().catch(syncPlayState).finally(showTouchChrome);
      },
      { signal }
    );
    centerButton.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        if (performance.now() - lastCenterTouchToggle < 500) {
          return;
        }

        showTouchChrome();
        togglePlay().catch(syncPlayState).finally(showTouchChrome);
      },
      { signal }
    );
    centerButton.addEventListener(
      "pointerdown",
      (event) => event.stopPropagation(),
      {
        signal,
      }
    );
    muteButton.addEventListener("click", toggleMute, { signal });
    speedButton.addEventListener("click", toggleSpeedMenu, { signal });
    for (const option of speedOptionEls) {
      option.addEventListener(
        "click",
        (event) => {
          const shouldUseTouchChrome = isTouchInteraction(
            event as PointerEvent
          );
          const speed = parseSpeed(option.getAttribute("data-speed"));

          event.preventDefault();
          event.stopPropagation();
          closeSpeedMenu();

          if (shouldUseTouchChrome) {
            showTouchChrome();
          } else {
            speedButton.focus({ preventScroll: true });
          }

          if (speed) {
            changePlaybackSpeed(speed)
              .catch(syncPlayState)
              .finally(() => {
                if (shouldUseTouchChrome) {
                  showTouchChrome();
                }
              });
          }
        },
        { signal }
      );
    }
    pipButton.addEventListener(
      "click",
      () => {
        togglePictureInPicture().catch(syncPictureInPictureState);
      },
      { signal }
    );
    fullscreenButton.addEventListener(
      "click",
      () => {
        toggleFullscreen().catch(syncFullscreenState);
      },
      { signal }
    );

    volumeInput.addEventListener(
      "input",
      () => {
        const volume = Number(volumeInput.value);

        video.volume = clamp(Number.isFinite(volume) ? volume : 1, 0, 1);
        video.muted = video.volume === 0;
        syncVolumeState();
      },
      { signal }
    );

    video.addEventListener(
      "loadedmetadata",
      () => {
        setPlaybackSpeed(currentSpeed, { includeDefault: true });
        syncVideoRatio();
        syncMediaReadyState();
        renderChapters();
      },
      { signal }
    );
    video.addEventListener("loadeddata", syncMediaReadyState, { signal });
    video.addEventListener("canplay", syncMediaReadyState, { signal });
    video.addEventListener("durationchange", renderChapters, { signal });
    video.addEventListener("timeupdate", () => updateTimeline(), { signal });
    video.addEventListener("play", syncPlayState, { signal });
    video.addEventListener("pause", syncPlayState, { signal });
    video.addEventListener("ended", syncPlayState, { signal });
    video.addEventListener("volumechange", syncVolumeState, { signal });
    video.addEventListener("enterpictureinpicture", syncPictureInPictureState, {
      signal,
    });
    video.addEventListener("leavepictureinpicture", syncPictureInPictureState, {
      signal,
    });
    video.addEventListener(
      "webkitpresentationmodechanged",
      syncPictureInPictureState,
      {
        signal,
      }
    );
    pulse.addEventListener("animationend", clearPulse, { signal });
    previewVideo.addEventListener("error", markPreviewFallback, { signal });

    stage.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType !== "touch") {
          return;
        }

        touchStageHadChrome = root.classList.contains("is-chrome-visible");
      },
      { signal }
    );
    stage.addEventListener(
      "pointerenter",
      (event) => {
        isPointerOverStage = true;

        if (event.pointerType === "touch") {
          showTouchChrome();
          return;
        }

        showChrome(isVideoPlaying());
      },
      { signal }
    );
    stage.addEventListener(
      "pointermove",
      (event) => {
        isPointerOverStage = true;

        if (event.pointerType === "touch") {
          showTouchChrome();
          return;
        }

        showChrome(isVideoPlaying());
      },
      { signal }
    );
    stage.addEventListener(
      "pointerleave",
      (event) => {
        isPointerOverStage = false;

        if (event.pointerType === "touch") {
          return;
        }

        hidePreview();
        hideChrome();
      },
      { signal }
    );
    stage.addEventListener("click", onStageClick, { signal });
    root.addEventListener(
      "pointerdown",
      (event) => {
        lastPointerWasTouch = event.pointerType === "touch";

        if (
          lastPointerWasTouch &&
          (event.target as HTMLElement).closest?.(".controls, .seek")
        ) {
          showTouchChrome();
        }
      },
      { signal, capture: true }
    );
    root.addEventListener(
      "focusin",
      (event) => {
        if ((event.target as HTMLElement).closest?.("[data-media-close]")) {
          return;
        }
        showChrome(false);
      },
      { signal }
    );
    root.addEventListener(
      "focusout",
      (event) => {
        if (
          event.relatedTarget instanceof Node &&
          root.contains(event.relatedTarget)
        ) {
          return;
        }

        scheduleChromeHide();
      },
      { signal }
    );

    timeline.addEventListener("pointerdown", startScrub, { signal });
    timeline.addEventListener("pointermove", moveScrub, { signal });
    timeline.addEventListener(
      "pointerleave",
      () => {
        if (!isDragging) {
          hidePreview();
        }
      },
      { signal }
    );
    timeline.addEventListener("pointerup", endScrub, { signal });
    timeline.addEventListener("pointercancel", endScrub, { signal });
    timeline.addEventListener("lostpointercapture", endScrub, { signal });
    timeline.addEventListener("keydown", onTimelineKeydown, { signal });

    document.addEventListener("keydown", onDocumentKeydown, {
      signal,
      capture: true,
    });
    document.addEventListener("pointerdown", onDocumentPointerDown, {
      signal,
      capture: true,
    });
    document.addEventListener("fullscreenchange", syncFullscreenState, {
      signal,
    });
    window.addEventListener("resize", onWindowResize, { signal });

    syncSpeedState(currentSpeed);

    if (video.readyState >= 1) {
      syncVideoRatio();
      renderChapters();
    } else {
      updateTimeline();
    }

    syncMediaReadyState();

    syncPlayState();
    syncVolumeState();
    syncFullscreenState();
    syncPictureInPictureState();

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(closeRevealTimer);
      clearTimeout(chromeTimer);
      cancelAnimationFrame(previewFrame);
      cancelAnimationFrame(playIconFrame);
      controller.abort();
    };
  }, [playerId, prefersReducedMotion]);

  const resolvedPreviewSrc = previewSrc ?? src;
  const resolvedPreviewIosSrc = previewIosSrc ?? iosSrc;

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

      <div
        aria-label={dialogLabel}
        aria-modal="true"
        className={cn("media-01", playerClassName)}
        data-media-01-player={playerId}
        data-media-modal=""
        data-reduced-motion={prefersReducedMotion ? "" : undefined}
        hidden
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
    </div>
  );
}

let stylesInjected = false;

function injectVideoPlayerStyles() {
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

export { VideoPlayer };
