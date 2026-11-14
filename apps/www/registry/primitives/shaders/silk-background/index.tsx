"use client";

import { prepareShader } from "@vgpu/wgsl/prepare";
import { cn } from "@workspace/ui/lib/utils";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { useEffect, useRef, useState } from "react";
import type { Effect, FrameLoopHandle, Gpu, Surface } from "vgpu";
import { clock, effect, frameLoop, init, surface } from "vgpu";

// --- Shader WGSL -------------------------------------------------------------

const SILK_SHADER = /* wgsl */ `
struct Params {
  time: f32,
  resolution: vec2f,
  shadow: vec3f,
  highlight: vec3f,
  scale: f32,
  noise: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

const E: f32 = 2.718281828459045;

fn hash_noise(texCoord: vec2f) -> f32 {
  let G = E;
  let r = G * sin(G * texCoord);
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

@fragment
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let frag = vec2f(pos.x, params.resolution.y - pos.y);
  let uv = frag / params.resolution.y;
  let rnd = hash_noise(frag);
  var tex = uv * params.scale;
  let tOffset = params.time;
  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);
  let pattern = 0.6 + 0.4 * sin(
    5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) +
    sin(20.0 * (tex.x + tex.y - 0.1 * tOffset))
  );
  var col = mix(params.shadow, params.highlight, clamp((pattern - 0.2) / 0.8, 0.0, 1.0));
  col += (rnd - 0.5) / 15.0 * params.noise;
  return vec4f(col, 1.0);
}
`;

// Prepared ShaderSource with full reflection metadata for vgpu pipeline
const compiledSilkShader = prepareShader(SILK_SHADER);

// --- Defaults & Color Parsing ------------------------------------------------

const DEFAULT_SHADOW: [number, number, number] = [
  0x13 / 255,
  0x13 / 255,
  0x16 / 255,
];
const DEFAULT_HIGHLIGHT: [number, number, number] = [
  0x3a / 255,
  0x12 / 255,
  0x20 / 255,
];

/**
 * Parses any valid CSS color string (hex, rgb, hsl, oklch, etc.) into normalized [r, g, b] (0..1).
 */
const parseColorToRgb = (
  color?: string,
  fallback: [number, number, number] = [0, 0, 0]
): [number, number, number] => {
  if (!color || typeof color !== "string") {
    return fallback;
  }

  const trimmed = color.trim();

  // Fast path for 3, 4, 6, 8 hex digits
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = Number.parseInt(hex[0] + hex[0], 16) / 255;
      const g = Number.parseInt(hex[1] + hex[1], 16) / 255;
      const b = Number.parseInt(hex[2] + hex[2], 16) / 255;
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return [r, g, b];
      }
    } else if (hex.length >= 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16) / 255;
      const g = Number.parseInt(hex.slice(2, 4), 16) / 255;
      const b = Number.parseInt(hex.slice(4, 6), 16) / 255;
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return [r, g, b];
      }
    }
  }

  // Generic browser parsing for rgb(), hsl(), oklch(), color(display-p3 ...)
  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.fillStyle = trimmed;
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        return [data[0] / 255, data[1] / 255, data[2] / 255];
      }
    } catch {
      // Ignore and fallback
    }
  }

  return fallback;
};

// --- Props & Types -----------------------------------------------------------

export interface SilkBackgroundProps extends ComponentPropsWithoutRef<"canvas"> {
  /**
   * Crest highlight color of the silk ripples (hex, rgb, hsl, or oklch).
   * @default "#3a1220"
   */
  highlightColor?: string;
  /**
   * Grain noise intensity blended into the silk surface.
   * @default 1
   */
  noise?: number;
  /**
   * Ref forwarded to the underlying canvas element.
   */
  ref?: Ref<HTMLCanvasElement>;
  /**
   * Pattern zoom scale. Higher values create denser ripples.
   * @default 1.1
   */
  scale?: number;
  /**
   * Valley shadow color of the silk ripples (hex, rgb, hsl, or oklch).
   * @default "#131316"
   */
  shadowColor?: string;
  /**
   * Animation playback speed multiplier.
   * @default 0.5
   */
  speed?: number;
}

