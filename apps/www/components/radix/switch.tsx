"use client";

import { cn } from "@workspace/ui/lib/utils";
import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { Switch as SwitchPrimitives } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

type SwitchProps = ComponentProps<typeof SwitchPrimitives.Root> &
  HTMLMotionProps<"button"> & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    thumbIcon?: ReactNode;
  };

function Switch({
  className,
  leftIcon,
  rightIcon,
  thumbIcon,
  onCheckedChange,
  ...props
}: SwitchProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isChecked, setIsChecked] = useState(
    props?.checked ?? props?.defaultChecked ?? false
  );
  const [isTapped, setIsTapped] = useState(false);

  useEffect(() => {
    if (props?.checked !== undefined) {
      setIsChecked(props.checked);
    }
  }, [props?.checked]);

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      setIsChecked(checked);
      onCheckedChange?.(checked);
    },
    [onCheckedChange]
  );

  return (
    <SwitchPrimitives.Root
      {...props}
      asChild
      onCheckedChange={handleCheckedChange}
    >
      <motion.button
        className={cn(
          "relative flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:justify-start data-[state=checked]:justify-end data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className
        )}
        data-slot="switch"
        initial={false}
        onTap={() => setIsTapped(false)}
        onTapCancel={() => setIsTapped(false)}
        onTapStart={() => setIsTapped(true)}
        whileTap={prefersReducedMotion ? undefined : "tap"}
        {...props}
      >
        {leftIcon && (
          <motion.div
            animate={
              isChecked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
            }
            className="absolute top-1/2 left-1 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 [&_svg]:size-3"
            data-slot="switch-left-icon"
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", bounce: 0 }
            }
          >
            {leftIcon}
          </motion.div>
        )}

        {rightIcon && (
          <motion.div
            animate={
              isChecked ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }
            }
            className="absolute top-1/2 right-1 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 [&_svg]:size-3"
            data-slot="switch-right-icon"
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", bounce: 0 }
            }
          >
            {rightIcon}
          </motion.div>
        )}

        <SwitchPrimitives.Thumb asChild>
          <motion.div
            animate={
              !prefersReducedMotion && isTapped
                ? { width: 21, transition: { duration: 0.1 } }
                : { width: 18, transition: { duration: 0.1 } }
            }
            className={cn(
              "relative z-[1] flex items-center justify-center rounded-full bg-background text-neutral-500 shadow-lg ring-0 dark:text-neutral-400 [&_svg]:size-3"
            )}
            data-slot="switch-thumb"
            layout={!prefersReducedMotion}
            style={{
              width: 18,
              height: 18,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 25 }
            }
            whileTap={prefersReducedMotion ? undefined : "tab"}
          >
            {thumbIcon}
          </motion.div>
        </SwitchPrimitives.Thumb>
      </motion.button>
    </SwitchPrimitives.Root>
  );
}

export { Switch, type SwitchProps };
