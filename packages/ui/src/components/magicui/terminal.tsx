"use client";

import { cn } from "@workspace/ui/lib/utils";
import { type MotionProps, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface AnimatedSpanProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedSpan = ({
  children,
  delay = 0,
  className,
  ...props
}: AnimatedSpanProps) => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className={cn("grid font-normal text-sm tracking-tight", className)}
    initial={{ opacity: 0, y: -5 }}
    transition={{ duration: 0.3, delay: delay / 1000 }}
    {...props}
  >
    {children}
  </motion.div>
);

interface TypingAnimationProps extends MotionProps {
  as?: React.ElementType;
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export const TypingAnimation = ({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = "span",
  ...props
}: TypingAnimationProps) => {
  if (typeof children !== "string") {
    throw new Error("TypingAnimation: children must be a string. Received:");
  }

  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const [displayedText, setDisplayedText] = useState<string>("Typing...");
  const [started, setStarted] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) {
      return;
    }

    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [children, duration, started]);

  return (
    <MotionComponent
      className={cn("font-normal text-sm tracking-tight", className)}
      ref={elementRef}
      {...props}
    >
      {displayedText}
    </MotionComponent>
  );
};

interface TerminalProps {
  children: React.ReactNode;
  className?: string;
  inView?: boolean;
}

export const Terminal = ({ children, className }: TerminalProps) => (
  <div
    className={cn(
      "z-0 h-full w-full max-w-lg rounded-xl border border-border bg-background",
      className
    )}
  >
    <div className="flex h-11 items-center justify-start gap-y-2 rounded-t-[13px] bg-muted px-4">
      <div className="flex flex-row gap-x-2">
        <div className="size-2.5 rounded-full bg-red-500" />
        <div className="size-2.5 rounded-full bg-yellow-500" />
        <div className="size-2.5 rounded-full bg-green-500" />
      </div>
    </div>
    <pre className="size-full overflow-auto p-4">
      <code className="grid gap-y-1">{children}</code>
    </pre>
  </div>
);
