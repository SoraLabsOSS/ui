"use client";

import { prepareShader } from "@vgpu/wgsl/prepare";
import { cn } from "@workspace/ui/lib/utils";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { useEffect, useRef, useState } from "react";
import type { Effect, FrameLoopHandle, Gpu, Surface } from "vgpu";
import { effect, frameLoop, init, surface } from "vgpu";

const FLOW_LINES_SHADER = /* wgsl */ `
struct Params {
  color1: vec3f,
  color2: vec3f,
  color3: vec3f,
  colorAccent: vec3f,
  planeRes: vec2f,
  mouse2D: vec2f,
  linesBlur: f32,
  noise: f32,
  offsetX: f32,
  offsetY: f32,
  linesAmount: f32,
  backgroundScale: f32,
  time: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

fn mod289_v4(x: vec4f) -> vec4f {
  return x - 289.0 * floor(x / 289.0);
}

fn permute(x: vec4f) -> vec4f {
  return mod289_v4(((x * 34.0) + 1.0) * x);
}

fn fade(t: vec2f) -> vec2f {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

fn cnoise2(P: vec2f) -> f32 {
  var Pi = floor(vec4f(P.x, P.y, P.x, P.y)) + vec4f(0.0, 0.0, 1.0, 1.0);
  let Pf = fract(vec4f(P.x, P.y, P.x, P.y)) - vec4f(0.0, 0.0, 1.0, 1.0);
  Pi = mod289_v4(Pi);
  let ix = vec4f(Pi.x, Pi.z, Pi.x, Pi.z);
  let iy = vec4f(Pi.y, Pi.y, Pi.w, Pi.w);
  let fx = vec4f(Pf.x, Pf.z, Pf.x, Pf.z);
  let fy = vec4f(Pf.y, Pf.y, Pf.w, Pf.w);
  let i = permute(permute(ix) + iy);
  var gx = 2.0 * fract(i * 0.0243902439) - 1.0;
  let gy = abs(gx) - 0.5;
  let tx = floor(gx + 0.5);
  gx = gx - tx;
  let g00 = vec2f(gx.x, gy.x);
  let g10 = vec2f(gx.y, gy.y);
  let g01 = vec2f(gx.z, gy.z);
  let g11 = vec2f(gx.w, gy.w);
  let norm = 1.79284291400159 - 0.85373472095314 * vec4f(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  let n00 = dot(g00 * norm.x, vec2f(fx.x, fy.x));
  let n10 = dot(g10 * norm.z, vec2f(fx.y, fy.y));
  let n01 = dot(g01 * norm.y, vec2f(fx.z, fy.z));
  let n11 = dot(g11 * norm.w, vec2f(fx.w, fy.w));
  let fade_xy = fade(vec2f(Pf.x, Pf.y));
  let n_x = mix(vec2f(n00, n01), vec2f(n10, n11), fade_xy.x);
  let n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

fn lines(uv: vec2f, offset: f32) -> f32 {
  let a = abs(0.5 * sin(uv.y * params.linesAmount) + offset * params.linesBlur);
  return smoothstep(0.0, params.linesBlur + offset * params.linesBlur, a);
}

fn random(p: vec2f) -> f32 {
  let k1 = vec2f(23.14069263277926, 2.665144142690225);
  return fract(cos(dot(p, k1)) * 12345.6789);
}

fn fadeLine(uv: vec2f, mouse2D: vec2f, col1: vec3f, col2: vec3f, col3: vec3f) -> vec3f {
  let m = (mouse2D + 1.0) * 0.5;
  let n1 = cnoise2(uv);
  let n2 = cnoise2(uv + params.offsetX * 20.0);
  let n3 = cnoise2(uv * 0.3 + params.offsetY * 10.0);
  let nFinal = mix(mix(n1, n2, m.x), n3, m.y);
  let baseUv = vec2f(nFinal + 2.05) * params.backgroundScale;

  let basePattern = lines(baseUv, 0.1);
  let secondPattern = lines(baseUv, 0.2);

  let baseColor = mix(col1, col2, basePattern);
  return mix(baseColor, col3, secondPattern);
}

@fragment
fn fs_main(@location(0) uvIn: vec2f) -> @location(0) vec4f {
  // match Three.js plane UV (bottom-left origin)
  let vUv = vec2f(uvIn.x, 1.0 - uvIn.y);
  var uv = vUv;
  uv.y += params.offsetY;
  uv.x += params.offsetX;
  uv.x *= params.planeRes.x / params.planeRes.y;

  let col = fadeLine(uv, params.mouse2D, params.color1, params.color2, params.color3);

  var uvRandom = vUv;
  uvRandom.y *= random(vec2f(uvRandom.y, 0.5));
  let finalCol = col + random(uvRandom) * params.noise;

  return vec4f(finalCol, 1.0);
}
`;

const compiledFlowLinesShader = prepareShader(FLOW_LINES_SHADER);

