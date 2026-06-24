"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  type AnimationSequence,
  useAnimate,
  useReducedMotion,
} from "motion/react";
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { useAutoHeight } from "@/registry/hooks/use-auto-height";

const EXPO_IN_OUT = [0.87, 0, 0.13, 1] as const;
const POWER2_IN_OUT = [0.45, 0, 0.55, 1] as const;

type IconMode = "rotate" | "fade" | "both";
type DisabledBreakpoint = "mobile" | "tablet" | "desktop";
type AccordionEase = readonly [number, number, number, number];

const DISABLE_MEDIA: Record<DisabledBreakpoint, string> = {
  mobile: "(max-width: 479px)",
  tablet: "(max-width: 991px)",
  desktop: "(min-width: 992px)",
};

interface AccordionContextValue {
  allowMultiple: boolean;
  animationsPaused: boolean;
  defaultDuration: number;
  defaultEase: AccordionEase;
  defaultIconRotation: number;
  disabledOn?: DisabledBreakpoint[];
  iconMode: IconMode;
  notifyItemOpen: (id: string) => void;
  registerItem: (id: string, close: () => void) => void;
  unregisterItem: (id: string) => void;
}

interface AccordionItemContextValue {
  contentId: string;
  contentPanelRef: RefObject<HTMLElement | null>;
  iconRef: RefObject<SVGSVGElement | null>;
  isDisabled: boolean;
  isOpen: boolean;
  setPanelHeight: (height: number) => void;
  toggle: () => void;
  triggerId: string;
  verticalBarRef: RefObject<SVGPathElement | null>;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null
);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within <Accordion>.");
  }
  return context;
}

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      "Accordion subcomponents must be used within <AccordionItem>."
    );
  }
  return context;
}

function useDisabledOn(disabledOn?: DisabledBreakpoint[]) {
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!disabledOn?.length) {
      setDisabled(false);
      return;
    }

    const mediaQueries = disabledOn.map((breakpoint) =>
      window.matchMedia(DISABLE_MEDIA[breakpoint])
    );

    const update = () => {
      setDisabled(mediaQueries.some((mediaQuery) => mediaQuery.matches));
    };

    update();

    for (const mediaQuery of mediaQueries) {
      mediaQuery.addEventListener("change", update);
    }

    return () => {
      for (const mediaQuery of mediaQueries) {
        mediaQuery.removeEventListener("change", update);
      }
    };
  }, [disabledOn]);

  return disabled;
}

const accordionVariants = cva("flex w-full flex-col");

const accordionItemVariants = cva("border-border border-b last:border-b-0");

const accordionTriggerVariants = cva([
  "flex w-full items-center justify-between gap-4 border-0 bg-transparent py-5 text-left",
  "cursor-pointer text-muted-foreground transition-colors duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
  "will-change-transform [transform:translateZ(0)] hover:text-foreground",
  "focus:outline-none focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#fd551d] focus-visible:outline-offset-4",
  "data-[state=open]:text-foreground",
]);

const accordionTitleVariants = cva(
  "m-0 font-medium text-base text-inherit leading-[1.4]"
);

const accordionContentVariants = cva(
  "overflow-hidden will-change-[height] [transform:translateZ(0)]"
);

const accordionTextVariants = cva(
  "m-0 pb-5 text-muted-foreground text-sm leading-[1.6]"
);

export interface AccordionItemData {
  content: ReactNode;
  defaultOpen?: boolean;
  id?: string;
  title: string;
}

export interface AccordionProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">,
    VariantProps<typeof accordionVariants> {
  allowMultiple?: boolean;
  children?: ReactNode;
  /**
   * Disable accordion animations on matching breakpoints.
   * Mirrors `data-anm-disable` on the sandbox section.
   */
  disabledOn?: DisabledBreakpoint[];
  duration?: number;
  ease?: AccordionEase;
  iconMode?: IconMode;
  iconRotation?: number;
  items?: AccordionItemData[];
}

