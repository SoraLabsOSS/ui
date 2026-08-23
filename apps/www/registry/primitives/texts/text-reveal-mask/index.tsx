/** biome-ignore-all lint/suspicious/noArrayIndexKey: Split indices are stable for static text. */

"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  motion,
  type UseInViewOptions,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  type ElementType,
  isValidElement,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SplitBy = "lines" | "words" | "chars";

const SPLIT_DEFAULTS: Record<SplitBy, { duration: number; stagger: number }> = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 },
};

const EXPO_OUT = [0.19, 1, 0.22, 1] as const;

const WHITESPACE_RE = /\s+/;

interface WordToken {
  emphasized: boolean;
  text: string;
}

interface LineCharUnit {
  char: string;
  emphasized: boolean;
  staggerIndex: number;
}

export interface MaskedTextRevealProps {
  /**
   * HTML tag for the container element.
   * @default "p"
   */
  as?: keyof React.JSX.IntrinsicElements;
  /** Rich text content. Supports inline emphasis elements such as `<strong>`. */
  children?: ReactNode;
  className?: string;
  /**
   * Delay before the first unit starts animating, in seconds.
   * @default 0
   */
  delay?: number;
  /**
   * Duration of each unit's animation in seconds.
   */
  duration?: number;
  /**
   * Trigger the animation only once.
   * @default true
   */
  once?: boolean;
  /**
   * Split mode: line-by-line, word-by-word, or character-by-character.
   * @default "lines"
   */
  splitBy?: SplitBy;
  /**
   * Delay between each successive unit in seconds.
   */
  stagger?: number;
  /** Plain-text alternative to `children`. */
  text?: string;
  /**
   * Additional className applied to each animated unit.
   */
  unitClassName?: string;
  /**
   * Viewport margin that controls when the animation triggers.
   * Triggers when the element reaches the top 75% of the viewport by default.
   * @default "0px 0px -25% 0px"
   */
  viewportMargin?: UseInViewOptions["margin"];
  /**
   * Initial vertical offset as a percentage of the unit height.
   * @default 110
   */
  yPercent?: number;
}

function collectWords(node: ReactNode, emphasized = false): WordToken[] {
  if (typeof node === "string") {
    return node
      .split(WHITESPACE_RE)
      .filter(Boolean)
      .map((text) => ({ text, emphasized }));
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => collectWords(child, emphasized));
  }

  if (isValidElement(node)) {
    const nextEmphasis =
      emphasized || node.type === "strong" || node.type === "b";
    return collectWords(
      (node.props as { children?: ReactNode }).children,
      nextEmphasis
    );
  }

  return [];
}

function getContentNode(
  text: string | undefined,
  children: ReactNode
): ReactNode {
  if (text) {
    return text;
  }

  return children;
}

function getAccessibleLabel(words: WordToken[]): string {
  return words.map((word) => word.text).join(" ");
}

type LineGroup = number[];

