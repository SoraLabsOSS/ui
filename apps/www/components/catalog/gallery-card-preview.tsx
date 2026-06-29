"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { BlogOgImage } from "@/components/blog/blog-og-image";
import type { ComponentGalleryCardPreview } from "@/lib/registry/types";
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

export function GalleryCardPreview({
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

  const poster = preview?.poster;
  const videoWebm = preview?.videoWebm;
  const videoMp4 = preview?.videoMp4;
  const hasVideo = Boolean(videoWebm ?? videoMp4);
  const shouldMountVideo =
    canHoverPreview && hasVideo && (warmInView || active);
  const showVideoLayer = active && videoReady;

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

    if (video.readyState >= VIDEO_READY_STATE) {
      handleCanPlay();
    } else {
      video.addEventListener("canplay", handleCanPlay);
      video.load();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
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

  if (!(poster ?? hasVideo)) {
    return <GalleryCardThumbnail category={category} title={title} />;
  }

  return (
    <div className="absolute inset-0" ref={containerRef}>
      {poster ? (
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
        />
      ) : (
        <GalleryCardThumbnail category={category} title={title} />
      )}

      {shouldMountVideo ? (
        <video
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-300",
            showVideoLayer ? "opacity-100" : "opacity-0"
          )}
          loop
          muted
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
