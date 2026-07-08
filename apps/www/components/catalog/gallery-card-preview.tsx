"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { BlogOgImage } from "@/components/blog/blog-og-image";
import type { ComponentGalleryCardPreview } from "@/lib/registry/types";
import { Skeleton } from "@/registry/primitives/effects/skeleton";
import { GalleryCardThumbnail } from "./gallery-card-thumbnail";

const VIDEO_READY_STATE = 3;

interface GalleryCardPreviewProps {
  active: boolean;
  category?: string;
  preview?: ComponentGalleryCardPreview;
  /** Preload poster when above the fold (LCP). */
  priority?: boolean;
  title: string;
}

function GalleryCardMediaSkeleton() {
  return (
    <Skeleton
      className="absolute inset-0 size-full bg-muted-foreground/15"
      rounded="none"
    />
  );
}

function useCanHoverPreview() {
  const [canHoverPreview, setCanHoverPreview] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      setCanHoverPreview(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return canHoverPreview;
}

function GalleryCardBaseLayer({
  category,
  poster,
  priority,
  showVideoLayer,
  showVideoOnlySkeleton,
  title,
}: {
  category?: string;
  poster?: string;
  priority: boolean;
  showVideoLayer: boolean;
  showVideoOnlySkeleton: boolean;
  title: string;
}) {
  if (poster) {
    return (
      <BlogOgImage
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showVideoLayer ? "opacity-0" : "opacity-100"
        )}
        image={{
          alt: "",
          "aria-hidden": true,
          className: "object-cover",
          fill: true,
          priority,
          sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
          src: poster,
        }}
        key={poster}
      />
    );
  }

  if (showVideoOnlySkeleton) {
    return <GalleryCardMediaSkeleton />;
  }

  return <GalleryCardThumbnail category={category} title={title} />;
}

function GalleryCardPreviewMedia({
  active,
  category,
  priority = false,
  preview,
  title,
}: GalleryCardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canHoverPreview = useCanHoverPreview();
  const [warmInView, setWarmInView] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const poster = preview?.poster;
  const videoWebm = preview?.videoWebm;
  const videoMp4 = preview?.videoMp4;
  const hasVideo = Boolean(videoWebm ?? videoMp4);
  const shouldMountVideo =
    canHoverPreview && hasVideo && !videoFailed && (warmInView || active);
  const showVideoLayer = active && videoReady;
  const showVideoOnlySkeleton = !poster && hasVideo && videoFailed;

  useEffect(() => {
    const node = containerRef.current;
    if (!(node && hasVideo && canHoverPreview)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setWarmInView(entry?.isIntersecting ?? false);
      },
      { rootMargin: "160px" }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [canHoverPreview, hasVideo]);

  useEffect(() => {
    if (!shouldMountVideo) {
      setVideoReady(false);
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleCanPlay = () => {
      setVideoReady(true);
    };

    const handleVideoError = () => {
      setVideoFailed(true);
      setVideoReady(false);
    };

    if (video.readyState >= VIDEO_READY_STATE) {
      handleCanPlay();
    } else {
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("error", handleVideoError);
      video.load();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleVideoError);
    };
  }, [shouldMountVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (active && videoReady) {
      video.play().catch(() => {
        /* autoplay blocked */
      });
      return;
    }

    video.pause();
    if (!active) {
      video.currentTime = 0;
    }
  }, [active, videoReady]);

  return (
    <div className="absolute inset-0" ref={containerRef}>
      <GalleryCardBaseLayer
        category={category}
        poster={poster}
        priority={priority}
        showVideoLayer={showVideoLayer}
        showVideoOnlySkeleton={showVideoOnlySkeleton}
        title={title}
      />

      {shouldMountVideo ? (
        <video
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-300",
            showVideoLayer ? "opacity-100" : "opacity-0"
          )}
          loop
          muted
          onError={() => {
            setVideoFailed(true);
            setVideoReady(false);
          }}
          playsInline
          preload="auto"
          ref={videoRef}
        >
          {videoWebm ? <source src={videoWebm} type="video/webm" /> : null}
          {videoMp4 ? <source src={videoMp4} type="video/mp4" /> : null}
        </video>
      ) : null}
    </div>
  );
}

export function GalleryCardPreview(props: GalleryCardPreviewProps) {
  const poster = props.preview?.poster;
  const videoWebm = props.preview?.videoWebm;
  const videoMp4 = props.preview?.videoMp4;
  const hasVideo = Boolean(videoWebm ?? videoMp4);
  const previewMediaKey = `${poster ?? ""}|${videoWebm ?? ""}|${videoMp4 ?? ""}`;

  if (!(poster ?? hasVideo)) {
    return (
      <GalleryCardThumbnail category={props.category} title={props.title} />
    );
  }

  return <GalleryCardPreviewMedia key={previewMediaKey} {...props} />;
}
