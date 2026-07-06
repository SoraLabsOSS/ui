"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

const MASK_LAYER_COUNT = 10;
const DEFAULT_IMAGE_SIZE = 175;

const cursorTrailRevealVariants = cva(
  "pointer-events-none absolute inset-0 z-[2] overflow-hidden",
  {
    variants: {
      layout: {
        default: "",
        fill: "size-full",
      },
    },
    defaultVariants: {
      layout: "default",
    },
  }
);

interface TrailConfig {
  easing: string;
  imageLifespan: number;
  inDuration: number;
  mouseThreshold: number;
  outDuration: number;
  slideDuration: number;
  slideEasing: string;
  staggerIn: number;
  staggerOut: number;
}

interface TrailImageEntry {
  element: HTMLDivElement;
  imageLayers: HTMLDivElement[];
  maskLayers: HTMLDivElement[];
  removeTime: number;
}

const MathUtils = {
  lerp: (a: number, b: number, n: number) => (1 - n) * a + n * b,
  distance: (x1: number, y1: number, x2: number, y2: number) =>
    Math.hypot(x2 - x1, y2 - y1),
};

export interface CursorTrailRevealProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">,
    VariantProps<typeof cursorTrailRevealVariants> {
  /** Viewport width above which the trail is active. */
  desktopBreakpoint?: number;
  /** Trail thumbnail size in pixels. */
  imageSize?: number;
  /** Image URLs cycled as the cursor moves (desktop only). */
  images: readonly string[];
  /** Background color behind each strip during the clip-path reveal. */
  maskColor?: string;
  /** Minimum pointer travel before spawning the next image. */
  mouseThreshold?: number;
}