// --- Component ---------------------------------------------------------------

/**
 * SilkBackground renders a smooth, procedural silk wave background powered by WebGPU.
 */
export const SilkBackground = ({
  ref,
  scale = 1.1,
  noise = 1,
  speed = 0.5,
  shadowColor = "#131316",
  highlightColor = "#3a1220",
  className,
  style,
  ...props
}: SilkBackgroundProps) => {
  const localRef = useRef<HTMLCanvasElement>(null);
  const reduceMotionRef = useRef(false);
  const [unsupported, setUnsupported] = useState(false);
  const silkRef = useRef<Effect | null>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const paramsRef = useRef({ highlightColor, noise, scale, shadowColor });
  paramsRef.current = { highlightColor, noise, scale, shadowColor };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduceMotionRef.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Reactive uniform updates when props change without tearing down the WebGPU pipeline
  useEffect(() => {
    if (!silkRef.current) {
      return;
    }
    silkRef.current.set({
      params: {
        shadow: parseColorToRgb(shadowColor, DEFAULT_SHADOW),
        highlight: parseColorToRgb(highlightColor, DEFAULT_HIGHLIGHT),
        scale,
        noise,
      },
    });
  }, [shadowColor, highlightColor, scale, noise]);

  useEffect(() => {
    const canvas = localRef.current;
    if (!canvas) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.gpu) {
      console.warn(
        "WebGPU is not supported in this browser. SilkBackground fallback active."
      );
      setUnsupported(true);
      return;
    }

    setUnsupported(false);

    let disposed = false;
    let gpu: Gpu | undefined;
    let canvasSurface: Surface | undefined;
    let silk: Effect | undefined;
    let stopLoop: FrameLoopHandle | undefined;
    let unsubResize: (() => void) | undefined;

    (async () => {
      try {
        gpu = await init();
        if (disposed) {
          gpu.dispose();
          return;
        }

        canvasSurface = surface(gpu, canvas, { dpr: [1, 2] });
        silk = effect(gpu, compiledSilkShader, {
          set: {
            params: {
              time: 0,
              resolution: [canvasSurface.size[0], canvasSurface.size[1]],
              shadow: parseColorToRgb(
                paramsRef.current.shadowColor,
                DEFAULT_SHADOW
              ),
              highlight: parseColorToRgb(
                paramsRef.current.highlightColor,
                DEFAULT_HIGHLIGHT
              ),
              scale: paramsRef.current.scale,
              noise: paramsRef.current.noise,
            },
          },
        });
        silkRef.current = silk;

        unsubResize = canvasSurface.onResize(({ width, height }) => {
          silk?.set({ params: { resolution: [width, height] } });
        });

        const time = clock(gpu);

        stopLoop = frameLoop(gpu, (frame) => {
          if (!(canvasSurface && silk)) {
            return;
          }
          const t = reduceMotionRef.current ? 4 : time.time * speedRef.current;
          silk.set({ params: { time: t } });
          frame.pass(canvasSurface, silk);
        });
      } catch (error) {
        console.error("SilkBackground WebGPU initialization failed:", error);
        if (!disposed) {
          setUnsupported(true);
        }
      }
    })();

    return () => {
      disposed = true;
      silkRef.current = null;
      unsubResize?.();
      stopLoop?.stop();
      silk?.dispose();
      gpu?.dispose();
    };
  }, []);

  const fallbackBackground = `radial-gradient(120% 120% at 50% 0%, ${highlightColor} 0%, ${shadowColor} 70%)`;

  return (
    <canvas
      className={cn("h-full w-full", className)}
      ref={(element) => {
        localRef.current = element;
        if (typeof ref === "function") {
          ref(element);
        } else if (ref && "current" in ref) {
          (ref as { current: HTMLCanvasElement | null }).current = element;
        }
      }}
      style={unsupported ? { background: fallbackBackground, ...style } : style}
      {...props}
    />
  );
};
