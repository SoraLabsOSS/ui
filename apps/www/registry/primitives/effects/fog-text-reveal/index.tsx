"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type ComponentPropsWithoutRef,
  type Ref,
  useEffect,
  useRef,
} from "react";

const VERT = `
  attribute vec2 aPosition;
  attribute vec2 aUV;
  varying vec2 vUV;
  void main(){
    vUV = aUV;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2  uTexel;
  uniform float uProgress;
  uniform float uMaxBlur;
  uniform vec3  uEdge;
  uniform float uTime;
  uniform float uAspect;
  uniform float uSeed;
  uniform vec2  uParTL;
  uniform vec2  uParBR;
  uniform vec2  uCursor;
  uniform float uHover;
  uniform float uReverse;
  varying vec2 vUV;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }

  vec4 blurTex(vec2 uv, float radius){
    if (radius < 0.35) return texture2D(uTex, uv);
    vec2 r1 = uTexel * radius;
    vec2 r2 = uTexel * radius * 2.0;
    vec4 sum = texture2D(uTex, uv) * 1.0;
    float wsum = 1.0;
    for (int i = 0; i < 8; i++){
      float a = float(i) * 0.785398;
      vec2 dir = vec2(cos(a), sin(a));
      sum += texture2D(uTex, uv + dir * r1) * 0.75; wsum += 0.75;
      sum += texture2D(uTex, uv + dir * r2) * 0.5;  wsum += 0.5;
    }
    return sum / wsum;
  }

  float fbm(vec2 p){
    float v = 0.0, amp = 0.5;
    for (int i = 0; i < 4; i++){
      v += amp * noise(p);
      p *= 2.03;
      amp *= 0.5;
    }
    return v;
  }

  void main(){
    float region = smoothstep(0.35, 0.65, (vUV.x + vUV.y) * 0.5);
    vec2 par = mix(uParTL, uParBR, region);
    vec2 baseUV = vUV + par;

    if (uProgress >= 0.999) { gl_FragColor = texture2D(uTex, baseUV); return; }

    float p = uProgress * 1.3;

    vec2 sd = vec2(uSeed * 1.7, uSeed * -1.3);
    vec2 rc = (vUV - 0.5) * vec2(uAspect, 1.0);

    float diag = (vUV.x + vUV.y) * 0.5;
    diag = smoothstep(0.18, 0.82, diag);

    diag = mix(diag, 1.0 - diag, uReverse);
    diag += (fbm(vUV * 1.3 + sd) - 0.5) * 0.08;

    vec2 warp = vec2(fbm(vUV * 3.2 + sd + uTime * 0.05 + 11.0),
                     fbm(vUV * 3.2 - sd - uTime * 0.04 - 7.0)) - 0.5;
    float turb = fbm(vUV * 5.5 + warp * 1.7 + sd + uTime * 0.06);

    float stipple = noise(vUV * vec2(uAspect, 1.0) * 46.0 + sd * 3.0);

    float mask = mix(diag, turb, 0.28);
    mask = mix(mask, stipple, 0.14);

    vec2 cur = (vUV - uCursor) * vec2(uAspect, 1.0);
    float near = 1.0 - smoothstep(0.0, 0.32, length(cur));
    mask -= near * uHover * 0.28;

    float reveal = smoothstep(p + 0.22, p - 0.22, mask);
    if (reveal <= 0.0) discard;

    float blurAmt = smoothstep(p - 0.34, p + 0.22, mask);

    vec2 drift = (-rc * 0.010 + vec2(0.0, 0.006)) * blurAmt;
    float grow = 1.0 + 0.03 * blurAmt;
    vec2 suv = (baseUV - 0.5) / grow + 0.5 + drift;

    float radius = blurAmt * uMaxBlur;
    vec4 tex = blurTex(suv, radius);

    float fw = 0.30;
    float flare = smoothstep(p - fw, p, mask) * smoothstep(p + fw, p, mask);
    flare *= 1.0 - smoothstep(0.8, 1.0, uProgress);

    float ab = flare * 2.0 * uTexel.x * uMaxBlur;
    if (ab > 0.0001) {
      tex.r = blurTex(suv + vec2(ab, 0.0), radius).r;
      tex.b = blurTex(suv - vec2(ab, 0.0), radius).b;
    }

    vec4 wide = blurTex(suv, uMaxBlur * 1.3);
    float halo = wide.a;

    vec3 rgb = tex.rgb;
    vec3 glow = mix(uEdge, vec3(1.0), 0.3);
    rgb += glow * flare * (tex.a * 0.6 + halo * 0.5);
    float alpha = max(tex.a * reveal, halo * flare * 0.5);

    gl_FragColor = vec4(rgb, alpha);
  }
`;

