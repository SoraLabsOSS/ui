import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { BRAND_ACCENT, BRAND_ASCII_CHAR } from "./config";

gsap.registerPlugin(SplitText);

const ASCII_CHARS = "........:::=+xX#0369";
const FONT_SIZE = 18;
const CELL_SIZE = 20;
const ASCII_COLUMNS = 80;
const DPR = 2;

const CHAR_COLOR = BRAND_ASCII_CHAR;
const HOVER_COLOR = BRAND_ACCENT;
const HOVER_CHAR_COLOR = "#ffffff";

const HOVER_RADIUS = 8;
const CLUSTER_SIZE = 10;
const HIGHLIGHT_LIFETIME = 300;

const COMPACT_BREAKPOINT = "(max-width: 1000px)";

const isCompactLayout = () => window.matchMedia(COMPACT_BREAKPOINT).matches;

const getRevealEnd = () => {
  const isCompact = isCompactLayout();
  return {
    left: isCompact ? -22 : 0,
    right: isCompact ? 22 : 0,
  };
};

const backgroundCharIndex = ASCII_CHARS.lastIndexOf(".");

interface AsciiCell {
  char: string;
  col: number;
  highlightEndTime: number;
  row: number;
}

export interface HandInstance {
  canvas: HTMLCanvasElement;
  cellList: AsciiCell[];
  cells: Map<string, AsciiCell>;
  destroy: () => void;
  rows: number;
}

const sampleImagePixels = (image: HTMLImageElement, gridRows: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = ASCII_COLUMNS;
  canvas.height = gridRows;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not sample ASCII hand image");
  }

  ctx.drawImage(image, 0, 0, ASCII_COLUMNS, gridRows);
  return ctx.getImageData(0, 0, ASCII_COLUMNS, gridRows).data;
};

const pixelToCharIndex = (pixels: Uint8ClampedArray, pixelOffset: number) => {
  const brightness =
    (pixels[pixelOffset] * 0.299 +
      pixels[pixelOffset + 1] * 0.587 +
      pixels[pixelOffset + 2] * 0.114) /
    255;

  return Math.min(
    ASCII_CHARS.length - 1,
    Math.floor((1 - brightness) * ASCII_CHARS.length)
  );
};

const buildCells = (image: HTMLImageElement) => {
  const rows = Math.round(
    ASCII_COLUMNS / (image.naturalWidth / image.naturalHeight)
  );
  const pixels = sampleImagePixels(image, rows);
  const cells = new Map<string, AsciiCell>();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < ASCII_COLUMNS; col++) {
      const charIndex = pixelToCharIndex(
        pixels,
        (row * ASCII_COLUMNS + col) * 4
      );
      if (charIndex <= backgroundCharIndex) {
        continue;
      }

      cells.set(`${col},${row}`, {
        col,
        row,
        char: ASCII_CHARS[charIndex] ?? ".",
        highlightEndTime: 0,
      });
    }
  }

  return { rows, cells };
};

