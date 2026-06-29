/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: Cursor targets use hover-only affordances. */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: Cursor targets are decorative hover zones. */

"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  motion,
  type SpringOptions,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import {
  type ComponentProps,
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type MotionDivAnimate = NonNullable<
  ComponentProps<typeof motion.div>["animate"]
>;

const DEFAULT_CURSOR_COLOR = "#ff4c24";

const CURSOR_EASE = [0.625, 0.05, 0, 1] as const;

const customCursorVariants = cva("relative select-none", {
  variants: {
    layout: {
      default: "",
      demo: "flex min-h-72 items-center justify-center",
    },
  },
  defaultVariants: {
    layout: "default",
  },
});

const customCursorTargetVariants = cva(
  "flex items-center justify-center text-foreground transition-opacity hover:opacity-80",
  {
    variants: {
      size: {
        sm: "size-10",
        md: "size-14",
        lg: "size-16",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

interface CustomCursorContextValue {
  setIsHovering: (isHovering: boolean) => void;
}

const CustomCursorContext = createContext<CustomCursorContextValue | null>(
  null
);

function useCustomCursorContext() {
  const context = useContext(CustomCursorContext);

  if (!context) {
    throw new Error(
      "CustomCursorTarget must be used within a CustomCursor provider."
    );
  }

  return context;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return `rgba(255, 76, 36, ${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function resolveCursorAppearance(
  isHovering: boolean,
  color: string
): MotionDivAnimate {
  if (!isHovering) {
    return {
      width: 16,
      height: 16,
      borderRadius: 9999,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
    };
  }

  return {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: hexToRgba(color, 0.3),
    borderColor: color,
    borderWidth: 1,
  };
}

function useCoarsePointer() {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");

    const update = () => {
      setIsCoarsePointer(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isCoarsePointer;
}

export interface CustomCursorProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">,
    VariantProps<typeof customCursorVariants> {
  children?: ReactNode;
  /** Cursor fill and border color. */
  color?: string;
  /** Spring damping for pointer follow. */
  followDamping?: number;
  /** Spring stiffness for pointer follow. */
  followStiffness?: number;
  /** Override spring options for pointer follow. */
  followTransition?: SpringOptions;
}

function CustomCursor({
  children,
  className,
  color = DEFAULT_CURSOR_COLOR,
  followDamping = 22,
  followStiffness = 150,
  followTransition,
  layout = "default",
  ...props
}: CustomCursorProps) {
  const prefersReducedMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springTransition = followTransition ?? {
    damping: followDamping,
    stiffness: followStiffness,
    mass: 0.8,
  };

  const springX = useSpring(cursorX, springTransition);
  const springY = useSpring(cursorY, springTransition);

  const contextValue = useMemo<CustomCursorContextValue>(
    () => ({
      setIsHovering,
    }),
    []
  );

  useEffect(() => {
    if (isCoarsePointer || prefersReducedMotion) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [cursorX, cursorY, isCoarsePointer, prefersReducedMotion]);

  const appearance = resolveCursorAppearance(isHovering, color);

  return (
    <CustomCursorContext.Provider value={contextValue}>
      <div
        className={cn(customCursorVariants({ layout, className }))}
        {...props}
      >
        {isCoarsePointer || prefersReducedMotion ? null : (
          <motion.div
            animate={appearance}
            aria-hidden="true"
            className="pointer-events-none fixed top-0 left-0 z-[100] border"
            initial={false}
            style={{
              x: springX,
              y: springY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            transition={{
              duration: 0.375,
              ease: CURSOR_EASE,
            }}
          />
        )}
        {children}
      </div>
    </CustomCursorContext.Provider>
  );
}

export interface CustomCursorTargetProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">,
    VariantProps<typeof customCursorTargetVariants> {
  children?: ReactNode;
}

function CustomCursorTarget({
  children,
  className,
  size,
  ...props
}: CustomCursorTargetProps) {
  const { setIsHovering } = useCustomCursorContext();

  return (
    <div
      className={cn(customCursorTargetVariants({ size, className }))}
      data-cursor=""
      onMouseEnter={() => {
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  CustomCursor,
  CustomCursorTarget,
  customCursorTargetVariants,
  customCursorVariants,
};