function CursorTrailReveal({
  className,
  desktopBreakpoint = 1000,
  imageSize = DEFAULT_IMAGE_SIZE,
  images,
  layout = "default",
  maskColor = "var(--background, #1a1a1a)",
  mouseThreshold = 150,
  ...props
}: CursorTrailRevealProps) {
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const animationStateRef = useRef<number | null>(null);
  const trailRef = useRef<TrailImageEntry[]>([]);
  const timeoutIdsRef = useRef<number[]>([]);
  const currentImageIndexRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const interpolatedMousePosRef = useRef({ x: 0, y: 0 });
  const isDesktopRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const configRef = useRef<TrailConfig>({
    imageLifespan: 1000,
    mouseThreshold,
    inDuration: 750,
    outDuration: 1000,
    staggerIn: 100,
    staggerOut: 25,
    slideDuration: 1000,
    slideEasing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    easing: "cubic-bezier(0.87, 0, 0.13, 1)",
  });

  useEffect(() => {
    configRef.current.mouseThreshold = mouseThreshold;
  }, [mouseThreshold]);

  useEffect(() => {
    if (images.length === 0) {
      return;
    }

    for (const src of images) {
      const img = new Image();
      img.src = src;
    }
  }, [images]);

  useEffect(() => {
    const trailContainer = trailContainerRef.current;
    if (!trailContainer || images.length === 0) {
      return;
    }

    const clearScheduledTimeouts = () => {
      for (const id of timeoutIdsRef.current) {
        clearTimeout(id);
      }
      timeoutIdsRef.current.length = 0;
    };

    const scheduleTimeout = (callback: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        const index = timeoutIdsRef.current.indexOf(id);
        if (index !== -1) {
          timeoutIdsRef.current.splice(index, 1);
        }
        callback();
      }, delay);
      timeoutIdsRef.current.push(id);
    };

    const halfImageSize = imageSize / 2;
    const trailImageCount = images.length;
    const config = configRef.current;

    isDesktopRef.current = window.innerWidth > desktopBreakpoint;

    const getMouseDistance = () =>
      MathUtils.distance(
        mousePosRef.current.x,
        mousePosRef.current.y,
        lastMousePosRef.current.x,
        lastMousePosRef.current.y
      );

    const isInTrailContainer = (x: number, y: number) => {
      const rect = trailContainer.getBoundingClientRect();
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    };

    const createTrailImage = () => {
      const imgContainer = document.createElement("div");
      imgContainer.className = "pointer-events-none absolute overflow-hidden";
      imgContainer.style.width = `${imageSize}px`;
      imgContainer.style.height = `${imageSize}px`;

      const imgSrc = images[currentImageIndexRef.current] ?? images[0] ?? "";
      currentImageIndexRef.current =
        (currentImageIndexRef.current + 1) % trailImageCount;

      const rect = trailContainer.getBoundingClientRect();
      const startX =
        interpolatedMousePosRef.current.x - rect.left - halfImageSize;
      const startY =
        interpolatedMousePosRef.current.y - rect.top - halfImageSize;
      const targetX = mousePosRef.current.x - rect.left - halfImageSize;
      const targetY = mousePosRef.current.y - rect.top - halfImageSize;

      imgContainer.style.left = "0px";
      imgContainer.style.top = "0px";
      imgContainer.style.willChange = "transform";
      imgContainer.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
      imgContainer.style.transition = `transform ${config.slideDuration}ms ${config.slideEasing}`;

      const maskLayers: HTMLDivElement[] = [];
      const imageLayers: HTMLDivElement[] = [];

      for (let i = 0; i < MASK_LAYER_COUNT; i++) {
        const layer = document.createElement("div");
        layer.className = "absolute inset-0 will-change-[clip-path]";
        layer.style.backgroundColor = maskColor;

        const imageLayer = document.createElement("div");
        imageLayer.className = "absolute inset-0 bg-cover bg-center";
        imageLayer.style.backgroundImage = `url(${imgSrc})`;

        const stripStart = i * 10;
        const stripEnd = (i + 1) * 10;

        layer.style.clipPath = `polygon(50% ${stripStart}%, 50% ${stripStart}%, 50% ${stripEnd}%, 50% ${stripEnd}%)`;
        layer.style.transition = `clip-path ${config.inDuration}ms ${config.easing}`;
        layer.style.transform = "translateZ(0)";
        layer.style.backfaceVisibility = "hidden";

        layer.appendChild(imageLayer);
        imgContainer.appendChild(layer);
        maskLayers.push(layer);
        imageLayers.push(imageLayer);
      }

      trailContainer.appendChild(imgContainer);

      requestAnimationFrame(() => {
        imgContainer.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;

        for (const [i, layer] of maskLayers.entries()) {
          const stripStart = i * 10;
          const stripEnd = (i + 1) * 10;
          const distanceFromMiddle = Math.abs(i - 4.5);
          const delay = distanceFromMiddle * config.staggerIn;

          scheduleTimeout(() => {
            layer.style.clipPath = `polygon(0% ${stripStart}%, 100% ${stripStart}%, 100% ${stripEnd}%, 0% ${stripEnd}%)`;
          }, delay);
        }
      });

      trailRef.current.push({
        element: imgContainer,
        maskLayers,
        imageLayers,
        removeTime: Date.now() + config.imageLifespan,
      });
    };

    const removeOldImages = () => {
      const now = Date.now();
      if (trailRef.current.length === 0) {
        return;
      }

      const oldestImage = trailRef.current[0];
      if (!oldestImage || now < oldestImage.removeTime) {
        return;
      }

      const imgToRemove = trailRef.current.shift();
      if (!imgToRemove) {
        return;
      }

      for (const [i, layer] of imgToRemove.maskLayers.entries()) {
        const stripStart = i * 10;
        const stripEnd = (i + 1) * 10;
        const distanceFromEdge = 4.5 - Math.abs(i - 4.5);
        const delay = distanceFromEdge * config.staggerOut;

        layer.style.transition = `clip-path ${config.outDuration}ms ${config.easing}`;

        scheduleTimeout(() => {
          layer.style.clipPath = `polygon(50% ${stripStart}%, 50% ${stripStart}%, 50% ${stripEnd}%, 50% ${stripEnd}%)`;
        }, delay);
      }

      for (const imageLayer of imgToRemove.imageLayers) {
        imageLayer.style.transition = `opacity ${config.outDuration}ms ${config.easing}`;
        imageLayer.style.opacity = "0.25";
      }

      scheduleTimeout(() => {
        imgToRemove.element.remove();
      }, config.outDuration + 112);
    };

    const render = () => {
      if (!isDesktopRef.current) {
        return;
      }

      const distance = getMouseDistance();

      interpolatedMousePosRef.current.x = MathUtils.lerp(
        interpolatedMousePosRef.current.x || mousePosRef.current.x,
        mousePosRef.current.x,
        0.1
      );
      interpolatedMousePosRef.current.y = MathUtils.lerp(
        interpolatedMousePosRef.current.y || mousePosRef.current.y,
        mousePosRef.current.y,
        0.1
      );

      if (
        distance > config.mouseThreshold &&
        isInTrailContainer(mousePosRef.current.x, mousePosRef.current.y)
      ) {
        createTrailImage();
        lastMousePosRef.current = { ...mousePosRef.current };
      }

      removeOldImages();
      animationStateRef.current = requestAnimationFrame(render);
    };

    const startAnimation = (): (() => void) | null => {
      if (!isDesktopRef.current || prefersReducedMotion) {
        return null;
      }

      const handleMouseMove = (event: MouseEvent) => {
        mousePosRef.current = { x: event.clientX, y: event.clientY };
      };

      document.addEventListener("mousemove", handleMouseMove);
      animationStateRef.current = requestAnimationFrame(render);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    };

    const stopAnimation = () => {
      if (animationStateRef.current !== null) {
        cancelAnimationFrame(animationStateRef.current);
        animationStateRef.current = null;
      }

      clearScheduledTimeouts();

      for (const item of trailRef.current) {
        item.element.remove();
      }
      trailRef.current.length = 0;
    };

    let cleanUpMouseListener: (() => void) | null = null;

    const handleResize = () => {
      const wasDesktop = isDesktopRef.current;
      isDesktopRef.current = window.innerWidth > desktopBreakpoint;

      if (prefersReducedMotion) {
        return;
      }

      if (isDesktopRef.current && !wasDesktop) {
        cleanUpMouseListener = startAnimation();
      } else if (!isDesktopRef.current && wasDesktop) {
        stopAnimation();
        cleanUpMouseListener?.();
        cleanUpMouseListener = null;
      }
    };

    window.addEventListener("resize", handleResize);

    if (!prefersReducedMotion && isDesktopRef.current) {
      cleanUpMouseListener = startAnimation();
    }

    return () => {
      stopAnimation();
      cleanUpMouseListener?.();
      window.removeEventListener("resize", handleResize);
    };
  }, [desktopBreakpoint, imageSize, images, maskColor, prefersReducedMotion]);

  return (
    <div
      className={cn(cursorTrailRevealVariants({ layout, className }))}
      ref={trailContainerRef}
      {...props}
    />
  );
}

export { CursorTrailReveal, cursorTrailRevealVariants };