function groupWordsByLine(measureNode: HTMLDivElement): LineGroup[] {
  const measureWords = measureNode.querySelectorAll("[data-measure-word]");
  if (measureWords.length === 0) {
    return [[0]];
  }

  const groups: LineGroup[] = [];
  let currentGroup: LineGroup = [];
  let lastTop = -1;

  for (const [index, node] of measureWords.entries()) {
    const top = (node as HTMLElement).offsetTop;
    if (lastTop !== -1 && top > lastTop + 1) {
      groups.push(currentGroup);
      currentGroup = [];
    }
    currentGroup.push(index);
    lastTop = top;
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups.length > 0 ? groups : [[0]];
}

function resolveContainerWidth(container: HTMLElement): number {
  if (container.clientWidth > 0) {
    return container.clientWidth;
  }

  const parent = container.parentElement;
  if (parent && parent.clientWidth > 0) {
    return parent.clientWidth;
  }

  return 0;
}

function useLineGroups(
  words: WordToken[],
  className: string | undefined,
  containerRef: RefObject<HTMLDivElement | null>
) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [lineGroups, setLineGroups] = useState<LineGroup[] | null>(null);

  const measurementKey = `${className ?? ""}:${words
    .map((word) => `${word.emphasized ? "1" : "0"}:${word.text}`)
    .join("\u0000")}`;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Remeasure when text, width, or typography changes.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const measureNode = measureRef.current;
    if (!(container && measureNode)) {
      return;
    }

    let cancelled = false;

    const measureLines = () => {
      if (cancelled) {
        return;
      }

      const width = resolveContainerWidth(container);
      if (width > 0) {
        measureNode.style.width = `${width}px`;
      }

      setLineGroups(groupWordsByLine(measureNode));
    };

    measureLines();
    document.fonts.ready.then(measureLines);

    const resizeObserver = new ResizeObserver(measureLines);
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [containerRef, measurementKey]);

  const measureLayer = (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none invisible fixed top-0 left-[-9999px] block [overflow-wrap:break-word] [word-wrap:break-word]",
        className
      )}
      ref={measureRef}
    >
      {words.map((word, index) => (
        <span
          className={cn(
            "split-word inline-block [backface-visibility:hidden]",
            index < words.length - 1 && "me-[0.25em]",
            word.emphasized && "font-medium text-foreground"
          )}
          data-measure-word
          key={index}
        >
          {word.text}
        </span>
      ))}
    </div>
  );

  return { lineGroups, measureLayer };
}

function renderWordContent(word: WordToken, unitClassName?: string) {
  if (word.emphasized) {
    return <strong className={unitClassName}>{word.text}</strong>;
  }

  return word.text;
}

function SplitLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "split-line block overflow-hidden [backface-visibility:hidden]",
        className
      )}
    >
      {children}
    </span>
  );
}

function RevealTarget({
  animate,
  children,
  className,
  delay: unitDelay,
  display = "inline-block",
  duration: unitDuration,
  yPercent,
}: {
  animate: boolean;
  children: ReactNode;
  className?: string;
  delay: number;
  display?: "block" | "inline-block";
  duration: number;
  yPercent: number;
}) {
  const hiddenY = `${yPercent}%`;

  return (
    <motion.span
      animate={animate ? { y: "0%" } : { y: hiddenY }}
      className={cn(
        "will-change-transform [backface-visibility:hidden]",
        display === "block" ? "block" : "inline-block",
        className
      )}
      initial={{ y: hiddenY }}
      transition={{
        duration: unitDuration,
        delay: unitDelay,
        ease: EXPO_OUT,
      }}
    >
      {children}
    </motion.span>
  );
}

function WordSpan({
  isLastWord,
  word,
  unitClassName,
}: {
  isLastWord: boolean;
  word: WordToken;
  unitClassName?: string;
}) {
  return (
    <span
      className={cn(
        "split-word inline-block [backface-visibility:hidden]",
        !isLastWord && "me-[0.25em]"
      )}
    >
      {renderWordContent(word, unitClassName)}
    </span>
  );
}