function setupHand(image: HTMLImageElement): HandInstance {
  const { rows, cells } = buildCells(image);
  const cellList = [...cells.values()];

  const wrapper = image.closest(".footer-hand-img");
  const canvas = wrapper?.querySelector("canvas");
  if (!(wrapper && canvas instanceof HTMLCanvasElement)) {
    throw new Error("ASCII hand canvas not found");
  }

  canvas.width = ASCII_COLUMNS * CELL_SIZE * DPR;
  canvas.height = rows * CELL_SIZE * DPR;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create ASCII hand canvas context");
  }

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.font = `${FONT_SIZE}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const metrics = ctx.measureText("X");
  const glyphHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const baselineOffset =
    CELL_SIZE / 2 + glyphHeight / 2 - metrics.actualBoundingBoxDescent;

  const canvasWidth = ASCII_COLUMNS * CELL_SIZE;
  const canvasHeight = rows * CELL_SIZE;

  let frameId = 0;

  const render = () => {
    const now = Date.now();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (const cell of cellList) {
      const x = cell.col * CELL_SIZE;
      const y = cell.row * CELL_SIZE;
      const isHighlighted = cell.highlightEndTime > now;

      if (isHighlighted) {
        ctx.fillStyle = HOVER_COLOR;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }

      ctx.fillStyle = isHighlighted ? HOVER_CHAR_COLOR : CHAR_COLOR;
      ctx.fillText(cell.char, x + CELL_SIZE / 2, y + baselineOffset);
    }

    frameId = requestAnimationFrame(render);
  };

  render();

  return {
    canvas,
    cells,
    cellList,
    rows,
    destroy: () => {
      cancelAnimationFrame(frameId);
    },
  };
}

const highlightCluster = (
  cells: Map<string, AsciiCell>,
  startCell: AsciiCell
) => {
  const now = Date.now();
  startCell.highlightEndTime = now + HIGHLIGHT_LIFETIME;

  const steps = Math.floor(Math.random() * CLUSTER_SIZE) + 1;
  const litCells = [startCell];
  let current = startCell;

  for (let step = 0; step < steps; step++) {
    const neighbours: AsciiCell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) {
          continue;
        }
        const neighbour = cells.get(`${current.col + dx},${current.row + dy}`);
        if (neighbour && !litCells.includes(neighbour)) {
          neighbours.push(neighbour);
        }
      }
    }
    if (neighbours.length === 0) {
      break;
    }

    const next = neighbours[Math.floor(Math.random() * neighbours.length)];
    if (!next) {
      break;
    }

    next.highlightEndTime = now + HIGHLIGHT_LIFETIME + step * 10;
    litCells.push(next);
    current = next;
  }
};

const hoverHand = (hand: HandInstance, clientX: number, clientY: number) => {
  const rect = hand.canvas.getBoundingClientRect();
  const mouseCol = ((clientX - rect.left) / rect.width) * ASCII_COLUMNS;
  const mouseRow = ((clientY - rect.top) / rect.height) * hand.rows;

  let closest: AsciiCell | null = null;
  let closestDist = Number.POSITIVE_INFINITY;

  for (const cell of hand.cellList) {
    const dx = mouseCol - cell.col;
    const dy = mouseRow - cell.row;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < closestDist) {
      closestDist = dist;
      closest = cell;
    }
  }

  if (closest && closestDist <= HOVER_RADIUS) {
    highlightCluster(hand.cells, closest);
  }
};

const splitHeadingChars = (footer: HTMLElement) => {
  const headings = footer.querySelectorAll<HTMLElement>(".footer-header h1");
  const chars: Element[] = [];

  for (const heading of headings) {
    const split = SplitText.create(heading, {
      type: "chars",
      charsClass: "char",
    });
    chars.push(...split.chars);
  }

  if (chars.length > 0) {
    gsap.set(chars, { position: "relative", yPercent: 125 });
  }

  return chars;
};

const splitContentLines = (footer: HTMLElement) => {
  const elements = footer.querySelectorAll<HTMLElement>(
    ".footer-links a, .footer-text p"
  );
  const lines: Element[] = [];

  for (const element of elements) {
    const split = SplitText.create(element, {
      type: "lines",
      mask: "lines",
      linesClass: "line",
    });
    lines.push(...split.lines);
  }

  if (lines.length > 0) {
    gsap.set(lines, { yPercent: 100 });
  }

  return lines;
};

export function initAnimatedFooter(footer: HTMLElement) {
  const hands: HandInstance[] = [];
  const handWrappers = [
    ...footer.querySelectorAll<HTMLElement>(".footer-hand-img"),
  ];
  const loadCleanups: Array<() => void> = [];

  for (const image of footer.querySelectorAll<HTMLImageElement>(
    "img.ascii-hand"
  )) {
    const start = () => {
      hands.push(setupHand(image));
    };

    if (image.complete && image.naturalWidth > 0) {
      start();
    } else {
      image.addEventListener("load", start, { once: true });
      loadCleanups.push(() => image.removeEventListener("load", start));
    }
  }

  const headingChars = splitHeadingChars(footer);
  const contentLines = splitContentLines(footer);

  const revealEnd = getRevealEnd();
  const reveal = { left: -125, right: 125 };
  const pointer = { x: 0, y: 0 };
  const drift = { x: 0, y: 0 };

  const PARALLAX_STRENGTH = 20;
  const PARALLAX_EASE = 0.05;
  const parallaxScale = 1 + (PARALLAX_STRENGTH * 2) / 200;

  let parallaxEnabled = !isCompactLayout();

  const resetPointerMotion = () => {
    pointer.x = 0;
    pointer.y = 0;
    drift.x = 0;
    drift.y = 0;
  };

  const setPointerTarget = (clientX: number, clientY: number) => {
    if (!parallaxEnabled) {
      return;
    }

    const rect = footer.getBoundingClientRect();
    pointer.x =
      ((clientX - rect.left) / rect.width - 0.5) * PARALLAX_STRENGTH * 2;
    pointer.y =
      ((clientY - rect.top) / rect.height - 0.5) * PARALLAX_STRENGTH * 2;
  };

  let parallaxFrameId = 0;

  const renderParallax = () => {
    if (parallaxEnabled) {
      drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
      drift.y += (pointer.y - drift.y) * PARALLAX_EASE;
    }

    const scale = parallaxEnabled ? parallaxScale : 1;

    handWrappers.forEach((wrapper, index) => {
      const direction = index === 0 ? 1 : -1;
      const revealX = index === 0 ? reveal.left : reveal.right;
      const x = parallaxEnabled ? drift.x * direction : 0;
      const y = parallaxEnabled ? -drift.y : 0;
      wrapper.style.transform = `translate(calc(${x}px + ${revealX}%), ${y}px) scale(${scale})`;
    });

    parallaxFrameId = requestAnimationFrame(renderParallax);
  };

  renderParallax();

  const onMouseMove = (event: MouseEvent) => {
    if (!parallaxEnabled) {
      return;
    }

    setPointerTarget(event.clientX, event.clientY);
    for (const hand of hands) {
      hoverHand(hand, event.clientX, event.clientY);
    }
  };

  const compactQuery = window.matchMedia(COMPACT_BREAKPOINT);

  const syncParallaxEnabled = () => {
    const nextEnabled = !compactQuery.matches;
    if (nextEnabled === parallaxEnabled) {
      return;
    }

    parallaxEnabled = nextEnabled;

    if (parallaxEnabled) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      return;
    }

    window.removeEventListener("mousemove", onMouseMove);
    resetPointerMotion();
  };

  if (parallaxEnabled) {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
  }

  compactQuery.addEventListener("change", syncParallaxEnabled);

  const charStagger = { each: 0.04, from: "center" as const };

  const animateIn = () => {
    gsap.to(reveal, {
      left: revealEnd.left,
      right: revealEnd.right,
      duration: 1,
      ease: "power3.out",
      overwrite: true,
    });
    if (headingChars.length > 0) {
      gsap.to(headingChars, {
        yPercent: 0,
        duration: 1,
        ease: "power3.out",
        stagger: charStagger,
        overwrite: true,
      });
    }
    if (contentLines.length > 0) {
      gsap.to(contentLines, {
        yPercent: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
        overwrite: true,
      });
    }
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    reveal.left = revealEnd.left;
    reveal.right = revealEnd.right;
    gsap.set(headingChars, { yPercent: 0 });
    gsap.set(contentLines, { yPercent: 0 });
  } else {
    animateIn();
  }

  return () => {
    cancelAnimationFrame(parallaxFrameId);
    window.removeEventListener("mousemove", onMouseMove);
    compactQuery.removeEventListener("change", syncParallaxEnabled);
    for (const cleanup of loadCleanups) {
      cleanup();
    }
    for (const hand of hands) {
      hand.destroy();
    }
  };
}
