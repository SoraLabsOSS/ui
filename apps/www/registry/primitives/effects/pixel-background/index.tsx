/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: Hover-driven decorative background. */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: Hover-driven decorative background. */
/** biome-ignore-all lint/a11y/noAriaHiddenOnFocusable: Canvas is decorative-only, not interactive. */
"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefCallback,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

class Pixel {
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInteger: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;

  constructor(
    width: number,
    height: number,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number
  ) {
    this.width = width;
    this.height = height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    }
    this.size -= 0.1;
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value: number) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;

  if (value <= min) {
    return min;
  }
  if (value >= max) {
    return max * throttle;
  }
  return value * throttle;
}

export type AnimationPattern =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "diagonal"
  | "ascend"
  | "edges"
  | "spiral"
  | "cursor"
  | "random";

function calculateDelay(
  pattern: AnimationPattern,
  x: number,
  y: number,
  width: number,
  height: number,
  mouseX?: number,
  mouseY?: number
): number {
  switch (pattern) {
    case "top":
      return y;
    case "bottom":
      return height - y;
    case "left":
      return x;
    case "right":
      return width - x;
    case "diagonal":
      return x + y;
    case "ascend":
      return x + (height - y);
    case "edges":
      return Math.min(x, width - x, y, height - y);
    case "spiral": {
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const angle = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      return ((dist / maxDist) * 3 + angle) * maxDist * 0.5;
    }
    case "cursor": {
      const mx = mouseX ?? width / 2;
      const my = mouseY ?? height / 2;
      const dx = x - mx;
      const dy = y - my;
      return Math.sqrt(dx * dx + dy * dy);
    }
    case "random":
      return Math.random() * Math.sqrt(width * width + height * height) * 0.5;
    default: {
      const dx = x - width / 2;
      const dy = y - height / 2;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }
}

const CSS_VAR_TOKEN = /^var\((--[\w-]+)(?:,\s*(.+))?\)$/;

/** Resolves a `var(--token, fallback)` color entry against the container's computed style; passes literal colors through unchanged. */
function resolveColorToken(container: HTMLElement, token: string): string {
  const trimmed = token.trim();
  const match = trimmed.match(CSS_VAR_TOKEN);
  if (!match) {
    return trimmed;
  }
  const [, varName, fallback] = match;
  const resolved = getComputedStyle(container).getPropertyValue(varName).trim();
  return resolved || (fallback?.trim() ?? trimmed);
}

const DEFAULT_COLORS = "#d4d4d4,#bdbdbd,#a3a3a3";

export interface PixelBackgroundProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className"> {
  children?: ReactNode;
  className?: string;
  /**
   * Comma-separated color list cycled across pixels. Accepts literal
   * colors (hex, rgb, hsl) or `var(--token, fallback)` references, which
   * are resolved against the container's computed style — so colors can
   * react to a `.dark` class or `data-theme` attribute toggle without any
   * theme library dependency.
   * @default "#d4d4d4,#bdbdbd,#a3a3a3"
   */
  colors?: string;
  /**
   * Gap between pixels, in logical (CSS) pixels.
   * @default 5
   */
  gap?: number;
  /**
   * Reveal pattern used to stagger each pixel's animation delay.
   * @default "center"
   */
  pattern?: AnimationPattern;
  /** Opacity applied to the canvas layer. @default 1 */
  pixelOpacity?: number;
  ref?: Ref<HTMLDivElement>;
  /** Shimmer speed, 0-100. @default 35 */
  speed?: number;
  /**
   * "hover" animates on pointer enter/leave (desktop). "inView" plays once
   * when the element scrolls into the viewport, for touch/coarse-pointer
   * devices where hover isn't available.
   * @default "hover"
   */
  trigger?: "hover" | "inView";
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

function PixelBackground({
  gap = 5,
  speed = 35,
  pattern = "center",
  colors = DEFAULT_COLORS,
  pixelOpacity = 1,
  trigger = "hover",
  className,
  children,
  ref,
  ...props
}: PixelBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(
    null
  );
  const timePreviousRef = useRef(0);
  const isVisibleRef = useRef(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  const initPixels = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!(container && canvas)) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    if (width === 0 || height === 0) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;

    const colorsArray = colors
      .split(",")
      .map((token) => resolveColorToken(container, token));
    const pxs: Pixel[] = [];
    const gapInt = Math.max(1, Math.floor(gap));

    for (let x = 0; x < width; x += gapInt) {
      for (let y = 0; y < height; y += gapInt) {
        const color =
          colorsArray[Math.floor(Math.random() * colorsArray.length)];
        const delay = calculateDelay(pattern, x, y, width, height);
        pxs.push(
          new Pixel(
            width,
            height,
            ctx,
            x,
            y,
            color,
            getEffectiveSpeed(speed),
            delay
          )
        );
      }
    }
    pixelsRef.current = pxs;
  }, [gap, speed, colors, pattern]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const doAnimate = useCallback(function animate(
    fnName: "appear" | "disappear"
  ) {
    animationRef.current = requestAnimationFrame(() => animate(fnName));
    const timeNow = performance.now();
    const timePassed = timeNow - timePreviousRef.current;
    const timeInterval = 1000 / 60;

    if (timePassed < timeInterval) {
      return;
    }
    timePreviousRef.current = timeNow - (timePassed % timeInterval);

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!(ctx && canvas)) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allIdle = true;
    for (const pixel of pixelsRef.current) {
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle && animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleAnimation = useCallback(
    (name: "appear" | "disappear") => {
      if (prefersReducedMotion || !isVisibleRef.current) {
        return;
      }
      stopAnimation();
      animationRef.current = requestAnimationFrame(() => doAnimate(name));
    },
    [doAnimate, prefersReducedMotion, stopAnimation]
  );

  const onMouseEnter = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (trigger !== "hover") {
        return;
      }
      if (pattern === "cursor" && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        for (const pixel of pixelsRef.current) {
          pixel.delay = calculateDelay(
            "cursor",
            pixel.x,
            pixel.y,
            rect.width,
            rect.height,
            mx,
            my
          );
          pixel.counter = 0;
        }
      }
      handleAnimation("appear");
    },
    [handleAnimation, pattern, trigger]
  );

  const onMouseLeave = useCallback(() => {
    if (trigger !== "hover") {
      return;
    }
    handleAnimation("disappear");
  }, [handleAnimation, trigger]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    initPixels();

    const resizeObserver = new ResizeObserver(() => {
      initPixels();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          stopAnimation();
        } else if (trigger === "inView") {
          handleAnimation("appear");
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    let mutationObserver: MutationObserver | null = null;
    if (colors.includes("var(")) {
      mutationObserver = new MutationObserver(() => initPixels());
      mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
    }

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      mutationObserver?.disconnect();
      stopAnimation();
    };
  }, [initPixels, stopAnimation, handleAnimation, trigger, colors]);

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      data-slot="pixel-background"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={mergeRefs(containerRef, ref)}
      {...props}
    >
      <canvas
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        ref={canvasRef}
        style={{ opacity: pixelOpacity }}
      />
      <div className="relative z-1 h-full w-full">{children}</div>
    </div>
  );
}

export { PixelBackground };
