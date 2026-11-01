import {
  type ExtendedVideoElement,
  formatSpeedLabel,
  IOS_USER_AGENT_PATTERN,
  sanitizeId,
} from "./defs";
import { createPlayIconMorpher } from "./icon";

export interface AttachVideoPlayerOptions {
  playerId: string;
  prefersReducedMotion: boolean;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: coordinates media loading, controls, focus, and pointer interactions.
export function attachVideoPlayer(
  root: HTMLElement,
  container: HTMLElement,
  options: AttachVideoPlayerOptions
) {
  const { playerId, prefersReducedMotion } = options;
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
  const durationNode = root.querySelector<HTMLElement>("[data-media-duration]");
  const timelineRaw = root.querySelector<HTMLElement>("[data-media-timeline]");
  const chapterTrackRaw = root.querySelector<HTMLElement>(
    "[data-media-chapter-track]"
  );
  const scrubberRaw = root.querySelector<HTMLElement>("[data-media-scrubber]");
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
  const playPath = root.querySelector<SVGPathElement>("[data-media-play-path]");
  const roundFilter = root.querySelector<SVGFilterElement>(
    "[data-media-round-filter]"
  );
  const pulseRaw = root.querySelector<HTMLElement>("[data-media-pulse]");

  const NOOP_CONTROLLER = {
    destroy: () => {
      // no-op when elements are missing
    },
  };

  if (!(shellRaw && stageRaw)) {
    return NOOP_CONTROLLER;
  }
  if (!(videoRaw && previewVideoRaw)) {
    return NOOP_CONTROLLER;
  }
  if (!(playButtonRaw && muteButtonRaw && volumeInputRaw)) {
    return NOOP_CONTROLLER;
  }
  if (!(speedRootRaw && speedButtonRaw && speedMenuRaw && speedLabelRaw)) {
    return NOOP_CONTROLLER;
  }
  if (!speedOptionEls.length) {
    return NOOP_CONTROLLER;
  }
  if (!(pipButtonRaw && fullscreenButtonRaw && centerButtonRaw)) {
    return NOOP_CONTROLLER;
  }
  if (!(timelineRaw && chapterTrackRaw && scrubberRaw && pulseRaw)) {
    return NOOP_CONTROLLER;
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
  const iconMorpher = createPlayIconMorpher(playPath, prefersReducedMotion);
  let isMediaLoaded = false;
  let currentSpeed = parseSpeed(video.getAttribute("data-default-speed")) || 1;
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
      (item, index, list) => index === 0 || item.start !== list[index - 1].start
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
    iconMorpher.morph(isPlaying);
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

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: coordinates timeline preview state and pointer interactions.
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

    if (!isTouchInteraction(event as unknown as PointerEvent) && previewCard) {
      previewCard.style.left = `${left}px`;
    }

    if (previewTimeNode) {
      previewTimeNode.textContent = formatTime(time);
    }
    if (previewTitleNode) {
      previewTitleNode.textContent = chapter.title;
    }
    if (previewCard) {
      previewCard.classList.toggle("has-title", Boolean(chapter.title.trim()));
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

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: coordinates keyboard shortcuts and player controls.
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
        const shouldUseTouchChrome = isTouchInteraction(event as PointerEvent);
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

  return {
    destroy() {
      clearTimeout(closeTimer);
      clearTimeout(closeRevealTimer);
      clearTimeout(chromeTimer);
      cancelAnimationFrame(previewFrame);
      iconMorpher.destroy();
      controller.abort();
    },
  };
}
