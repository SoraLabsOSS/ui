"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  type ComponentPropsWithoutRef,
  type Ref,
  type RefCallback,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

const pixelImageLoaderVariants = cva(
  "relative w-full max-w-full overflow-hidden bg-neutral-800",
  {
    variants: {
      aspect: {
        square: "aspect-square",
        video: "aspect-video",
        auto: "",
      },
    },
    defaultVariants: {
      aspect: "square",
    },
  }
);

const DEFAULT_STEPS = [2, 5, 6, 8, 100];
const AUTO_PLACEHOLDER_WIDTH = 20;
const AUTO_PLACEHOLDER_QUALITY = 10;
const RESIZE_QUERY_KEYS = ["w", "width"];
const QUALITY_QUERY_KEYS = ["q", "quality"];

/**
 * Derives a cheap, tiny preview URL from an image already hosted on a
 * resizing CDN (Unsplash, imgix, Cloudinary, Contentful, Shopify, and
 * anything else that exposes width/quality via query params), so a
 * low-res placeholder can be fetched automatically — no hand-crafted
 * base64 needed. Returns `null` when `src` doesn't look resizable (e.g. a
 * static local asset), so callers can fall back to no placeholder.
 */
function getAutoPlaceholderSrc(src: string): string | null {
  let url: URL;
  try {
    url = new URL(src, window.location.origin);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase();
  if (
    (hostname === "cloudinary.com" || hostname.endsWith(".cloudinary.com")) &&
    url.pathname.includes("/upload/")
  ) {
    return src.replace(
      "/upload/",
      `/upload/w_${AUTO_PLACEHOLDER_WIDTH},q_${AUTO_PLACEHOLDER_QUALITY},f_auto/`
    );
  }

  const hasResizeParam = RESIZE_QUERY_KEYS.some((key) =>
    url.searchParams.has(key)
  );
  if (!hasResizeParam) {
    return null;
  }

  for (const key of RESIZE_QUERY_KEYS) {
    if (url.searchParams.has(key)) {
      url.searchParams.set(key, String(AUTO_PLACEHOLDER_WIDTH));
    }
  }
  for (const key of QUALITY_QUERY_KEYS) {
    if (url.searchParams.has(key)) {
      url.searchParams.set(key, String(AUTO_PLACEHOLDER_QUALITY));
    }
  }

  return url.toString();
}

/** Source rect that crops the image to the box's aspect ratio, mirroring `object-fit: cover`. */
function getCoverSourceRect(
  imgWidth: number,
  imgHeight: number,
  boxWidth: number,
  boxHeight: number
) {
  const imgRatio = imgWidth / imgHeight;
  const boxRatio = boxWidth / boxHeight;

  if (imgRatio > boxRatio) {
    const sw = imgHeight * boxRatio;
    return { sx: (imgWidth - sw) / 2, sy: 0, sw, sh: imgHeight };
  }

  const sh = imgWidth / boxRatio;
  return { sx: 0, sy: (imgHeight - sh) / 2, sw: imgWidth, sh };
}

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };
}

export interface PixelImageLoaderProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">,
    VariantProps<typeof pixelImageLoaderVariants> {
  /** Accessible label for the image. */
  alt: string;
  /**
   * When `placeholder` isn't set, tries to derive a cheap low-res preview
   * from `src` itself for CDNs that expose resizing via query params or
   * path segments (Unsplash, imgix, Cloudinary, Contentful, Shopify, and
   * similar). Has no effect on static assets that aren't resizable this
   * way — set `placeholder` explicitly for those.
   * @default true
   */
  autoPlaceholder?: boolean;
  /**
   * Delay before the first pixelation step fires, in ms.
   * @default 300
   */
  initialDelay?: number;
  /**
   * A tiny low-resolution image (typically a base64 data URI) drawn,
   * pixelated, the instant this mounts — no network round trip needed.
   * Replaces the empty background while `src` is still loading, so slow
   * connections show a coarse preview of the image instead of a blank box.
   * Once `src` finishes loading, the reveal continues from this frame.
   * Takes priority over `autoPlaceholder`.
   */
  placeholder?: string;
  ref?: Ref<HTMLDivElement>;
  /** Image source. */
  src: string;
  /**
   * Delay between each step after the first, in ms.
   * @default 80
   */
  stepDuration?: number;
  /**
   * Resolution steps (1-100, percent of full resolution) the reveal walks
   * through before landing on the sharp image. Ending on 100 is required to
   * land on a fully sharp frame.
   * @default [2, 5, 6, 8, 100]
   */
  steps?: number[];
  /**
   * "inView" starts the reveal once the element scrolls into the viewport.
   * "immediate" starts as soon as the image has loaded.
   * @default "inView"
   */
  trigger?: "immediate" | "inView";
}

