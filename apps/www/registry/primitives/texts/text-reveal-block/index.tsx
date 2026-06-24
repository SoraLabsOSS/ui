"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  useRef,
} from "react";

gsap.registerPlugin(SplitText, ScrollTrigger);

export type TextRevealBlockDirection = "down" | "left" | "right" | "up";

interface DirectionConfig {
  axis: "scaleX" | "scaleY";
  enterOrigin: string;
  exitOrigin: string;
}

const DIRECTION_CONFIG = {
  down: {
    axis: "scaleY",
    enterOrigin: "bottom center",
    exitOrigin: "top center",
  },
  left: {
    axis: "scaleX",
    enterOrigin: "left center",
    exitOrigin: "right center",
  },
  right: {
    axis: "scaleX",
    enterOrigin: "right center",
    exitOrigin: "left center",
  },
  up: {
    axis: "scaleY",
    enterOrigin: "top center",
    exitOrigin: "bottom center",
  },
} as const satisfies Record<TextRevealBlockDirection, DirectionConfig>;

export interface TextRevealBlockProps {
  /** When true, each line plays once when the block enters the viewport. */
  animateOnScroll?: boolean;
  /** HTML tag when using the `text` prop. */
  as?: keyof React.JSX.IntrinsicElements;
  /** Color of the wipe block. */
  blockColor?: string;
  children?: ReactNode;
  /** Class name for the element created from `text` + `as`. */
  className?: string;
  /** Delay before the first line starts, in seconds. */
  delay?: number;
  /** Wipe travel direction for each line. */
  direction?: TextRevealBlockDirection;
  /** Duration of each wipe phase, in seconds. */
  duration?: number;
  /** Delay between each line, in seconds. */
  stagger?: number;
  /** Plain-text alternative to `children`. */
  text?: string;
}

interface LineSetup {
  blocks: HTMLDivElement[];
  lines: Element[];
  splits: SplitText[];
}

interface AnimationOptions {
  animateOnScroll: boolean;
  blockColor: string;
  container: HTMLElement;
  delay: number;
  direction: TextRevealBlockDirection;
  duration: number;
  stagger: number;
}

const CATALOG_PREVIEW_SCROLL_SELECTOR = "[data-radix-scroll-area-viewport]";
const HOME_PAGE_SCROLL_SELECTOR = "#home-page";

function resolveScrollRoot(container: HTMLElement): Element | Window {
  const catalogScroller = container.closest(CATALOG_PREVIEW_SCROLL_SELECTOR);
  if (catalogScroller) {
    return catalogScroller;
  }

  const homeScroller =
    container.closest(HOME_PAGE_SCROLL_SELECTOR) ??
    document.querySelector(HOME_PAGE_SCROLL_SELECTOR);

  if (homeScroller instanceof HTMLElement) {
    return homeScroller;
  }

  return window;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref && typeof ref === "object") {
    (ref as { current: T | null }).current = value;
  }
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      assignRef(ref, node);
    }
  };
}

/** Single element suitable for cloneElement; skips whitespace text nodes. */
function getCloneableChild(node: ReactNode): ReactElement | null {
  if (isValidElement(node)) {
    return node;
  }

  let found: ReactElement | null = null;
  let count = 0;

  Children.forEach(node, (child) => {
    if (child == null || child === false) {
      return;
    }

    if (typeof child === "string" && child.trim() === "") {
      return;
    }

    if (isValidElement(child)) {
      count += 1;
      found = child;
      return;
    }

    count += 1;
  });

  return count === 1 ? found : null;
}

function restoreWrappers(container: HTMLElement) {
  const wrappers = container.querySelectorAll(".text-reveal-block-line");

  for (const wrapper of wrappers) {
    const firstChild = wrapper.firstChild;

    if (wrapper.parentNode && firstChild) {
      wrapper.parentNode.insertBefore(firstChild, wrapper);
      wrapper.remove();
    }
  }
}

function createCleanup(container: HTMLElement, setup: LineSetup) {
  return () => {
    for (const split of setup.splits) {
      split.revert();
    }
    restoreWrappers(container);
  };
}

