import gsap from "gsap";

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float uProgress;
uniform vec2  uOffset;
uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uEdgeSmooth;
uniform float uDirection;
uniform float uAspect;
uniform vec2  uResolution;
uniform float uPixelSize;
uniform float uDitherSize;
uniform vec3  uColor;

varying vec2 vUv;

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(a * 0.5) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
  return bayer4(a * 0.5) * 0.25 + bayer2(a);
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
   -0.577350269189626,
    0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  if (uPixelSize > 0.0) {
    vec2 cells = floor(uResolution / uPixelSize);
    uv = (floor(uv * cells) + 0.5) / cells;
  }

  vec2 noiseUv = vec2(uv.x * uAspect, uv.y);
  float noise = snoise(noiseUv * uNoiseScale + uOffset);

  float margin = uNoiseStrength + uEdgeSmooth;
  float p = mix(-margin, 1.0 + margin, uProgress);

  float threshold = p + noise * uNoiseStrength;
  float y = mix(1.0 - uv.y, uv.y, uDirection);
  float fill = clamp((threshold - y) / (2.0 * uEdgeSmooth) + 0.5, 0.0, 1.0);

  float bayer = bayer8(gl_FragCoord.xy / max(uDitherSize, 1.0));
  float alpha = 1.0 - step(fill, bayer);

  gl_FragColor = vec4(uColor, alpha);
}
`;

export interface PageTransitionShaderConfig {
  color?: [number, number, number];
  ditherSize?: number;
  edgeSmoothness?: number;
  noiseFrequency?: number;
  noiseStrength?: number;
}

function bindProgram(gl: WebGLRenderingContext, program: WebGLProgram) {
  const method = "useProgram" as const;
  gl[method](program);
}

export class PageTransitionShader {
  private readonly canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;

  uProgress = 0;
  private uDirection = 1.0;
  private uOffset: [number, number] = [0, 0];
  private readonly uColor: [number, number, number] = [0.0, 0.0, 0.0];

  private locations: {
    uAspect: WebGLUniformLocation | null;
    uColor: WebGLUniformLocation | null;
    uDirection: WebGLUniformLocation | null;
    uDitherSize: WebGLUniformLocation | null;
    uEdgeSmooth: WebGLUniformLocation | null;
    uNoiseScale: WebGLUniformLocation | null;
    uNoiseStrength: WebGLUniformLocation | null;
    uOffset: WebGLUniformLocation | null;
    uPixelSize: WebGLUniformLocation | null;
    uProgress: WebGLUniformLocation | null;
    uResolution: WebGLUniformLocation | null;
  } | null = null;

  private activeTween: gsap.core.Tween | null = null;
  private isRendering = false;
  private readonly config: Required<PageTransitionShaderConfig>;

  constructor(
    canvas: HTMLCanvasElement,
    config: PageTransitionShaderConfig = {}
  ) {
    this.canvas = canvas;
    this.config = {
      color: config.color ?? [0.0, 0.0, 0.0],
      ditherSize: config.ditherSize ?? 3.0,
      edgeSmoothness: config.edgeSmoothness ?? 1.0,
      noiseFrequency: config.noiseFrequency ?? 0.5,
      noiseStrength: config.noiseStrength ?? 0.8,
    };
    this.uColor = this.config.color;

    this.initGL();
    this.handleResize = this.handleResize.bind(this);
    this.render = this.render.bind(this);

    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  }

  private initGL() {
    const gl = this.canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
      stencil: false,
    });
    if (!gl) {
      return;
    }
    this.gl = gl;

    const vertShader = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!(vertShader && fragShader)) {
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      return;
    }
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    this.program = program;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    this.buffer = buffer;

    const posAttr = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    this.locations = {
      uAspect: gl.getUniformLocation(program, "uAspect"),
      uColor: gl.getUniformLocation(program, "uColor"),
      uDirection: gl.getUniformLocation(program, "uDirection"),
      uDitherSize: gl.getUniformLocation(program, "uDitherSize"),
      uEdgeSmooth: gl.getUniformLocation(program, "uEdgeSmooth"),
      uNoiseScale: gl.getUniformLocation(program, "uNoiseScale"),
      uNoiseStrength: gl.getUniformLocation(program, "uNoiseStrength"),
      uOffset: gl.getUniformLocation(program, "uOffset"),
      uPixelSize: gl.getUniformLocation(program, "uPixelSize"),
      uProgress: gl.getUniformLocation(program, "uProgress"),
      uResolution: gl.getUniformLocation(program, "uResolution"),
    };
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) {
      return null;
    }
    const shader = this.gl.createShader(type);
    if (!shader) {
      return null;
    }
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  handleResize() {
    if (!(this.gl && this.program && this.locations)) {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    bindProgram(this.gl, this.program);
    this.gl.uniform1f(this.locations.uAspect, w / h);
    this.gl.uniform2f(
      this.locations.uResolution,
      this.canvas.width,
      this.canvas.height
    );

    if (this.isRendering) {
      this.render();
    }
  }

  private startTicker() {
    if (!this.isRendering) {
      this.isRendering = true;
      gsap.ticker.add(this.render);
    }
  }

  private stopTicker() {
    if (this.isRendering) {
      this.isRendering = false;
      gsap.ticker.remove(this.render);
    }
    if (this.gl) {
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
  }

  private render() {
    if (!(this.gl && this.program && this.locations)) {
      return;
    }

    bindProgram(this.gl, this.program);
    this.gl.uniform1f(this.locations.uProgress, this.uProgress);
    this.gl.uniform2f(this.locations.uOffset, this.uOffset[0], this.uOffset[1]);
    this.gl.uniform1f(this.locations.uNoiseScale, this.config.noiseFrequency);
    this.gl.uniform1f(this.locations.uNoiseStrength, this.config.noiseStrength);
    this.gl.uniform1f(this.locations.uEdgeSmooth, this.config.edgeSmoothness);
    this.gl.uniform1f(this.locations.uDirection, this.uDirection);
    this.gl.uniform1f(this.locations.uPixelSize, 0.0);
    this.gl.uniform1f(this.locations.uDitherSize, this.config.ditherSize);
    this.gl.uniform3f(
      this.locations.uColor,
      this.uColor[0],
      this.uColor[1],
      this.uColor[2]
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  show(duration = 1.1, ease = "power2.out"): Promise<void> {
    if (this.activeTween) {
      this.activeTween.kill();
    }

    this.uOffset = [Math.random() * 100, Math.random() * 100];
    this.uDirection = 1.0;
    this.uProgress = 0.0;
    this.startTicker();

    return new Promise((resolve) => {
      this.activeTween = gsap.to(this, {
        duration,
        ease,
        onComplete: () => {
          this.activeTween = null;
          resolve();
        },
        uProgress: 1.0,
      });
    });
  }

  hide(duration = 1.5, ease = "power2.inOut"): Promise<void> {
    if (this.activeTween) {
      this.activeTween.kill();
    }

    this.uOffset = [Math.random() * 100, Math.random() * 100];
    this.uDirection = 0.0;
    this.uProgress = 1.0;
    this.startTicker();

    return new Promise((resolve) => {
      this.activeTween = gsap.to(this, {
        duration,
        ease,
        onComplete: () => {
          this.activeTween = null;
          this.stopTicker();
          resolve();
        },
        uProgress: 0.0,
      });
    });
  }

  destroy() {
    if (this.activeTween) {
      this.activeTween.kill();
    }
    this.stopTicker();
    window.removeEventListener("resize", this.handleResize);

    if (this.gl) {
      if (this.buffer) {
        this.gl.deleteBuffer(this.buffer);
      }
      if (this.program) {
        this.gl.deleteProgram(this.program);
      }
    }
  }
}
