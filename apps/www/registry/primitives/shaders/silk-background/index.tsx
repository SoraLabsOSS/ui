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

// --- Hardcoded Palettes ------------------------------------------------------

const SHADOW = [0x13 / 255, 0x13 / 255, 0x16 / 255] as [number, number, number];
const HIGHLIGHT = [0x3a / 255, 0x12 / 255, 0x20 / 255] as [
  number,
  number,
  number,
];

const FALLBACK_BACKGROUND =
  "radial-gradient(120% 120% at 50% 0%, rgb(58 18 32) 0%, rgb(19 19 22) 70%)";

// --- Props & Types -----------------------------------------------------------

export interface SilkBackgroundProps extends ComponentPropsWithoutRef<"canvas"> {
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
   * Animation playback speed multiplier.
   * @default 0.5
   */
  speed?: number;
}

// --- Component ---------------------------------------------------------------

/**
 * SilkBackground renders a smooth, procedural silk wave background powered by WebGPU.
 */
export function SilkBackground({
  ref,
  scale = 1.1,
  noise = 1,
  speed = 0.5,
  className,
  style,
  ...props
}: SilkBackgroundProps) {
  const localRef = useRef<HTMLCanvasElement>(null);
  const reduceMotionRef = useRef(false);
  const [unsupported, setUnsupported] = useState(false);

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
              shadow: SHADOW,
              highlight: HIGHLIGHT,
              scale,
              noise,
            },
          },
        });

        unsubResize = canvasSurface.onResize(({ width, height }) => {
          silk?.set({ params: { resolution: [width, height] } });
        });

        const time = clock(gpu);

        stopLoop = frameLoop(gpu, (frame) => {
          if (!(canvasSurface && silk)) {
            return;
          }
          const t = reduceMotionRef.current ? 4 : time.time * speed;
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
      unsubResize?.();
      stopLoop?.stop();
      silk?.dispose();
      gpu?.dispose();
    };
  }, [scale, noise, speed]);

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
      style={
        unsupported ? { background: FALLBACK_BACKGROUND, ...style } : style
      }
      {...props}
    />
  );
}
