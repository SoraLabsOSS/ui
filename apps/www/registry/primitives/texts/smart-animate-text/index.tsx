"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, useSpring, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

const DEFAULT_STAGGER_DELAY = 0.04;

interface SmartAnimateTextProps {
  className?: string;
  digitClassName?: string;
  direction?: "dynamic" | "up" | "down";
  enterBlur?: number;
  enterDamping?: number;
  enterScale?: number;
  enterStiffness?: number;
  enterY?: number;
  gap?: number;
  staggerDelay?: number;
  value: string;
}

interface CharacterItem {
  char: string;
  isAnimatable: boolean;
  key: string;
}

function getCharacterItems(value: string): CharacterItem[] {
  let digitPlace = 0;

  return value
    .split("")
    .map((char, index) => ({
      char,
      index,
      isDigit: /\d/.test(char),
      isLetter: /\p{L}/u.test(char),
    }))
    .reverse()
    .map(({ char, index, isDigit, isLetter }) => {
      if (isDigit) {
        const key = `digit-${digitPlace}`;
        digitPlace += 1;

        return {
          key,
          char,
          isAnimatable: true,
        };
      }

      if (isLetter) {
        return {
          key: `letter-${index}`,
          char,
          isAnimatable: true,
        };
      }

      return {
        key: `symbol-${char}-${index}`,
        char,
        isAnimatable: false,
      };
    })
    .reverse();
}

function DigitCell({
  char,
  isAnimatable,
  animateOnMount,
  enterDirection,
  animationDelay,
  className,
  enterStiffness = 170,
  enterDamping = 10,
  enterY = 32,
  enterBlur = 52,
  enterScale = 0.7,
}: {
  char: string;
  isAnimatable: boolean;
  animateOnMount: boolean;
  enterDirection: "up" | "down";
  animationDelay: number;
  className?: string;
  enterStiffness?: number;
  enterDamping?: number;
  enterY?: number;
  enterBlur?: number;
  enterScale?: number;
}) {
  const prevCharRef = useRef(char);
  const isFirstRender = useRef(true);

  const springConfig = { stiffness: enterStiffness, damping: enterDamping };
  const y = useSpring(0, springConfig);
  const opacity = useSpring(1, springConfig);
  const scale = useSpring(1, springConfig);
  const blur = useSpring(0, springConfig);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  useLayoutEffect(() => {
    if (!isAnimatable) {
      return;
    }

    const prev = prevCharRef.current;
    prevCharRef.current = char;

    const animateIn = () => {
      y.set(0);
      opacity.set(1);
      scale.set(1);
      blur.set(0);
    };
    const startAnimation = () => {
      if (animationDelay <= 0) {
        animateIn();
        return;
      }

      return setTimeout(animateIn, animationDelay * 1000);
    };

    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (animateOnMount) {
        y.jump(enterDirection === "up" ? enterY : -enterY);
        opacity.jump(0);
        scale.jump(enterScale);
        blur.jump(enterBlur);

        timeout = startAnimation();
      }
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }

    if (char === prev) {
      return;
    }

    y.jump(enterDirection === "up" ? enterY : -enterY);
    opacity.jump(0);
    scale.jump(enterScale);
    blur.jump(enterBlur);

    timeout = startAnimation();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [
    char,
    isAnimatable,
    animationDelay,
    enterY,
    enterBlur,
    enterScale,
    y,
    opacity,
    scale,
    blur,
    animateOnMount,
    enterDirection,
  ]);

  if (!isAnimatable) {
    return (
      <motion.span
        className={className}
        layout
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        {char}
      </motion.span>
    );
  }

  return (
    <motion.div
      className={cn(
        "relative grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1",
        className
      )}
      layout
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <motion.span style={{ opacity, scale, filter, y }}>{char}</motion.span>
    </motion.div>
  );
}

function SmartAnimateText({
  value,
  gap = 2,
  className,
  digitClassName,
  staggerDelay = DEFAULT_STAGGER_DELAY,
  enterStiffness,
  enterDamping,
  direction,
  enterY,
  enterBlur,
  enterScale,
}: SmartAnimateTextProps) {
  const hasMounted = useRef(false);
  const previousValue = useRef(value);
  const characters = useMemo(() => getCharacterItems(value), [value]);
  const previousCharacters = getCharacterItems(previousValue.current);
  const previousCharacterMap = new Map(
    previousCharacters.map((character) => [character.key, character])
  );
  const animatedCharacterIndexes = new Map<string, number>();
  let animatedCharacterCount = 0;

  for (const character of characters) {
    const previousCharacter = previousCharacterMap.get(character.key);
    const shouldAnimate =
      hasMounted.current &&
      character.isAnimatable &&
      previousCharacter?.char !== character.char;

    if (!shouldAnimate) {
      continue;
    }

    animatedCharacterIndexes.set(character.key, animatedCharacterCount);
    animatedCharacterCount += 1;
  }

  const numericValue = Number(value);
  const previousNumericValue = Number(previousValue.current);
  const dynamicDirection =
    Number.isFinite(numericValue) && Number.isFinite(previousNumericValue)
      ? numericValue < previousNumericValue
        ? "down"
        : "up"
      : "up";
  const enterDirection =
    direction === "up" || direction === "down" ? direction : dynamicDirection;

  useEffect(() => {
    hasMounted.current = true;
    previousValue.current = value;
  }, [value]);

  return (
    <motion.div
      className={cn("flex items-center tabular-nums", className)}
      layout
      style={{ gap }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      {characters.map(({ key, char, isAnimatable }) => (
        <DigitCell
          animateOnMount={hasMounted.current}
          animationDelay={
            (animatedCharacterIndexes.get(key) ?? 0) * staggerDelay
          }
          char={char}
          className={digitClassName}
          enterBlur={enterBlur}
          enterDamping={enterDamping}
          enterDirection={enterDirection}
          enterScale={enterScale}
          enterStiffness={enterStiffness}
          enterY={enterY}
          isAnimatable={isAnimatable}
          key={key}
        />
      ))}
    </motion.div>
  );
}

export { SmartAnimateText, type SmartAnimateTextProps };
