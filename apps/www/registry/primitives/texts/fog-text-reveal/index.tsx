"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
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

type TextAlign = "left" | "center" | "right";

function normalizeAlign(value: string): TextAlign {
  if (value === "right" || value === "end") {
    return "right";
  }
  if (value === "center") {
    return "center";
  }
  return "left";
}

interface TextTexture {
  align: TextAlign;
  boxH: number;
  boxW: number;
  dpr: number;
  fill: string;
  font: string;
  /** Line height in px, or 0 to derive from the font's natural metrics. */
  lineHeight: number;
  padX: number;
  padY: number;
  text: string;
}

function renderTextTexture(o: TextTexture): HTMLCanvasElement | null {
  const cssW = Math.max(1, Math.round(o.boxW + o.padX * 2));
  const cssH = Math.max(1, Math.round(o.boxH + o.padY * 2));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cssW * o.dpr);
  canvas.height = Math.round(cssH * o.dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.scale(o.dpr, o.dpr);
  ctx.font = o.font;
  ctx.fillStyle = o.fill;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = o.align;

  const m = ctx.measureText("Ag");
  const ascent = m.fontBoundingBoxAscent;
  const descent = m.fontBoundingBoxDescent;
  const lineH = o.lineHeight > 0 ? o.lineHeight : ascent + descent;

  const lines = o.text.split("\n");
  const blockH = lines.length * lineH;
  const startY = (o.boxH - blockH) / 2;
  let x = o.padX;
  if (o.align === "right") {
    x = o.padX + o.boxW;
  } else if (o.align === "center") {
    x = o.padX + o.boxW / 2;
  }

  lines.forEach((line, i) => {
    // Half-leading model so GL glyphs land where the in-flow sizer glyphs sit.
    const baseline =
      o.padY + startY + i * lineH + (lineH + ascent - descent) / 2;
    ctx.fillText(line, x, baseline);
  });

  return canvas;
}

let colorProbe: CanvasRenderingContext2D | null = null;

function cssColorToRgb(css: string): [number, number, number] {
  if (!colorProbe) {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    colorProbe = c.getContext("2d", { willReadFrequently: true });
  }
  const ctx = colorProbe;
  if (!ctx) {
    return [1, 1, 1];
  }
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
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

export interface FogTextRevealProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /**
   * Render as a different element instead of `span`.
   * @default "span"
   */
  as?: ElementType;
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
  /** Forwarded ref to the root element. */
  ref?: Ref<HTMLElement>;
  /**
   * Wait until the text scrolls into view before animating.
   * @default true
   */
  startOnView?: boolean;
  /**
   * Text to reveal. Pass an array to cycle through messages; the element
   * reserves a stable width sized to the widest one so cycling never shifts
   * surrounding layout. Font and color are inherited from CSS.
   */
  text: string | string[];
}

