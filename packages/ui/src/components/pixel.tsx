"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useTheme } from "next-themes";
import * as React from "react";

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
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number
  ) {
    this.width = canvas.width;
    this.height = canvas.height;
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

function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;

  if (value <= min || reducedMotion) {
    return min;
  }
  if (value >= max) {
    return max * throttle;
  }
  return value * throttle;
}

type AnimationPattern =
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
    case "center":
    default: {
      const dx = x - width / 2;
      const dy = y - height / 2;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }
}

type PixelBackgroundProps = {
  gap?: number;
  speed?: number;
  pattern?: AnimationPattern;
  darkColors?: string;
  lightColors?: string;
  pixelOpacity?: number;
  className?: string;
  children?: React.ReactNode;
};

const DEFAULT_DARK_COLORS = "#2a2a2a,#3b3b3b,#525252";
const DEFAULT_LIGHT_COLORS = "#d4d4d4,#bdbdbd,#a3a3a3";

function PixelBackground({
  gap = 5,
  speed = 35,
  pattern = "center",
  darkColors = DEFAULT_DARK_COLORS,
  lightColors = DEFAULT_LIGHT_COLORS,
  pixelOpacity = 1,
  className,
  children,
}: PixelBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const colors =
    (resolvedTheme === "dark" ? darkColors : lightColors) ?? lightColors;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const pixelsRef = React.useRef<Pixel[]>([]);
  const animationRef = React.useRef<ReturnType<
    typeof requestAnimationFrame
  > | null>(null);
  const timePreviousRef = React.useRef(0);
  const reducedMotionRef = React.useRef(false);

  React.useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    timePreviousRef.current = performance.now();
  }, []);

  const initPixels = React.useCallback(() => {
    if (!(containerRef.current && canvasRef.current)) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) {
      return;
    }

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;

    const colorsArray = colors.split(",");
    const pxs: Pixel[] = [];
    const gapInt = Math.max(1, Math.floor(gap));

    for (let x = 0; x < width; x += gapInt) {
      for (let y = 0; y < height; y += gapInt) {
        const color =
          colorsArray[Math.floor(Math.random() * colorsArray.length)];
        const delay = reducedMotionRef.current
          ? 0
          : calculateDelay(pattern, x, y, width, height);
        pxs.push(
          new Pixel(
            canvasRef.current!,
            ctx,
            x,
            y,
            color,
            getEffectiveSpeed(speed, reducedMotionRef.current),
            delay
          )
        );
      }
    }
    pixelsRef.current = pxs;
  }, [gap, speed, colors, pattern]);

  const doAnimate = React.useCallback(function animate(
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

    const ctx = canvasRef.current?.getContext("2d");
    if (!(ctx && canvasRef.current)) {
      return;
    }

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    let allIdle = true;
    for (let i = 0; i < pixelsRef.current.length; i++) {
      const pixel = pixelsRef.current[i];
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle && animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const handleAnimation = React.useCallback(
    (name: "appear" | "disappear") => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(() => doAnimate(name));
    },
    [doAnimate]
  );

  const onMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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
    [handleAnimation, pattern]
  );
  const onMouseLeave = React.useCallback(
    () => handleAnimation("disappear"),
    [handleAnimation]
  );

  React.useEffect(() => {
    initPixels();
    const observer = new ResizeObserver(() => {
      initPixels();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initPixels]);

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      data-slot="pixel-background"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={containerRef}
    >
      <canvas
        className="pointer-events-none absolute inset-0 h-full w-full"
        ref={canvasRef}
        style={{ opacity: pixelOpacity }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export { type AnimationPattern, PixelBackground, type PixelBackgroundProps };