function PixelImageLoader({
  aspect = "square",
  src,
  alt,
  autoPlaceholder = true,
  placeholder,
  steps = DEFAULT_STEPS,
  initialDelay = 300,
  stepDuration = 80,
  trigger = "inView",
  className,
  ref,
  ...props
}: PixelImageLoaderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tinyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const placeholderImgRef = useRef<HTMLImageElement | null>(null);
  const activeImgRef = useRef<HTMLImageElement | null>(null);
  const lastStepRef = useRef(0);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasStartedRef = useRef(false);
  const isInViewRef = useRef(false);
  const isLoadedRef = useRef(false);

  const clearScheduledTimeouts = useCallback(() => {
    for (const timeoutId of timeoutIdsRef.current) {
      clearTimeout(timeoutId);
    }
    timeoutIdsRef.current = [];
  }, []);

  const drawStep = useCallback((percent: number) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const img = activeImgRef.current;
    if (!(container && canvas && img)) {
      return;
    }

    lastStepRef.current = percent;

    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const { sx, sy, sw, sh } = getCoverSourceRect(
      img.naturalWidth,
      img.naturalHeight,
      width,
      height
    );

    if (percent >= 100) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      return;
    }

    const scale = Math.max(percent / 100, 0.02);
    const downWidth = Math.max(1, Math.round(width * scale));
    const downHeight = Math.max(1, Math.round(height * scale));

    if (!tinyCanvasRef.current) {
      tinyCanvasRef.current = document.createElement("canvas");
    }
    const tiny = tinyCanvasRef.current;
    tiny.width = downWidth;
    tiny.height = downHeight;

    const tinyCtx = tiny.getContext("2d");
    if (!tinyCtx) {
      return;
    }
    tinyCtx.imageSmoothingEnabled = true;
    tinyCtx.drawImage(img, sx, sy, sw, sh, 0, 0, downWidth, downHeight);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tiny, 0, 0, downWidth, downHeight, 0, 0, width, height);
  }, []);

  const runReveal = useCallback(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    clearScheduledTimeouts();
    activeImgRef.current = imgRef.current;

    if (prefersReducedMotion) {
      drawStep(100);
      return;
    }

    const orderedSteps = steps.at(-1) === 100 ? steps : [...steps, 100];

    orderedSteps.forEach((percent, index) => {
      const delay = initialDelay + index * stepDuration;
      const timeoutId = setTimeout(() => drawStep(percent), delay);
      timeoutIdsRef.current.push(timeoutId);
    });
  }, [
    clearScheduledTimeouts,
    drawStep,
    initialDelay,
    prefersReducedMotion,
    stepDuration,
    steps,
  ]);

  const maybeStart = useCallback(() => {
    if (!isLoadedRef.current) {
      return;
    }
    if (trigger === "inView" && !isInViewRef.current) {
      return;
    }
    runReveal();
  }, [runReveal, trigger]);

  useEffect(() => {
    hasStartedRef.current = false;
    isLoadedRef.current = false;
    clearScheduledTimeouts();

    const image = new Image();
    imgRef.current = image;
    image.onload = () => {
      isLoadedRef.current = true;
      maybeStart();
    };
    image.src = src;

    return () => {
      image.onload = null;
    };
  }, [src, clearScheduledTimeouts, maybeStart]);

  useEffect(() => {
    const placeholderSrc =
      placeholder ?? (autoPlaceholder ? getAutoPlaceholderSrc(src) : null);
    if (!placeholderSrc) {
      return;
    }

    const image = new Image();
    placeholderImgRef.current = image;
    image.onload = () => {
      if (hasStartedRef.current) {
        return;
      }
      activeImgRef.current = image;
      drawStep(steps[0] ?? 100);
    };
    image.src = placeholderSrc;

    return () => {
      image.onload = null;
    };
  }, [placeholder, autoPlaceholder, src, steps, drawStep]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (trigger !== "inView") {
      maybeStart();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isInViewRef.current = true;
          maybeStart();
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [trigger, maybeStart]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (activeImgRef.current) {
        drawStep(lastStepRef.current || 100);
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [drawStep]);

  useEffect(() => clearScheduledTimeouts, [clearScheduledTimeouts]);

  return (
    <div
      className={cn(pixelImageLoaderVariants({ aspect, className }))}
      ref={mergeRefs(containerRef, ref)}
      {...props}
    >
      <canvas
        aria-label={alt}
        className="absolute inset-0 h-full w-full"
        ref={canvasRef}
        role="img"
      />
    </div>
  );
}

export { PixelImageLoader, pixelImageLoaderVariants };