export interface AccordionItemProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  children: ReactNode;
  defaultOpen?: boolean;
  delay?: number;
  disabledOn?: DisabledBreakpoint[];
  duration?: number;
  ease?: AccordionEase;
  iconRotation?: number;
  onClose?: () => void;
  onOpen?: () => void;
}

export interface AccordionTriggerProps
  extends ComponentPropsWithoutRef<"button"> {
  children: ReactNode;
  hideIcon?: boolean;
}

export interface AccordionContentProps
  extends ComponentPropsWithoutRef<"section"> {
  children: ReactNode;
}

export interface AccordionTextProps
  extends Omit<ComponentPropsWithoutRef<"p">, "children"> {
  children: string;
}

function renderAccordionItemContent(content: ReactNode) {
  if (typeof content === "string") {
    return <AccordionText>{content}</AccordionText>;
  }

  return content;
}

function Accordion({
  allowMultiple = false,
  children,
  className,
  disabledOn,
  duration = 0.8,
  ease = EXPO_IN_OUT,
  iconMode = "both",
  iconRotation = -180,
  items,
  ...props
}: AccordionProps) {
  const itemsRef = useRef(new Map<string, () => void>());
  const [animationsPaused, setAnimationsPaused] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setAnimationsPaused(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const registerItem = useCallback((id: string, close: () => void) => {
    itemsRef.current.set(id, close);
  }, []);

  const unregisterItem = useCallback((id: string) => {
    itemsRef.current.delete(id);
  }, []);

  const notifyItemOpen = useCallback(
    (id: string) => {
      if (allowMultiple) {
        return;
      }

      for (const [itemId, close] of itemsRef.current.entries()) {
        if (itemId !== id) {
          close();
        }
      }
    },
    [allowMultiple]
  );

  return (
    <AccordionContext.Provider
      value={{
        allowMultiple,
        animationsPaused,
        defaultDuration: duration,
        defaultEase: ease,
        defaultIconRotation: iconRotation,
        disabledOn,
        iconMode,
        notifyItemOpen,
        registerItem,
        unregisterItem,
      }}
    >
      <div
        className={cn(accordionVariants(), className)}
        data-anm-accordion=""
        data-anm-allow-multiple={allowMultiple ? "true" : "false"}
        {...props}
      >
        {items?.map((item, index) => (
          <AccordionItem
            defaultOpen={item.defaultOpen}
            key={item.id ?? item.title ?? index}
          >
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>
              {renderAccordionItemContent(item.content)}
            </AccordionContent>
          </AccordionItem>
        ))}
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  children,
  className,
  defaultOpen = false,
  delay = 0,
  disabledOn: itemDisabledOn,
  duration: itemDuration,
  ease: itemEase,
  iconRotation: itemIconRotation,
  onClose,
  onOpen,
  ...props
}: AccordionItemProps) {
  const {
    animationsPaused,
    defaultDuration,
    defaultEase,
    defaultIconRotation,
    disabledOn: sectionDisabledOn,
    iconMode,
    notifyItemOpen,
    registerItem,
    unregisterItem,
  } = useAccordionContext();

  const itemId = useId();
  const triggerId = `${itemId}-trigger`;
  const contentId = `${itemId}-content`;
  const itemRef = useRef<HTMLDivElement>(null);
  const contentPanelRef = useRef<HTMLElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const verticalBarRef = useRef<SVGPathElement>(null);
  const [, animate] = useAnimate();
  const animationRef = useRef<{ stop: () => void } | null>(null);
  const hasAppliedInitialOpen = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [panelHeight, setPanelHeight] = useState(0);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const sectionAnimationsDisabled = useDisabledOn(sectionDisabledOn);
  const itemAnimationsDisabled = useDisabledOn(itemDisabledOn);
  const animationsDisabled =
    sectionAnimationsDisabled || itemAnimationsDisabled;

  const duration = itemDuration ?? defaultDuration;
  const ease = itemEase ?? defaultEase;
  const iconRotation = itemIconRotation ?? defaultIconRotation;

  const close = useCallback(() => {
    isOpenRef.current = false;
    setIsOpen(false);
  }, []);

  useEffect(() => {
    registerItem(itemId, close);
    return () => unregisterItem(itemId);
  }, [close, itemId, registerItem, unregisterItem]);

  const dispatchItemEvent = useCallback(
    (type: "anm-accordion-open" | "anm-accordion-close") => {
      const node = itemRef.current;
      const content = contentPanelRef.current;
      if (!node) {
        return;
      }

      node.dispatchEvent(
        new CustomEvent(type, {
          bubbles: true,
          detail: { item: node, content },
        })
      );
    },
    []
  );

  const toggle = useCallback(() => {
    if (isOpenRef.current) {
      onClose?.();
      dispatchItemEvent("anm-accordion-close");
      close();
      return;
    }

    notifyItemOpen(itemId);
    onOpen?.();
    dispatchItemEvent("anm-accordion-open");
    isOpenRef.current = true;
    setIsOpen(true);
  }, [close, dispatchItemEvent, itemId, notifyItemOpen, onClose, onOpen]);

  const clearIconInlineStyles = useCallback(() => {
    iconRef.current?.style.removeProperty("transform");
    verticalBarRef.current?.style.removeProperty("opacity");
  }, []);

  const applyStaticPanelState = useCallback(
    (open: boolean, height: number) => {
      const panel = contentPanelRef.current;
      const icon = iconRef.current;
      const vertical = verticalBarRef.current;
      if (!panel) {
        return;
      }

      panel.style.height = open ? `${height}px` : "0px";

      if (icon) {
        const rotateIcon = iconMode === "rotate" || iconMode === "both";
        icon.style.transform =
          rotateIcon && open ? `rotate(${iconRotation}deg)` : "rotate(0deg)";
      }

      if (vertical && (iconMode === "fade" || iconMode === "both")) {
        vertical.style.opacity = open ? "0" : "1";
      }
    },
    [iconMode, iconRotation]
  );

  const toInstantSequence = useCallback(
    (sequence: AnimationSequence): AnimationSequence =>
      sequence.map((segment) => {
        const [element, keyframes, options] = segment as [
          Element,
          Record<string, unknown>,
          { at?: number; duration?: number; ease?: AccordionEase },
        ];

        return [element, keyframes, { ...options, duration: 0, at: 0 }];
      }) as AnimationSequence,
    []
  );

  const buildPanelSequence = useCallback(
    (open: boolean): AnimationSequence | null => {
      const panel = contentPanelRef.current;
      const icon = iconRef.current;
      const vertical = verticalBarRef.current;
      if (!panel) {
        return null;
      }

      const rotateIcon = iconMode === "rotate" || iconMode === "both";
      const fadeVertical =
        (iconMode === "fade" || iconMode === "both") && vertical;

      if (open) {
        const openSequence: AnimationSequence = [
          [
            panel,
            { height: `${panelHeight}px` },
            { duration, ease, at: delay },
          ],
        ];

        if (rotateIcon && icon) {
          openSequence.push([
            icon,
            { rotate: iconRotation },
            { duration, ease, at: delay },
          ]);
        }

        if (fadeVertical) {
          openSequence.push([
            vertical,
            { opacity: 0 },
            {
              duration: duration * 0.5,
              ease: POWER2_IN_OUT,
              at: delay + duration * 0.25,
            },
          ]);
        }

        return openSequence;
      }

      const closeSequence: AnimationSequence = [];

      if (fadeVertical) {
        closeSequence.push([
          vertical,
          { opacity: 1 },
          { duration: duration * 0.5, ease: POWER2_IN_OUT, at: delay },
        ]);
      }

      if (rotateIcon && icon) {
        closeSequence.push([
          icon,
          { rotate: 0 },
          { duration, ease, at: delay },
        ]);
      }

      closeSequence.push([panel, { height: 0 }, { duration, ease, at: delay }]);
      return closeSequence;
    },
    [delay, duration, ease, iconMode, iconRotation, panelHeight]
  );

  useEffect(() => {
    animationRef.current?.stop();

    if (animationsDisabled || shouldReduceMotion) {
      applyStaticPanelState(isOpen, panelHeight);
      return;
    }

    if (animationsPaused) {
      return;
    }

    if (defaultOpen && isOpen && !hasAppliedInitialOpen.current) {
      if (panelHeight > 0) {
        hasAppliedInitialOpen.current = true;
        const openSequence = buildPanelSequence(true);
        if (openSequence) {
          clearIconInlineStyles();
          animationRef.current = animate(toInstantSequence(openSequence));
        }
      }
      return;
    }

    if (isOpen && panelHeight === 0) {
      return;
    }

    const sequence = buildPanelSequence(isOpen);
    if (!sequence) {
      return;
    }

    clearIconInlineStyles();
    animationRef.current = animate(sequence);
  }, [
    animate,
    animationsPaused,
    applyStaticPanelState,
    buildPanelSequence,
    clearIconInlineStyles,
    defaultOpen,
    animationsDisabled,
    isOpen,
    panelHeight,
    shouldReduceMotion,
    toInstantSequence,
  ]);

  return (
    <AccordionItemContext.Provider
      value={{
        contentId,
        contentPanelRef,
        iconRef,
        isDisabled: animationsDisabled,
        isOpen,
        setPanelHeight,
        toggle,
        triggerId,
        verticalBarRef,
      }}
    >
      <div
        className={cn(accordionItemVariants(), className)}
        data-anm-accordion-item
        data-state={isOpen ? "open" : "closed"}
        ref={itemRef}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({
  children,
  className,
  disabled,
  hideIcon = false,
  onClick,
  ...props
}: AccordionTriggerProps) {
  const {
    contentId,
    iconRef,
    isDisabled,
    isOpen,
    toggle,
    triggerId,
    verticalBarRef,
  } = useAccordionItemContext();
  const isTriggerDisabled = Boolean(disabled || isDisabled);

  return (
    <button
      {...props}
      aria-controls={contentId}
      aria-expanded={isOpen}
      className={cn(accordionTriggerVariants(), className)}
      data-anm-accordion-trigger
      data-state={isOpen ? "open" : "closed"}
      disabled={isTriggerDisabled}
      id={triggerId}
      onClick={(event) => {
        onClick?.(event);
        if (!(event.defaultPrevented || isTriggerDisabled)) {
          toggle();
        }
      }}
      type="button"
    >
      <span className={accordionTitleVariants()}>{children}</span>
      {hideIcon ? null : (
        <svg
          aria-hidden="true"
          className="size-4 shrink-0 text-current will-change-transform [transform:translateZ(0)]"
          data-anm-accordion-icon
          fill="none"
          ref={iconRef}
          viewBox="0 0 16 16"
        >
          <path
            d="M8 1V15"
            data-anm-accordion-icon-vertical
            ref={verticalBarRef}
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={2}
          />
          <path
            d="M1 8H15"
            data-anm-accordion-icon-horizontal
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={2}
          />
        </svg>
      )}
    </button>
  );
}

function AccordionContent({
  children,
  className,
  style,
  ...props
}: AccordionContentProps) {
  const { contentId, contentPanelRef, isOpen, setPanelHeight, triggerId } =
    useAccordionItemContext();
  const { ref, height } = useAutoHeight<HTMLDivElement>([children, isOpen]);

  useEffect(() => {
    setPanelHeight(height);
  }, [height, setPanelHeight]);

  return (
    <section
      {...props}
      aria-hidden={!isOpen}
      aria-labelledby={triggerId}
      className={cn(accordionContentVariants(), className)}
      data-anm-accordion-content=""
      id={contentId}
      ref={contentPanelRef}
      style={{ ...style, height: 0 }}
    >
      <div ref={ref}>{children}</div>
    </section>
  );
}

function AccordionText({ children, className, ...props }: AccordionTextProps) {
  return (
    <p
      className={cn(accordionTextVariants(), "accordion_text", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export type { AccordionEase, DisabledBreakpoint, IconMode };
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionText,
  AccordionTrigger,
  accordionContentVariants,
  accordionItemVariants,
  accordionTextVariants,
  accordionTitleVariants,
  accordionTriggerVariants,
  accordionVariants,
};
