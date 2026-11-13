"use client";

import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";
import { useId } from "react";

/**
 * Spring animation parameters for the switch thumb layout transition.
 */
const SWITCH_SPRING = {
  type: "spring",
  stiffness: 500,
  damping: 30,
} as const;

const switchVariants = cva(
  "peer group/switch focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input data-checked:bg-primary data-unchecked:bg-input dark:data-[state=unchecked]:bg-input/80 dark:data-unchecked:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 transition-colors outline-none select-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-checked:justify-end data-disabled:cursor-not-allowed data-disabled:opacity-50 data-unchecked:justify-start data-[state=checked]:justify-end data-[state=unchecked]:justify-start",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        default: "h-6 w-11",
        lg: "h-7 w-13",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const switchThumbVariants = cva(
  "bg-background data-[state=checked]:bg-primary-foreground data-checked:bg-primary-foreground dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground pointer-events-none relative flex items-center justify-center rounded-full shadow-xs ring-0 select-none [&_svg]:size-3",
  {
    variants: {
      size: {
        sm: "size-3.5 text-[10px]",
        default: "size-4.5 text-xs",
        lg: "size-5.5 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface SwitchProps
  extends
    Omit<
      React.ComponentProps<typeof SwitchPrimitive.Root>,
      "asChild" | "children"
    >,
    VariantProps<typeof switchVariants> {
  /**
   * Optional icon rendered in the track when checked (left side).
   */
  checkedIcon?: React.ReactNode;
  /**
   * Optional helper description rendered beneath the label.
   */
  description?: React.ReactNode;
  /**
   * Additional CSS classes for the description text.
   */
  descriptionClassName?: string;
  /**
   * Optional label text rendered beside the switch.
   */
  label?: React.ReactNode;
  /**
   * Additional CSS classes for the label text.
   */
  labelClassName?: string;
  /**
   * Position of the label relative to the switch.
   * @default "right"
   */
  labelPosition?: "left" | "right";
  /**
   * Additional CSS classes for the thumb element.
   */
  thumbClassName?: string;
  /**
   * Optional icon or node rendered inside the moving thumb.
   */
  thumbIcon?: React.ReactNode;
  /**
   * Optional icon rendered in the track when unchecked (right side).
   */
  uncheckedIcon?: React.ReactNode;
}

/**
 * An accessible, highly customizable Switch component built with Radix UI and Motion.
 * Features spring layout physics (`stiffness: 500, damping: 30`) and full Tailwind CSS override support.
 */
function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  size = "default",
  thumbIcon,
  checkedIcon,
  uncheckedIcon,
  label,
  description,
  labelPosition = "right",
  className,
  thumbClassName,
  labelClassName,
  descriptionClassName,
  id,
  ref,
  disabled = false,
  style,
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-desc` : undefined;

  const [isChecked, setIsChecked] = useControlledState({
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
    value: controlledChecked,
  });

  const prefersReducedMotion = useReducedMotion();

  const control = (
    <SwitchPrimitive.Root
      aria-describedby={descriptionId}
      checked={isChecked}
      className={cn(switchVariants({ size }), className)}
      data-size={size}
      data-slot="switch"
      disabled={disabled}
      id={inputId}
      onCheckedChange={setIsChecked}
      onMouseDown={(e) => {
        if (e.detail > 1) {
          e.preventDefault();
        }
        props.onMouseDown?.(e);
      }}
      ref={ref}
      style={{
        justifyContent: isChecked ? "flex-end" : "flex-start",
        ...style,
      }}
      {...props}
    >
      {checkedIcon && (
        <motion.span
          animate={
            isChecked ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
          }
          aria-hidden="true"
          className="text-primary-foreground pointer-events-none absolute left-1 flex items-center justify-center [&_svg]:size-3"
          initial={false}
          transition={
            prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }
          }
        >
          {checkedIcon}
        </motion.span>
      )}

      {uncheckedIcon && (
        <motion.span
          animate={
            isChecked ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }
          }
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute right-1 flex items-center justify-center [&_svg]:size-3"
          initial={false}
          transition={
            prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }
          }
        >
          {uncheckedIcon}
        </motion.span>
      )}

      <SwitchPrimitive.Thumb
        asChild
        className={cn(switchThumbVariants({ size }), thumbClassName)}
        data-slot="switch-thumb"
      >
        <motion.span
          layout={!prefersReducedMotion}
          transition={prefersReducedMotion ? { duration: 0 } : SWITCH_SPRING}
        >
          {thumbIcon}
        </motion.span>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );

  if (
    (label === null || label === undefined) &&
    (description === null || description === undefined)
  ) {
    return control;
  }

  const labelContent = (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          className={cn(
            "cursor-pointer text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            disabled && "cursor-not-allowed opacity-50",
            labelClassName
          )}
          htmlFor={inputId}
        >
          {label}
        </label>
      )}
      {description && (
        <p
          className={cn(
            "text-muted-foreground text-xs leading-normal select-none",
            disabled && "opacity-50",
            descriptionClassName
          )}
          id={descriptionId}
        >
          {description}
        </p>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3",
        labelPosition === "left" && "flex-row-reverse justify-end"
      )}
    >
      {control}
      {labelContent}
    </div>
  );
}

export type { SwitchProps };
export { SWITCH_SPRING, Switch, switchThumbVariants, switchVariants };