const UNIFORM_NAMES = [
  "uTex",
  "uTexel",
  "uProgress",
  "uMaxBlur",
  "uEdge",
  "uTime",
  "uAspect",
  "uSeed",
  "uParTL",
  "uParBR",
  "uCursor",
  "uHover",
  "uReverse",
] as const;

class RevealGL {
  readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext | null;
  private readonly prog: WebGLProgram | null = null;
  private readonly quad: WebGLBuffer | null = null;
  private readonly loc: Record<string, WebGLUniformLocation | null> = {};
  private readonly aPos: number = 0;
  private readonly aUV: number = 0;
  private tex: WebGLTexture | null = null;
  private texW = 1;
  private texH = 1;
  private readonly ok: boolean = false;

  constructor() {
    this.canvas = document.createElement("canvas");
    Object.assign(this.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });
    const gl = this.canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
    });
    this.gl = gl;
    if (!gl) {
      return;
    }

    const prog = this.build(gl, VERT, FRAG);
    if (!prog) {
      return;
    }
    this.aPos = gl.getAttribLocation(prog, "aPosition");
    this.aUV = gl.getAttribLocation(prog, "aUV");
    for (const u of UNIFORM_NAMES) {
      this.loc[u] = gl.getUniformLocation(prog, u);
    }

    const data = new Float32Array([
      -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0,
    ]);
    const quad = gl.createBuffer();
    if (!quad) {
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.prog = prog;
    this.quad = quad;
    this.ok = true;
  }

  get available() {
    return this.ok;
  }

  private build(
    gl: WebGLRenderingContext,
    vs: string,
    fs: string
  ): WebGLProgram | null {
    const compile = (type: number, src: string): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) {
        return null;
      }
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        return null;
      }
      return sh;
    };

    const vShader = compile(gl.VERTEX_SHADER, vs);
    const fShader = compile(gl.FRAGMENT_SHADER, fs);
    if (!(vShader && fShader)) {
      return null;
    }

    const p = gl.createProgram();
    if (!p) {
      return null;
    }
    gl.attachShader(p, vShader);
    gl.attachShader(p, fShader);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      return null;
    }
    return p;
  }

  setTexture(art: HTMLCanvasElement) {
    const gl = this.gl;
    if (!(this.ok && gl)) {
      return;
    }
    if (this.tex) {
      gl.deleteTexture(this.tex);
    }
    const tex = gl.createTexture();
    if (!tex) {
      return;
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, art);
    this.tex = tex;
    this.texW = art.width;
    this.texH = art.height;
  }

  resize(w: number, h: number, dpr: number) {
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    if (this.ok && this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  draw(
    progress: number,
    maxBlur: number,
    edge: [number, number, number],
    time: number,
    aspect: number,
    seed: number,
    parTL: [number, number],
    parBR: [number, number],
    cursor: [number, number],
    hover: number,
    reverse: number
  ) {
    const gl = this.gl;
    if (!(this.ok && gl && this.tex && this.prog && this.quad)) {
      return;
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL call, not a React hook.
    gl.useProgram(this.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(this.aUV);
    gl.vertexAttribPointer(this.aUV, 2, gl.FLOAT, false, 16, 8);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(this.loc.uTex, 0);
    gl.uniform2f(this.loc.uTexel, 1 / this.texW, 1 / this.texH);
    gl.uniform1f(this.loc.uProgress, progress);
    gl.uniform1f(this.loc.uMaxBlur, maxBlur);
    gl.uniform3f(this.loc.uEdge, edge[0], edge[1], edge[2]);
    gl.uniform1f(this.loc.uTime, time);
    gl.uniform1f(this.loc.uAspect, aspect);
    gl.uniform1f(this.loc.uSeed, seed);
    gl.uniform2f(this.loc.uParTL, parTL[0], parTL[1]);
    gl.uniform2f(this.loc.uParBR, parBR[0], parBR[1]);
    gl.uniform2f(this.loc.uCursor, cursor[0], cursor[1]);
    gl.uniform1f(this.loc.uHover, hover);
    gl.uniform1f(this.loc.uReverse, reverse);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    const gl = this.gl;
    if (!(this.ok && gl)) {
      return;
    }
    if (this.tex) {
      gl.deleteTexture(this.tex);
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

interface CornerText {
  bottom: string[];
  cardH: number;
  cardW: number;
  dpr: number;
  fill: string;
  font: string;
  top: string[];
}

function renderCornerText(o: CornerText): HTMLCanvasElement | null {
  const cssW = Math.max(1, Math.round(o.cardW));
  const cssH = Math.max(1, Math.round(o.cardH));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cssW * o.dpr);
  canvas.height = Math.round(cssH * o.dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.scale(o.dpr, o.dpr);
  ctx.fillStyle = o.fill;
  ctx.textBaseline = "top";

  const pad = Math.round(cssW * 0.035);
  const maxLineW = cssW * 0.52;
  const allLines = [...o.top, ...o.bottom];
  let fontSize = Math.max(24, Math.min(40, cssW * 0.03));
  for (let i = 0; i < 24; i++) {
    ctx.font = `500 ${fontSize}px ${o.font}`;
    const widest = Math.max(
      ...allLines.map((l) => ctx.measureText(l).width),
      0
    );
    if (widest <= maxLineW || fontSize <= 15) {
      break;
    }
    fontSize -= 1;
  }
  const lineH = fontSize * 1.42;
  ctx.font = `500 ${fontSize}px ${o.font}`;

  ctx.textAlign = "left";
  o.top.forEach((line, i) => {
    ctx.fillText(line, pad, pad + i * lineH);
  });

  ctx.textAlign = "right";
  const bottomBlockH = o.bottom.length * lineH;
  const startY = cssH - pad - bottomBlockH;
  o.bottom.forEach((line, i) => {
    ctx.fillText(line, cssW - pad, startY + i * lineH);
  });

  return canvas;
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = Number.parseInt(h.slice(0, 2), 16) / 255;
  const g = Number.parseInt(h.slice(2, 4), 16) / 255;
  const b = Number.parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function resolveFamily(cssFamily: string): string {
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden";
  probe.style.fontFamily = cssFamily;
  probe.textContent = "Ag";
  document.body.appendChild(probe);
  const fam = getComputedStyle(probe).fontFamily || "serif";
  document.body.removeChild(probe);
  return fam;
}

function springStep(
  pos: number,
  vel: number,
  target: number,
  k: number,
  damp: number,
  dt: number
): [number, number] {
  const c = 2 * Math.sqrt(k) * damp;
  const accel = -k * (pos - target) - c * vel;
  const v = vel + accel * dt;
  return [pos + v * dt, v];
}

const OUT_HOLD_MS = 80;
const K_IN = 16;
const K_OUT = 22;
const DAMP = 1.12;
const REVEALED_AT = 0.95;
const GONE_AT = 0.02;
const PARALLAX_AMP = 0.006;
const TL_ANCHOR: [number, number] = [0.16, 0.18];
const BR_ANCHOR: [number, number] = [0.84, 0.82];

const WHITE_WASH = [
  "radial-gradient(55% 75% at 18% 12%, rgba(255,255,255,0.95), transparent 60%)",
  "radial-gradient(48% 66% at 82% 22%, rgba(255,255,255,0.80), transparent 62%)",
  "radial-gradient(65% 55% at 50% 0%,  rgba(255,255,255,0.70), transparent 55%)",
  "radial-gradient(42% 52% at 8% 85%,  rgba(255,255,255,0.75), transparent 60%)",
  "radial-gradient(52% 60% at 92% 88%, rgba(255,255,255,0.65), transparent 62%)",
  "radial-gradient(38% 38% at 65% 55%, rgba(255,255,255,0.55), transparent 70%)",
  "radial-gradient(85% 46% at 50% 100%,rgba(255,255,255,0.55), transparent 55%)",
  "radial-gradient(28% 28% at 30% 45%, rgba(255,255,255,0.45), transparent 72%)",
].join(", ");

const GRAIN_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.7'/></svg>"
)}`;

/** A single message: lines anchored to the top-left and bottom-right corners. */
export interface FogTextRevealMessage {
  /** Lines rendered in the bottom-right corner. */
  bottom: string[];
  /** Lines rendered in the top-left corner. */
  top: string[];
}

export interface FogTextRevealProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * Card background color.
   * @default "#fdfdfb"
   */
  backgroundColor?: string;
  /**
   * Border and edge-glow color.
   * @default "#f2f1ec"
   */
  edgeColor?: string;
  /**
   * CSS `font-family` stack used to render the canvas text.
   * @default "Georgia, serif"
   */
  fontFamily?: string;
  /**
   * How long each message stays fully revealed before clearing, in ms.
   * @default 320
   */
  holdDuration?: number;
  /**
   * Cycle back to the first message after the last. When `false`, the final
   * message reveals once and stays.
   * @default true
   */
  loop?: boolean;
  /**
   * Maximum blur radius of the fog mask, in texels.
   * @default 16
   */
  maxBlur?: number;
  /** Messages cycled through; each renders as top-left + bottom-right corner text. */
  messages: FogTextRevealMessage[];
  /** Forwarded ref to the root element. */
  ref?: Ref<HTMLDivElement>;
  /**
   * Wait until the card scrolls into view before animating.
   * @default true
   */
  startOnView?: boolean;
  /**
   * Text color.
   * @default "#242320"
   */
  textColor?: string;
}

function FogTextReveal({
  messages,
  loop = true,
  startOnView = true,
  holdDuration = 320,
  maxBlur = 16,
  backgroundColor = "#fdfdfb",
  textColor = "#242320",
  edgeColor = "#f2f1ec",
  fontFamily = "Georgia, serif",
  className,
  style,
  ref,
  ...props
}: FogTextRevealProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || messages.length === 0) {
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let W = host.clientWidth || 1;
    let H = host.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let resolvedFamily = resolveFamily(fontFamily);
    const edge = hexToRgb(edgeColor);

    const gl = new RevealGL();
    const useGL = gl.available;
    if (useGL) {
      gl.resize(W, H, dpr);
      host.appendChild(gl.canvas);
    }

    let index = 0;
    let seed = 1.7;

    const mount = () => {
      if (!useGL) {
        return;
      }
      const pair = messages[index];
      const art = renderCornerText({
        top: pair.top,
        bottom: pair.bottom,
        font: resolvedFamily,
        fill: textColor,
        cardW: W,
        cardH: H,
        dpr,
      });
      if (art) {
        gl.setTexture(art);
      }
    };
    mount();

    let pTgtX = 0.5;
    let pTgtY = 0.5;
    let pCurX = 0.5;
    let pCurY = 0.5;
    let cursorUV: [number, number] = [-1, -1];
    let hoverTgt = 0;
    let hoverCur = 0;
    const onMove = (e: PointerEvent) => {
      const b = host.getBoundingClientRect();
      const ux = (e.clientX - b.left) / b.width;
      const uy = (e.clientY - b.top) / b.height;
      pTgtX = ux;
      pTgtY = uy;
      cursorUV = [ux, uy];
      hoverTgt = 1;
    };
    const onLeave = () => {
      pTgtX = 0.5;
      pTgtY = 0.5;
      hoverTgt = 0;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    let phase: "in" | "hold" | "out" = "in";
    let phaseStart = 0;
    let progress = 0;
    let vel = 0;
    let target = 1;
    let clock = 0;
    let last = 0;
    let raf = 0;
    let running = false;
    let held = 0;

    const isLast = () => !loop && index >= messages.length - 1;

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: single rAF frame that advances the spring, phase machine, parallax and per-frame draw of the ported reveal shader.
    const loopFrame = () => {
      if (!running) {
        return;
      }
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      clock += dt;

      const k = target > 0.5 ? K_IN : K_OUT;
      [progress, vel] = springStep(progress, vel, target, k, DAMP, dt);

      if (phase === "in") {
        if (progress >= REVEALED_AT) {
          phase = "hold";
          phaseStart = now;
        }
      } else if (phase === "hold") {
        if (!isLast() && now - phaseStart >= holdDuration) {
          phase = "out";
          phaseStart = now;
          target = 0;
        }
      } else if (progress <= GONE_AT && now - phaseStart >= OUT_HOLD_MS) {
        index = (index + 1) % messages.length;
        seed = ((seed * 1.618) % 7) + 0.3;
        mount();
        phase = "in";
        phaseStart = now;
        progress = 0;
        vel = 0;
        target = 1;
      }

      const pk = 1 - 0.0009 ** dt;
      pCurX += (pTgtX - pCurX) * pk;
      pCurY += (pTgtY - pCurY) * pk;
      hoverCur += (hoverTgt - hoverCur) * (1 - 0.002 ** dt);

      const amp = PARALLAX_AMP * hoverCur;
      const parTL: [number, number] = [
        (pCurX - TL_ANCHOR[0]) * amp,
        (pCurY - TL_ANCHOR[1]) * amp,
      ];
      const parBR: [number, number] = [
        (pCurX - BR_ANCHOR[0]) * amp,
        (pCurY - BR_ANCHOR[1]) * amp,
      ];

      const p = Math.max(0, Math.min(1, progress));
      const reverse = phase === "out" ? 1 : 0;
      if (useGL) {
        gl.draw(
          p,
          maxBlur,
          edge,
          clock,
          W / Math.max(1, H),
          seed,
          parTL,
          parBR,
          cursorUV,
          hoverCur,
          reverse
        );

        held += ((phase === "hold" ? 1 : 0) - held) * (1 - 0.02 ** dt);
        const breathe = Math.sin(clock * 0.45) * 0.5 + 0.5;
        const s = 1 + held * breathe * 0.0015;
        const b = 1 + held * (breathe - 0.5) * 0.012;
        gl.canvas.style.transform = `scale(${s.toFixed(4)})`;
        gl.canvas.style.filter = `brightness(${b.toFixed(3)})`;
      }

      raf = requestAnimationFrame(loopFrame);
    };

    const start = () => {
      if (running) {
        return;
      }
      running = true;
      phase = "in";
      phaseStart = performance.now();
      last = phaseStart;
      progress = 0;
      vel = 0;
      target = 1;
      raf = requestAnimationFrame(loopFrame);
    };
    const stop = () => {
      running = false;
      if (raf) {
        cancelAnimationFrame(raf);
      }
      raf = 0;
      last = 0;
    };

    const renderStill = () => {
      if (useGL) {
        gl.draw(
          1,
          0,
          edge,
          0,
          W / Math.max(1, H),
          seed,
          [0, 0],
          [0, 0],
          [-1, -1],
          0,
          0
        );
      }
    };

    let onScreen = !startOnView;
    let hidden = false;
    const sync = () => {
      if (reduced) {
        return;
      }
      if (onScreen && !hidden) {
        start();
      } else {
        stop();
      }
    };

    let io: IntersectionObserver | null = null;
    if (startOnView) {
      io = new IntersectionObserver(
        (es) => {
          onScreen = es[0]?.isIntersecting ?? false;
          sync();
        },
        { threshold: 0.15 }
      );
      io.observe(host);
    } else {
      sync();
    }

    const onVis = () => {
      hidden = document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    let resizeT = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        W = host.clientWidth || 1;
        H = host.clientHeight || 1;
        if (W < 2 || H < 2) {
          return;
        }
        gl.resize(W, H, dpr);
        mount();
      }, 120);
    });
    ro.observe(host);

    if (document.fonts?.load) {
      document.fonts.load(`500 1em "${resolvedFamily}"`).then(
        () => {
          resolvedFamily = resolveFamily(fontFamily);
          mount();
        },
        () => {
          // font load rejected — keep the fallback family
        }
      );
    }

    if (reduced) {
      renderStill();
    }

    return () => {
      stop();
      io?.disconnect();
      ro.disconnect();
      window.clearTimeout(resizeT);
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      gl.destroy();
    };
  }, [
    messages,
    loop,
    startOnView,
    holdDuration,
    maxBlur,
    textColor,
    edgeColor,
    fontFamily,
  ]);

  const srText = messages
    .map((m) => [...m.top, ...m.bottom].join(" "))
    .join(". ");

  return (
    <div
      className={cn(
        "relative mx-auto aspect-[1344/620] w-full select-none overflow-hidden rounded-[12px] border shadow-sm",
        className
      )}
      ref={(node) => {
        hostRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      style={{ backgroundColor, borderColor: edgeColor, ...style }}
      {...props}
    >
      <span className="sr-only">{srText}</span>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ inset: "-8%", backgroundImage: WHITE_WASH }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("${GRAIN_SVG}")`,
          backgroundSize: "140px 140px",
          opacity: 0.05,
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}

export { FogTextReveal };