function setupLineReveal(
  container: HTMLElement,
  blockColor: string
): LineSetup {
  const splits: SplitText[] = [];
  const lines: Element[] = [];
  const blocks: HTMLDivElement[] = [];

  const elements = container.hasAttribute("data-text-reveal-block-wrapper")
    ? Array.from(container.children)
    : [container];

  for (const element of elements) {
    const split = SplitText.create(element, {
      type: "lines",
      linesClass: "block-line++",
      lineThreshold: 0.1,
    });

    splits.push(split);

    for (const line of split.lines) {
      const parent = line.parentNode;
      if (!parent) {
        continue;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "text-reveal-block-line";
      wrapper.style.position = "relative";
      wrapper.style.display = "block";
      wrapper.style.width = "max-content";
      wrapper.style.maxWidth = "100%";
      wrapper.style.overflow = "hidden";

      parent.insertBefore(wrapper, line);
      wrapper.appendChild(line);

      const lineElement = line as HTMLElement;
      lineElement.style.position = "relative";
      lineElement.style.display = "block";

      const block = document.createElement("div");
      block.className = "text-reveal-block-wipe";
      block.style.position = "absolute";
      block.style.top = "0";
      block.style.left = "0";
      block.style.width = "101%";
      block.style.height = "101%";
      block.style.pointerEvents = "none";
      block.style.willChange = "transform";
      block.style.zIndex = "1";
      block.style.backgroundColor = blockColor;

      wrapper.appendChild(block);

      lines.push(line);
      blocks.push(block);
    }
  }

  return { splits, lines, blocks };
}

function createBlockRevealTimeline(
  block: HTMLDivElement,
  line: Element,
  index: number,
  delay: number,
  stagger: number,
  duration: number,
  direction: TextRevealBlockDirection
) {
  const { axis, exitOrigin } = DIRECTION_CONFIG[direction];

  const tl = gsap.timeline({
    delay: delay + index * stagger,
  });

  tl.to(block, {
    [axis]: 1,
    duration,
    ease: "power4.inOut",
  });
  tl.set(line, { opacity: 1 });
  tl.set(block, {
    transformOrigin: exitOrigin,
  });
  tl.to(block, {
    [axis]: 0,
    duration,
    ease: "power4.inOut",
  });

  return tl;
}

function runLineRevealAnimations(
  options: AnimationOptions,
  setup: LineSetup
): ScrollTrigger[] {
  const { animateOnScroll, container, delay, direction, duration, stagger } =
    options;
  const { axis, enterOrigin } = DIRECTION_CONFIG[direction];
  const scrollTriggers: ScrollTrigger[] = [];

  gsap.set(setup.lines, { opacity: 0 });
  gsap.set(setup.blocks, {
    [axis]: 0,
    transformOrigin: enterOrigin,
  });

  for (const [index, block] of setup.blocks.entries()) {
    const line = setup.lines[index];
    if (!line) {
      continue;
    }

    const timeline = createBlockRevealTimeline(
      block,
      line,
      index,
      delay,
      stagger,
      duration,
      direction
    );

    if (animateOnScroll) {
      timeline.pause();
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: container,
          scroller: resolveScrollRoot(container),
          start: "top 90%",
          once: true,
          onEnter: () => {
            timeline.play();
          },
        })
      );
    }
  }

  if (scrollTriggers.length > 0) {
    ScrollTrigger.refresh();
  }

  return scrollTriggers;
}

function initTextRevealBlock(options: AnimationOptions) {
  const setup = setupLineReveal(options.container, options.blockColor);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(setup.lines, { opacity: 1 });
    gsap.set(setup.blocks, { display: "none" });
    return {
      cleanup: createCleanup(options.container, setup),
      scrollTriggers: [] as ScrollTrigger[],
    };
  }

  const scrollTriggers = runLineRevealAnimations(options, setup);

  return {
    cleanup: createCleanup(options.container, setup),
    scrollTriggers,
  };
}

export function TextRevealBlock({
  children,
  text,
  as: Component = "p",
  className,
  animateOnScroll = true,
  delay = 0,
  blockColor = "var(--foreground)",
  direction = "left",
  stagger = 0.15,
  duration = 0.75,
}: TextRevealBlockProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  const resolvedChild =
    children ?? (text ? createElement(Component, { className }, text) : null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const { cleanup, scrollTriggers } = initTextRevealBlock({
        animateOnScroll,
        blockColor,
        container,
        delay,
        direction,
        duration,
        stagger,
      });

      return () => {
        for (const trigger of scrollTriggers) {
          trigger.kill();
        }
        cleanup();
      };
    },
    {
      scope: containerRef,
      dependencies: [
        animateOnScroll,
        delay,
        blockColor,
        direction,
        stagger,
        duration,
      ],
    }
  );

  if (!resolvedChild) {
    return null;
  }

  const child = getCloneableChild(resolvedChild);

  if (child) {
    return cloneElement(child as ReactElement<{ ref?: Ref<HTMLElement> }>, {
      ref: mergeRefs(
        containerRef,
        (child as ReactElement<{ ref?: Ref<HTMLElement> }>).props.ref
      ),
    });
  }

  return (
    <div
      data-text-reveal-block-wrapper="true"
      ref={containerRef as Ref<HTMLDivElement>}
    >
      {resolvedChild}
    </div>
  );
}

export default TextRevealBlock;
