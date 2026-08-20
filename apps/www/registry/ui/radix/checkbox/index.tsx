"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";

function useControlledState<T, Rest extends unknown[] = []>(props: {
  defaultValue?: T;
  onChange?: (value: T, ...args: Rest) => void;
  value?: T;
}): readonly [T, (next: T, ...args: Rest) => void] {
  const { value, defaultValue, onChange } = props;
  const [state, setInternalState] = useState<T>(
    value === undefined ? (defaultValue as T) : value
  );

  useEffect(() => {
    if (value !== undefined) {
      setInternalState(value);
    }
  }, [value]);

  const setState = useCallback(
    (next: T, ...args: Rest) => {
      setInternalState(next);
      onChange?.(next, ...args);
    },
    [onChange]
  );

  return [state, setState] as const;
}

interface CheckboxCheckIconProps
  extends Omit<ComponentProps<"svg">, "children"> {
  /** Whether the checkbox checkmark is active. */
  checked: boolean;
  /** Whether reduced motion is enabled. */
  prefersReducedMotion?: boolean | null;
}

/**
 * Checkmark SVG icon featuring animated path length draw with dynamic round cap transform.
 */
function CheckboxCheckIcon({
  checked,
  className,
  prefersReducedMotion,
  ...props
}: CheckboxCheckIconProps) {
  const pathLength = useMotionValue(checked ? 1 : 0);
  const strokeLinecap = useTransform(() =>
    pathLength.get() === 0 ? "none" : "round"
  );

  return (
    <svg
      aria-hidden="true"
      className={cn("size-3.5 stroke-current", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      viewBox="0 0 24 24"
      {...props}
    >
      <motion.path
        animate={{ pathLength: checked ? 1 : 0 }}
        d="M4 12L10 18L20 6"
        style={
          {
            pathLength,
            strokeLinecap,
          } as ComponentProps<typeof motion.path>["style"]
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                type: "spring",
                bounce: 0,
                duration: checked ? 0.3 : 0.1,
              }
        }
      />
    </svg>
  );
}

type CheckboxRootProps = ComponentProps<typeof CheckboxPrimitive.Root>;

/**
 * Primitive root button for the checkbox component, wrapping Radix UI's Checkbox.Root with Motion interaction states.
 * Supports full Tailwind CSS class overriding via `cn(...)`.
 */
function CheckboxRoot({ className, ...props }: CheckboxRootProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <CheckboxPrimitive.Root
      asChild
      className={cn(
        "peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-input outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 group-has-[:focus-visible]/field-label:not-data-[state=checked]:border-input group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aria-invalid:data-[state=checked]:border-primary group-has-[:focus-visible]/field-label:data-[state=checked]:border-primary dark:bg-input/30 dark:data-[state=checked]:bg-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="checkbox"
      {...props}
    >
      <motion.button
        data-primary-action
        type="button"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      />
    </CheckboxPrimitive.Root>
  );
}

type CheckboxIndicatorProps = ComponentProps<
  typeof CheckboxPrimitive.Indicator
> & {
  /** Whether the checkbox is currently checked */
  checked?: boolean;
};

/**
 * Animated checkmark indicator for the checkbox using Motion path length animation.
 */
function CheckboxIndicator({
  className,
  checked = false,
  ...props
}: CheckboxIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <CheckboxPrimitive.Indicator
      className={cn(
        "grid place-content-center text-current transition-none [&>svg]:size-3.5",
        className
      )}
      data-slot="checkbox-indicator"
      forceMount
      {...props}
    >
      <CheckboxCheckIcon
        checked={checked}
        className={className}
        prefersReducedMotion={prefersReducedMotion}
      />
    </CheckboxPrimitive.Indicator>
  );
}

interface CheckboxProps extends CheckboxRootProps {
  /**
   * Optional class name for the animated checkmark SVG indicator.
   */
  indicatorClassName?: string;
  /**
   * Optional label rendered beside the checkbox (wraps both in a `<label>`).
   */
  label?: ReactNode;
  /**
   * Optional class name for the outer label wrapper.
   */
  labelClassName?: string;
}

/**
 * An accessible, stylable animated Checkbox component built with Radix UI and Motion for React.
 * Supports full Tailwind CSS class overrides just like shadcn/ui.
 */
function Checkbox({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  label,
  labelClassName,
  indicatorClassName,
  className,
  id,
  disabled,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const [isChecked, setIsChecked] = useControlledState({
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
    value: controlledChecked,
  });

  const prefersReducedMotion = useReducedMotion();
  const isCheckedBool = Boolean(isChecked && isChecked !== "indeterminate");

  const control = (
    <CheckboxPrimitive.Root
      asChild
      checked={isChecked}
      className={cn(
        "peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-input outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 group-has-[:focus-visible]/field-label:not-data-[state=checked]:border-input group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aria-invalid:data-[state=checked]:border-primary group-has-[:focus-visible]/field-label:data-[state=checked]:border-primary dark:bg-input/30 dark:data-[state=checked]:bg-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="checkbox"
      disabled={disabled}
      id={inputId}
      onCheckedChange={setIsChecked}
      {...props}
    >
      <motion.button
        data-primary-action
        type="button"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      >
        <CheckboxPrimitive.Indicator forceMount>
          <CheckboxCheckIcon
            checked={isCheckedBool}
            className={indicatorClassName}
            prefersReducedMotion={prefersReducedMotion}
          />
        </CheckboxPrimitive.Indicator>
      </motion.button>
    </CheckboxPrimitive.Root>
  );

  if (label == null) {
    return control;
  }

  return (
    <div className="inline-flex items-center gap-2.5">
      {control}
      <label
        className={cn(
          "cursor-pointer select-none font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          disabled && "cursor-not-allowed opacity-50",
          labelClassName
        )}
        htmlFor={inputId}
      >
        {label}
      </label>
    </div>
  );
}

export type {
  CheckboxCheckIconProps,
  CheckboxIndicatorProps,
  CheckboxProps,
  CheckboxRootProps,
};
export {
  Checkbox,
  Checkbox as RadixCheckbox,
  Checkbox as default,
  CheckboxCheckIcon,
  CheckboxIndicator,
  CheckboxRoot,
};