function FogTextReveal({
  text,
  as: Component = "span",
  loop = true,
  startOnView = true,
  holdDuration = 320,
  maxBlur = 16,
  className,
  ref,
  ...props
}: FogTextRevealProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [fallback, setFallback] = useState(false);
  const reduced = useReducedMotion();
  const texts = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  useEffect(() => {
    const host = hostRef.current;
    const sizer = sizerRef.current;
    if (!(host && sizer) || texts.length === 0 || reduced) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const gl = new RevealGL();
    if (!gl.available) {
      setFallback(true);
      return;
    }
    gl.canvas.style.pointerEvents = "none";
    gl.canvas.setAttribute("aria-hidden", "true");
    host.appendChild(gl.canvas);

    const measureCanvas = document.createElement("canvas");
    const mctx = measureCanvas.getContext("2d");

    let font = "16px serif";
    let fill = "#000";
    let edge: [number, number, number] = [1, 1, 1];
    let align: TextAlign = "left";
    let lineH = 0;
    let W = 1;
    let H = 1;
    let padX = 0;
    let padY = 0;
    let quadW = 1;
    let quadH = 1;
    let disposed = false;

    const measure = () => {
      const cs = getComputedStyle(host);
      font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      fill = cs.color;
      edge = cssColorToRgb(fill);
      const fontSize = Number.parseFloat(cs.fontSize) || 16;

      const ta = cs.textAlign;
      align = normalizeAlign(ta);

      const lh = cs.lineHeight;
      if (lh === "normal") {
        lineH = 0;
      } else {
        const v = Number.parseFloat(lh);
        lineH = lh.includes("px") ? v : v * fontSize;
      }

      if (mctx) {
        mctx.font = font;
        let widest = 0;
        for (const t of texts) {
          for (const line of t.split("\n")) {
            widest = Math.max(widest, mctx.measureText(line).width);
          }
        }
        sizer.style.minWidth = `${Math.ceil(widest)}px`;
      }

      W = host.clientWidth || 1;
      H = host.clientHeight || 1;
      padY = Math.ceil((2.6 * maxBlur) / dpr + fontSize * 0.35 + H * 0.02);
      padX = Math.ceil((2.6 * maxBlur) / dpr + fontSize * 0.35 + W * 0.03);
      quadW = W + padX * 2;
      quadH = H + padY * 2;
      Object.assign(gl.canvas.style, {
        left: `${-padX}px`,
        top: `${-padY}px`,
        width: `${quadW}px`,
        height: `${quadH}px`,
      });
      gl.resize(quadW, quadH, dpr);
    };

    let index = 0;
    let seed = 1.7;

    const mount = () => {
      const art = renderTextTexture({
        text: texts[index],
        font,
        fill,
        align,
        lineHeight: lineH,
        boxW: W,
        boxH: H,
        padX,
        padY,
        dpr,
      });
      if (art) {
        gl.setTexture(art);
      }
    };
    measure();
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
      const ux = (e.clientX - (b.left - padX)) / (b.width + padX * 2);
      const uy = (e.clientY - (b.top - padY)) / (b.height + padY * 2);
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

    const isLast = () => !loop && index >= texts.length - 1;

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
        index = (index + 1) % texts.length;
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
      gl.draw(
        p,
        maxBlur,
        edge,
        clock,
        quadW / Math.max(1, quadH),
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

    let onScreen = !startOnView;
    let hidden = false;
    const sync = () => {
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
        if (disposed || host.clientWidth < 2) {
          return;
        }
        measure();
        mount();
      }, 120);
    });
    ro.observe(host);

    document.fonts?.ready.then(() => {
      if (disposed) {
        return;
      }
      measure();
      mount();
    });

    const themeObs = new MutationObserver(() => {
      if (disposed) {
        return;
      }
      if (getComputedStyle(host).color !== fill) {
        measure();
        mount();
      }
    });
    const themeOpts = {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    };
    themeObs.observe(document.documentElement, themeOpts);
    if (document.body) {
      themeObs.observe(document.body, themeOpts);
    }

    return () => {
      disposed = true;
      stop();
      io?.disconnect();
      ro.disconnect();
      themeObs.disconnect();
      window.clearTimeout(resizeT);
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      gl.canvas.remove();
      gl.destroy();
    };
  }, [texts, loop, startOnView, holdDuration, maxBlur, reduced]);

  const sizerText = useMemo(() => {
    let best = texts[0] ?? "";
    let bestLines = best.split("\n").length;
    for (const t of texts) {
      const n = t.split("\n").length;
      if (n > bestLines) {
        best = t;
        bestLines = n;
      }
    }
    return best;
  }, [texts]);

  const setRef = (node: HTMLElement | null) => {
    hostRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  if (reduced || fallback) {
    return (
      <Component
        className={cn("inline-block whitespace-pre", className)}
        ref={setRef}
        {...props}
      >
        {texts[0]}
      </Component>
    );
  }

  return (
    <Component
      className={cn(
        "relative inline-block select-none whitespace-pre align-baseline",
        className
      )}
      ref={setRef}
      {...props}
    >
      <span
        aria-hidden="true"
        className="invisible inline-block whitespace-pre"
        ref={sizerRef}
      >
        {sizerText}
      </span>
      <span className="sr-only">{texts.join(". ")}</span>
    </Component>
  );
}

export { FogTextReveal };