// 1:1 defaults from giats-portfolio background
const DEFAULT_LIGHT_COLOR: [number, number, number] = [
  63 / 255,
  63 / 255,
  63 / 255,
];
const DEFAULT_MID_COLOR: [number, number, number] = [
  38 / 255,
  38 / 255,
  38 / 255,
];
const DEFAULT_DARK_COLOR: [number, number, number] = [
  9 / 255,
  5 / 255,
  12 / 255,
];
const DEFAULT_COLOR_ACCENT: [number, number, number] = [20, 20, 20];

const OFFSET_STEP = 0.00005;
const OFFSET_MAX = 5;
const OFFSET_MIN = 0.1;

const parseColorToRgb = (
  color?: string,
  fallback: [number, number, number] = [0, 0, 0]
): [number, number, number] => {
  if (!color || typeof color !== "string") {
    return fallback;
  }
  const trimmed = color.trim();
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

function stepOffset(
  value: number,
  increasing: { current: boolean },
  step: number,
  min: number,
  max: number
) {
  if (value >= max && increasing.current) {
    increasing.current = false;
  } else if (value <= min && !increasing.current) {
    increasing.current = true;
  }
  return value + (increasing.current ? step : -step);
}

export interface FlowLinesBackgroundProps extends ComponentPropsWithoutRef<"canvas"> {
  /** Deepest tone of the flowing lines. @default "#09050c" */
  darkColor?: string;
  /** Lightest tone of the flowing lines. @default "#3f3f3f" */
  lightColor?: string;
  /** Mid tone blended between light and dark. @default "#262626" */
  midColor?: string;
  /** Ref forwarded to the underlying canvas element. */
  ref?: Ref<HTMLCanvasElement>;
}

export const FlowLinesBackground = ({
  ref,
  lightColor = "#3f3f3f",
  midColor = "#262626",
  darkColor = "#09050c",
  className,
  style,
  ...props
}: FlowLinesBackgroundProps) => {
  const localRef = useRef<HTMLCanvasElement>(null);
  const [unsupported, setUnsupported] = useState(false);
  const bgRef = useRef<Effect | null>(null);
  const colorsRef = useRef({ darkColor, lightColor, midColor });
  colorsRef.current = { darkColor, lightColor, midColor };

  // reactive color updates (1:1 structure preserved, colors adjustable)
  useEffect(() => {
    if (!bgRef.current) {
      return;
    }
    bgRef.current.set({
      params: {
        color1: parseColorToRgb(lightColor, DEFAULT_LIGHT_COLOR),
        color2: parseColorToRgb(midColor, DEFAULT_MID_COLOR),
        color3: parseColorToRgb(darkColor, DEFAULT_DARK_COLOR),
      },
    });
  }, [lightColor, midColor, darkColor]);

  useEffect(() => {
    const canvas = localRef.current;
    if (!canvas) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.gpu) {
      console.warn(
        "WebGPU is not supported in this browser. FlowLinesBackground fallback active."
      );
      setUnsupported(true);
      return;
    }
    setUnsupported(false);

    let disposed = false;
    let gpu: Gpu | undefined;
    let canvasSurface: Surface | undefined;
    let bg: Effect | undefined;
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
        let offsetX = 0.34;
        let offsetY = 0;
        const incX = { current: true };
        const incY = { current: true };
        let time = 0;

        bg = effect(gpu, compiledFlowLinesShader, {
          set: {
            params: {
              color1: parseColorToRgb(
                colorsRef.current.lightColor,
                DEFAULT_LIGHT_COLOR
              ),
              color2: parseColorToRgb(
                colorsRef.current.midColor,
                DEFAULT_MID_COLOR
              ),
              color3: parseColorToRgb(
                colorsRef.current.darkColor,
                DEFAULT_DARK_COLOR
              ),
              colorAccent: DEFAULT_COLOR_ACCENT,
              planeRes: [canvasSurface.size[0], canvasSurface.size[1]],
              mouse2D: [1, 1],
              linesBlur: 0.49,
              noise: 0.02,
              offsetX,
              offsetY,
              linesAmount: 5,
              backgroundScale: 3,
              time,
            },
          },
        });
        bgRef.current = bg;

        unsubResize = canvasSurface.onResize(({ width, height }) => {
          bg?.set({ params: { planeRes: [width, height] } });
        });

        stopLoop = frameLoop(gpu, (frame) => {
          if (!(canvasSurface && bg)) {
            return;
          }
          time += 0.016 * 0.001;
          offsetX = stepOffset(
            offsetX,
            incX,
            OFFSET_STEP,
            OFFSET_MIN,
            OFFSET_MAX
          );
          offsetY = stepOffset(
            offsetY,
            incY,
            OFFSET_STEP,
            OFFSET_MIN,
            OFFSET_MAX
          );
          bg.set({ params: { time, offsetX, offsetY } });
          frame.pass(canvasSurface, bg);
        });
      } catch (error) {
        console.error(
          "FlowLinesBackground WebGPU initialization failed:",
          error
        );
        if (!disposed) {
          setUnsupported(true);
        }
      }
    })();

    return () => {
      disposed = true;
      bgRef.current = null;
      unsubResize?.();
      stopLoop?.stop();
      bg?.dispose();
      gpu?.dispose();
    };
  }, []);

  const fallbackBackground = `radial-gradient(120% 120% at 50% 0%, ${lightColor} 0%, ${darkColor} 70%)`;

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
