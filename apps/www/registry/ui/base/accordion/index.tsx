"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";

type AccordionItemValue = string | number;

interface AccordionContextValue {
  disableAnimation: boolean;
  disabled: boolean;
  focusRingClassName?: string;
  focusRingLayoutId: string;
  multiple: boolean;
  openValues: AccordionItemValue[];
  setOpenValues: (values: AccordionItemValue[]) => void;
  showFocusRing: boolean;
  transition: Transition;
  variant?: "default" | "bordered" | "separated" | "ghost";
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "Accordion compound components must be used within an <Accordion>."
    );
  }
  return context;
}

interface AccordionItemContextValue {
  disabled: boolean;
  isFocused: boolean;
  isOpen: boolean;
  setIsFocused: (isFocused: boolean) => void;
  value: AccordionItemValue;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null
);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      "AccordionItem subcomponents must be used within an <AccordionItem>."
    );
  }
  return context;
}

const accordionVariants = cva("flex w-full flex-col", {
  variants: {
    variant: {
      default: "",
      bordered: "rounded-xl border border-border bg-card/40 p-2 shadow-xs",
      separated: "gap-2.5",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const accordionItemVariants = cva("relative transition-colors", {
  variants: {
    variant: {
      default: "border-border border-b not-last:border-b",
      bordered:
        "border-border/70 border-b not-last:border-b px-3 last:border-b-0",
      separated: "rounded-xl border border-border bg-card/60 px-4 shadow-xs",
      ghost: "rounded-lg px-3 hover:bg-muted/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const accordionTriggerVariants = cva(
  "group/accordion-trigger relative flex flex-1 select-none items-center justify-between py-4 text-left font-medium text-sm outline-none transition-all hover:underline focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        bordered: "py-3.5",
        separated: "py-3.5",
        ghost: "py-3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const DEFAULT_SPRING_TRANSITION: Transition = {
  type: "spring",
  bounce: 0.2,
  visualDuration: 0.4,
};

function normalizeValues(
  val?: AccordionItemValue | AccordionItemValue[]
): AccordionItemValue[] | undefined {
  if (val === undefined) {
    return;
  }
  if (Array.isArray(val)) {
    return val;
  }
  return [val];
}

interface AccordionProps
  extends Omit<
      ComponentProps<typeof AccordionPrimitive.Root>,
      "value" | "defaultValue" | "onValueChange"
    >,
    VariantProps<typeof accordionVariants> {
  /**
   * The initial expanded value(s) for uncontrolled mode.
   */
  defaultValue?: AccordionItemValue | AccordionItemValue[];
  /**
   * Whether to disable all motion physics and animations.
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Additional CSS classes for the animated focus ring.
   */
  focusRingClassName?: string;
  /**
   * Custom layoutId for the focus ring shared layout animation.
   */
  focusRingLayoutId?: string;
  /**
   * Event handler called when an accordion item expands or collapses.
   */
  onValueChange?: (
    value: AccordionItemValue[],
    eventDetails?: AccordionPrimitive.Root.ChangeEventDetails
  ) => void;
  /**
   * Whether to render the gliding animated focus ring on keyboard focus.
   * @default true
   */
  showFocusRing?: boolean;
  /**
   * Spring transition physics configuration for layout animations.
   * @default { type: "spring", bounce: 0.2, visualDuration: 0.4 }
   */
  transition?: Transition;
  /**
   * The controlled value of the item(s) that should be expanded.
   */
  value?: AccordionItemValue | AccordionItemValue[];
}

/**
 * Animated Accordion component built on Base UI with 1:1 Motion spring physics,
 * blur/mask transitions, gliding layoutId focus ring, and full shadcn/ui customizability.
 */
function Accordion({
  className,
  variant = "default",
  value: controlledValueProp,
  defaultValue: defaultValueProp,
  onValueChange,
  multiple = false,
  disabled = false,
  disableAnimation = false,
  transition = DEFAULT_SPRING_TRANSITION,
  showFocusRing = true,
  focusRingClassName,
  focusRingLayoutId: customFocusRingLayoutId,
  children,
  ...props
}: AccordionProps) {
  const generatedLayoutId = useId();
  const focusRingLayoutId =
    customFocusRingLayoutId ?? `accordion-focus-${generatedLayoutId}`;

  const normalizedDefaultValue = useMemo(
    () => normalizeValues(defaultValueProp) ?? [],
    [defaultValueProp]
  );
  const normalizedControlledValue = useMemo(
    () => normalizeValues(controlledValueProp),
    [controlledValueProp]
  );

  const [openValues, setOpenValues] = useControlledState<AccordionItemValue[]>({
    defaultValue: normalizedDefaultValue,
    onChange: (nextValues) => {
      onValueChange?.(
        nextValues,
        undefined as unknown as AccordionPrimitive.Root.ChangeEventDetails
      );
    },
    value: normalizedControlledValue,
  });

  const handleBaseUiValueChange = useCallback(
    (
      nextValues: AccordionItemValue[],
      eventDetails: AccordionPrimitive.Root.ChangeEventDetails
    ) => {
      setOpenValues(nextValues);
      onValueChange?.(nextValues, eventDetails);
    },
    [onValueChange, setOpenValues]
  );

  const contextValue = useMemo(
    () => ({
      openValues,
      setOpenValues,
      multiple: Boolean(multiple),
      disabled: Boolean(disabled),
      disableAnimation: Boolean(disableAnimation),
      transition,
      showFocusRing: Boolean(showFocusRing),
      focusRingClassName,
      focusRingLayoutId,
      variant: variant ?? "default",
    }),
    [
      openValues,
      setOpenValues,
      multiple,
      disabled,
      disableAnimation,
      transition,
      showFocusRing,
      focusRingClassName,
      focusRingLayoutId,
      variant,
    ]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <MotionConfig
        transition={disableAnimation ? { duration: 0 } : transition}
      >
        <AccordionPrimitive.Root
          className={cn(accordionVariants({ variant, className }))}
          data-slot="accordion"
          disabled={disabled}
          keepMounted
          multiple={multiple}
          onValueChange={handleBaseUiValueChange}
          value={openValues}
          {...props}
        >
          {children}
        </AccordionPrimitive.Root>
      </MotionConfig>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps
  extends ComponentProps<typeof AccordionPrimitive.Item> {
  /**
   * Additional CSS classes for the item container.
   */
  className?: string;
  /**
   * Unique value identifying this item.
   */
  value: AccordionItemValue;
}

/**
 * Individual expandable item within an Accordion.
 */
function AccordionItem({
  className,
  value,
  disabled = false,
  children,
  ...props
}: AccordionItemProps) {
  const { openValues, disabled: rootDisabled, variant } = useAccordionContext();
  const [isFocused, setIsFocused] = useState(false);
  const isOpen = openValues.includes(value);
  const isItemDisabled = disabled || rootDisabled;

  const itemContextValue = useMemo(
    () => ({
      value,
      isOpen,
      isFocused,
      setIsFocused,
      disabled: isItemDisabled,
    }),
    [value, isOpen, isFocused, isItemDisabled]
  );

  return (
    <AccordionItemContext.Provider value={itemContextValue}>
      <AccordionPrimitive.Item
        className={cn(accordionItemVariants({ variant, className }))}
        data-slot="accordion-item"
        data-state={isOpen ? "open" : "closed"}
        disabled={isItemDisabled}
        value={value}
        {...props}
      >
        {children}
      </AccordionPrimitive.Item>
    </AccordionItemContext.Provider>
  );
}

type AccordionHeaderProps = ComponentProps<typeof AccordionPrimitive.Header>;

/**
 * Accessible header container wrapping the accordion trigger button.
 */
function AccordionHeader({
  className,
  children,
  ...props
}: AccordionHeaderProps) {
  return (
    <AccordionPrimitive.Header
      className={cn("flex", className)}
      data-slot="accordion-header"
      {...props}
    >
      {children}
    </AccordionPrimitive.Header>
  );
}

interface AccordionTriggerProps
  extends ComponentProps<typeof AccordionPrimitive.Trigger> {
  /**
   * Custom chevron or trailing icon element.
   */
  chevron?: ReactNode;
  /**
   * Additional CSS class name for the chevron icon.
   */
  chevronClassName?: string;
  /**
   * Additional CSS class name for the animated focus ring.
   */
  focusRingClassName?: string;
  /**
   * Whether to hide the rotating chevron indicator.
   * @default false
   */
  hideChevron?: boolean;
  /**
   * Whether to display the focus ring on this trigger.
   * Inherits from root Accordion if not specified.
   */
  showFocusRing?: boolean;
}

/**
 * Interactive button that expands or collapses the accordion panel.
 * Features 1:1 Motion gliding focus ring, pressed spring tap, and smooth chevron rotation.
 */
function AccordionTrigger({
  className,
  children,
  chevron,
  chevronClassName,
  hideChevron = false,
  focusRingClassName: triggerFocusRingClassName,
  showFocusRing: triggerShowFocusRing,
  render,
  onFocus,
  onBlur,
  ...props
}: AccordionTriggerProps) {
  const {
    showFocusRing: rootShowFocusRing,
    focusRingClassName: rootFocusRingClassName,
    focusRingLayoutId,
    disableAnimation,
    transition,
    variant,
  } = useAccordionContext();
  const { isOpen, isFocused, setIsFocused, disabled } =
    useAccordionItemContext();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  const displayFocusRing = triggerShowFocusRing ?? rootShowFocusRing;
  const mergedFocusRingClassName =
    triggerFocusRingClassName ?? rootFocusRingClassName;

  const handleFocus = useCallback(
    (
      event: Parameters<
        NonNullable<
          ComponentProps<typeof AccordionPrimitive.Trigger>["onFocus"]
        >
      >[0]
    ) => {
      onFocus?.(event);
      if (event.target.matches(":focus-visible")) {
        setIsFocused(true);
      }
    },
    [onFocus, setIsFocused]
  );

  const handleBlur = useCallback(
    (
      event: Parameters<
        NonNullable<ComponentProps<typeof AccordionPrimitive.Trigger>["onBlur"]>
      >[0]
    ) => {
      onBlur?.(event);
      setIsFocused(false);
    },
    [onBlur, setIsFocused]
  );

  return (
    <AccordionHeader>
      <AccordionPrimitive.Trigger
        className={cn(accordionTriggerVariants({ variant, className }))}
        data-slot="accordion-trigger"
        data-state={isOpen ? "open" : "closed"}
        disabled={disabled}
        onBlur={handleBlur}
        onFocus={handleFocus}
        render={
          render ?? (
            <motion.button
              type="button"
              variants={
                shouldAnimate ? { pressed: { scale: 0.99 } } : undefined
              }
              whileTap={shouldAnimate ? "pressed" : undefined}
            />
          )
        }
        {...props}
      >
        <span className="relative z-10">{children}</span>

        {!hideChevron && (
          <span className="relative z-10 flex shrink-0 items-center">
            {chevron ?? (
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                className="pointer-events-none shrink-0"
                style={{ willChange: "transform" }}
                transition={shouldAnimate ? transition : { duration: 0 }}
              >
                <ChevronDownIcon
                  className={cn(
                    "size-4 text-muted-foreground transition-colors group-hover/accordion-trigger:text-foreground",
                    chevronClassName
                  )}
                  data-slot="accordion-trigger-icon"
                />
              </motion.div>
            )}
          </span>
        )}

        {displayFocusRing && isFocused && shouldAnimate && (
          <motion.div
            className={cn(
              "pointer-events-none absolute -inset-1 z-0 rounded-lg bg-accent/60 ring-2 ring-ring/50",
              mergedFocusRingClassName
            )}
            data-slot="accordion-focus-ring"
            layoutId={focusRingLayoutId}
            transition={{ type: "spring", visualDuration: 0.2, bounce: 0.2 }}
            variants={{ pressed: { scale: 0.98 } }}
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionHeader>
  );
}

const contentVariants = {
  open: {
    height: "auto",
    maskImage: "linear-gradient(to bottom, black 100%, transparent 100%)",
  },
  closed: {
    height: 0,
    maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
  },
};

const innerVariants = {
  open: {
    filter: "blur(0px)",
    opacity: 1,
  },
  closed: {
    filter: "blur(2px)",
    opacity: 0,
  },
};

const staticContentVariants = {
  open: { height: "auto" },
  closed: { height: 0 },
};

const staticInnerVariants = {
  open: { opacity: 1, filter: "none" },
  closed: { opacity: 0, filter: "none" },
};

interface AccordionContentProps
  extends ComponentProps<typeof AccordionPrimitive.Panel> {
  /**
   * Additional CSS classes for the inner wrapper element.
   */
  innerClassName?: string;
}

/**
 * Collapsible panel containing the accordion content.
 * Features 1:1 Motion height collapse, gradient mask fading, and blur transitions.
 */
function AccordionContent({
  className,
  innerClassName,
  children,
  ...props
}: AccordionContentProps) {
  const { disableAnimation, transition } = useAccordionContext();
  const { isOpen } = useAccordionItemContext();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      data-state={isOpen ? "open" : "closed"}
      hiddenUntilFound={false}
      keepMounted
      render={(panelProps) => {
        const { hidden: _hidden, ...restProps } = panelProps;
        return (
          <div
            className={cn("overflow-hidden text-sm", className)}
            {...restProps}
          />
        );
      }}
      {...props}
    >
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            animate="open"
            className="overflow-hidden"
            exit="closed"
            initial="closed"
            key="accordion-panel-content"
            transition={shouldAnimate ? transition : { duration: 0 }}
            variants={shouldAnimate ? contentVariants : staticContentVariants}
          >
            <motion.div
              animate="open"
              exit="closed"
              initial="closed"
              transition={shouldAnimate ? transition : { duration: 0 }}
              variants={shouldAnimate ? innerVariants : staticInnerVariants}
            >
              <div
                className={cn(
                  "pt-0 pb-4 text-muted-foreground text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
                  innerClassName
                )}
              >
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AccordionPrimitive.Panel>
  );
}

export type {
  AccordionContentProps,
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
};
export {
  Accordion,
  Accordion as BaseAccordion,
  Accordion as default,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  accordionItemVariants,
  accordionTriggerVariants,
  accordionVariants,
  useAccordionContext,
  useAccordionItemContext,
};
