"use client";

import { getMotionComponent } from "@workspace/ui/lib/get-motion-component";
import type { MotionProps } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type {
  ComponentType,
  ElementType,
  MouseEventHandler,
  ReactNode,
} from "react";

type MotionTextComponent = ComponentType<
  MotionProps & {
    children?: ReactNode;
    className?: string;
    onMouseEnter?: MouseEventHandler<Element>;
  }
>;

interface ScrambleFrame {
  revealedLength: number;
  text: string;
}

export type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: ElementType;
  className?: string;
  onMouseEnter?: MouseEventHandler<Element>;
  /**
   * Color for characters still scrambling. Revealed characters keep the root
   * text color (from `className` or `style`).
   */
  scrambleColor?: string;
  /**
   * Seconds to scramble in place before the left-to-right reveal begins.
   * @default 0
   */
  holdDuration?: number;
  /**
   * When true, runs the scramble on mount or when this value changes.
   * Ignored while `triggerOnHover` is true.
   * @default true
   */
  trigger?: boolean;
  /**
   * When true, runs the scramble on hover instead of on mount.
   * Mount `trigger` is skipped automatically.
   * @default false
   */
  triggerOnHover?: boolean;
  onScrambleComplete?: () => void;
} & Omit<MotionProps, "onMouseEnter">;

const defaultChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randomScrambleChar(characterSet: string): string {
  return characterSet[Math.floor(Math.random() * characterSet.length)] ?? "";
}

function buildScrambledText(
  source: string,
  revealedLength: number,
  characterSet: string
): string {
  let scrambled = "";

  for (let i = 0; i < source.length; i++) {
    if (source[i] === " ") {
      scrambled += " ";
      continue;
    }

    scrambled +=
      i < revealedLength ? source[i] : randomScrambleChar(characterSet);
  }

  return scrambled;
}

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = "p",
  scrambleColor,
  holdDuration = 0,
  trigger = true,
  triggerOnHover = false,
  onScrambleComplete,
  onMouseEnter,
  ...props
}: TextScrambleProps) {
  const MotionComponent = getMotionComponent(Component) as MotionTextComponent;
  const [frame, setFrame] = useState<ScrambleFrame | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const text = children;
  const shouldTriggerOnMount = trigger && !triggerOnHover;

  const clearAnimationInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const scramble = () => {
    if (isAnimating) {
      return;
    }

    clearAnimationInterval();
    setIsAnimating(true);

    const holdSteps = holdDuration / speed;
    const revealSteps = duration / speed;
    const totalSteps = holdSteps + revealSteps;
    let step = 0;

    intervalRef.current = setInterval(() => {
      if (step < holdSteps) {
        setFrame({
          text: buildScrambledText(text, 0, characterSet),
          revealedLength: 0,
        });
      } else {
        const revealStep = step - holdSteps;
        const progress = revealStep / revealSteps;
        const revealedLength = Math.floor(progress * text.length);

        setFrame({
          text: buildScrambledText(text, revealedLength, characterSet),
          revealedLength,
        });
      }

      step++;

      if (step > totalSteps) {
        clearAnimationInterval();
        setFrame(null);
        setIsAnimating(false);
        onScrambleComplete?.();
      }
    }, speed * 1000);
  };

  // oxlint-disable-next-line react-hooks/exhaustive-deps -- unmount cleanup only
  useEffect(
    () => () => {
      clearAnimationInterval();
    },
    []
  );

  /* oxlint-disable react-hooks/exhaustive-deps -- re-run only when mount trigger changes */
  useEffect(() => {
    if (!shouldTriggerOnMount) {
      return;
    }

    scramble();
  }, [shouldTriggerOnMount, trigger]);
  /* oxlint-enable react-hooks/exhaustive-deps */

  const handleMouseEnter: MouseEventHandler<Element> = (event) => {
    onMouseEnter?.(event);

    if (triggerOnHover) {
      scramble();
    }
  };

  const renderContent = () => {
    if (!frame) {
      return children;
    }

    if (!scrambleColor) {
      return frame.text;
    }

    return frame.text.split("").map((char, index) => (
      <span
        // oxlint-disable-next-line react/no-array-index-key, react-doctor/no-array-index-as-key -- static string indices per frame
        key={index}
        style={
          index < frame.revealedLength ? undefined : { color: scrambleColor }
        }
      >
        {char}
      </span>
    ));
  };

  return (
    <MotionComponent
      aria-label={frame ? text : undefined}
      className={className}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {renderContent()}
    </MotionComponent>
  );
}