export function MaskedTextReveal({
  text,
  children,
  as: Tag = "p",
  splitBy = "lines",
  duration,
  stagger,
  yPercent = 110,
  delay = 0,
  once = true,
  viewportMargin = "0px 0px -25% 0px",
  className,
  unitClassName,
}: MaskedTextRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(rootRef, { once, margin: viewportMargin });

  const content = getContentNode(text, children);
  const words = useMemo(() => collectWords(content), [content]);
  const accessibleLabel = useMemo(() => getAccessibleLabel(words), [words]);

  const defaults = SPLIT_DEFAULTS[splitBy];
  const resolvedDuration = duration ?? defaults.duration;
  const resolvedStagger = stagger ?? defaults.stagger;

  const { lineGroups, measureLayer } = useLineGroups(words, className, rootRef);

  const wordStaggerMap = useMemo(() => {
    const groups = lineGroups ?? [];
    const map = new Map<number, number>();
    let index = 0;

    for (const group of groups) {
      for (const wordIndex of group) {
        map.set(wordIndex, index);
        index++;
      }
    }

    return map;
  }, [lineGroups]);

  const lineCharGroups = useMemo(() => {
    const groups = lineGroups ?? [];
    let globalStagger = 0;

    return groups.map((group) => {
      const lineChars: LineCharUnit[] = [];

      for (const [index, wordIndex] of group.entries()) {
        const word = words[wordIndex];
        if (!word) {
          continue;
        }

        for (const char of word.text) {
          lineChars.push({
            char,
            emphasized: word.emphasized,
            staggerIndex: globalStagger,
          });
          globalStagger++;
        }

        if (index < group.length - 1) {
          lineChars.push({
            char: " ",
            emphasized: false,
            staggerIndex: globalStagger,
          });
          globalStagger++;
        }
      }

      return lineChars;
    });
  }, [lineGroups, words]);

  const Component = Tag as ElementType;
  const isReady = lineGroups !== null && lineGroups.length > 0;
  const hasContent = words.length > 0;
  const shouldAnimate = isInView && isReady && !prefersReducedMotion;

  if (prefersReducedMotion) {
    return (
      <div className="w-full" ref={rootRef}>
        <Component className={className}>{content}</Component>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="w-full" ref={rootRef}>
        <Component className={className}>{content}</Component>
      </div>
    );
  }

  const rootClassName = cn(
    "overflow-wrap-anywhere block [contain:layout_style_paint] [overflow-wrap:break-word] [transform:translateZ(0)] [will-change:transform] [word-wrap:break-word]",
    !isReady && "invisible",
    className
  );

  const lineContent =
    isReady &&
    lineGroups.map((group, lineIndex) => (
      <SplitLine key={lineIndex}>
        <RevealTarget
          animate={shouldAnimate}
          delay={delay + lineIndex * resolvedStagger}
          display="block"
          duration={resolvedDuration}
          yPercent={yPercent}
        >
          {group.map((wordIndex) => {
            const word = words[wordIndex];
            if (!word) {
              return null;
            }

            return (
              <WordSpan
                isLastWord={wordIndex === words.length - 1}
                key={wordIndex}
                unitClassName={unitClassName}
                word={word}
              />
            );
          })}
        </RevealTarget>
      </SplitLine>
    ));

  const wordContent =
    isReady &&
    lineGroups.map((group, lineIndex) => (
      <SplitLine key={lineIndex}>
        {group.map((wordIndex) => {
          const word = words[wordIndex];
          if (!word) {
            return null;
          }

          return (
            <RevealTarget
              animate={shouldAnimate}
              className={cn(
                "split-word",
                wordIndex < words.length - 1 && "me-[0.25em]",
                unitClassName
              )}
              delay={
                delay + (wordStaggerMap.get(wordIndex) ?? 0) * resolvedStagger
              }
              duration={resolvedDuration}
              key={wordIndex}
              yPercent={yPercent}
            >
              {renderWordContent(word)}
            </RevealTarget>
          );
        })}
      </SplitLine>
    ));

  const charContent =
    isReady &&
    lineCharGroups.map((group, lineIndex) => (
      <SplitLine key={lineIndex}>
        {group.map((token, charIndex) => (
          <RevealTarget
            animate={shouldAnimate}
            className={cn(
              "split-char",
              token.emphasized && "font-medium text-foreground",
              unitClassName
            )}
            delay={delay + token.staggerIndex * resolvedStagger}
            duration={resolvedDuration}
            key={charIndex}
            yPercent={yPercent}
          >
            {token.char === " " ? "\u00A0" : token.char}
          </RevealTarget>
        ))}
      </SplitLine>
    ));

  let splitContent = charContent;
  if (splitBy === "lines") {
    splitContent = lineContent;
  } else if (splitBy === "words") {
    splitContent = wordContent;
  }

  return (
    <div className="relative w-full" ref={rootRef}>
      {measureLayer}
      <Component aria-label={accessibleLabel} className={rootClassName}>
        {splitContent}
      </Component>
    </div>
  );
}
