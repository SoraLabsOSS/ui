"use client";

import { cn } from "@workspace/ui/lib/utils";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "@/registry/ui/radix/button";

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

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  return useContext(DialogContext);
}

type DialogProps = ComponentProps<typeof DialogPrimitive.Root>;

/**
 * Root container for the Dialog component powered by Radix UI and Motion.
 */
function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: DialogProps) {
  const [open, setOpen] = useControlledState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: controlledOpen,
  });

  const contextValue = useMemo(
    () => ({ open: Boolean(open), setOpen }),
    [open, setOpen]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      <DialogPrimitive.Root
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
        {...props}
      >
        {children}
      </DialogPrimitive.Root>
    </DialogContext.Provider>
  );
}

type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>;

/**
 * Button or trigger element that opens the dialog.
 * Features Motion hover and tap scaling.
 */
function DialogTrigger({
  className,
  asChild,
  children,
  ...props
}: DialogTriggerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (asChild) {
    return (
      <DialogPrimitive.Trigger
        asChild
        className={className}
        data-slot="dialog-trigger"
        {...props}
      >
        {children}
      </DialogPrimitive.Trigger>
    );
  }

  return (
    <DialogPrimitive.Trigger
      asChild
      className={className}
      data-slot="dialog-trigger"
      {...props}
    >
      <motion.button
        data-primary-action
        type="button"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      >
        {children}
      </motion.button>
    </DialogPrimitive.Trigger>
  );
}

type DialogPortalProps = ComponentProps<typeof DialogPrimitive.Portal>;

/**
 * Portals dialog overlay and content to the document body.
 */
function DialogPortal({ ...props }: DialogPortalProps) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close>;

/**
 * Action button that dismisses the dialog.
 */
function DialogClose({
  className,
  asChild,
  children,
  ...props
}: DialogCloseProps) {
  const prefersReducedMotion = useReducedMotion();

  if (asChild) {
    return (
      <DialogPrimitive.Close
        asChild
        className={className}
        data-slot="dialog-close"
        {...props}
      >
        {children}
      </DialogPrimitive.Close>
    );
  }

  return (
    <DialogPrimitive.Close
      asChild
      className={className}
      data-slot="dialog-close"
      {...props}
    >
      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      >
        {children}
      </motion.button>
    </DialogPrimitive.Close>
  );
}

type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;

/**
 * Semi-transparent backdrop overlay behind the dialog with blur and fade transition.
 */
function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <DialogPrimitive.Overlay
      asChild
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-xs dark:bg-black/70",
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    >
      <motion.div
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.2, ease: "easeOut" }
        }
      />
    </DialogPrimitive.Overlay>
  );
}

interface DialogContentProps
  extends ComponentProps<typeof DialogPrimitive.Content> {
  /**
   * Additional CSS class name for the fixed container wrapper.
   */
  containerClassName?: string;
  /**
   * Additional CSS class name for the backdrop overlay.
   */
  overlayClassName?: string;
  /**
   * Whether to render the standard top-right close icon button.
   * @default true
   */
  showCloseButton?: boolean;
}

/**
 * Modal dialog content container with 1:1 Motion 3D perspective rotation and blur entrance/exit.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  overlayClassName,
  containerClassName,
  style,
  ...props
}: DialogContentProps) {
  const context = useDialogContext();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;

  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPrimitive.Portal forceMount>
          <DialogOverlay className={overlayClassName} />
          <div
            className={cn(
              "pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4",
              containerClassName
            )}
          >
            <DialogPrimitive.Content
              asChild
              className={cn(
                "pointer-events-auto relative grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl border border-border bg-background p-6 text-foreground text-sm shadow-2xl outline-none sm:max-w-lg",
                className
              )}
              data-slot="dialog-content"
              forceMount
              {...props}
            >
              <motion.div
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        filter: "blur(0px)",
                        rotateX: 0,
                        rotateY: 0,
                        z: 0,
                        transition: {
                          delay: 0.2,
                          duration: 0.5,
                          ease: [0.17, 0.67, 0.51, 1],
                          opacity: {
                            delay: 0.2,
                            duration: 0.5,
                            ease: "easeOut",
                          },
                        },
                      }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        filter: "blur(10px)",
                        z: -100,
                        rotateY: 25,
                        rotateX: 5,
                        transformPerspective: 500,
                        transition: {
                          duration: 0.3,
                          ease: [0.67, 0.17, 0.62, 0.64],
                        },
                      }
                }
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        filter: "blur(10px)",
                        z: -100,
                        rotateY: 25,
                        rotateX: 5,
                        transformPerspective: 500,
                      }
                }
                style={{
                  transformPerspective: 500,
                  transformStyle: "preserve-3d",
                  ...style,
                }}
              >
                {children}
                {showCloseButton && (
                  <DialogPrimitive.Close
                    aria-label="Close"
                    asChild
                    className="absolute top-4 right-4 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-70 transition-opacity hover:bg-muted hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
                    data-slot="dialog-close-button"
                  >
                    <motion.button
                      type="button"
                      whileHover={
                        prefersReducedMotion ? undefined : { scale: 1.1 }
                      }
                      whileTap={
                        prefersReducedMotion ? undefined : { scale: 0.95 }
                      }
                    >
                      <XIcon className="size-4" />
                      <span className="sr-only">Close</span>
                    </motion.button>
                  </DialogPrimitive.Close>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </div>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

/**
 * Header section containing dialog title and description.
 */
function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left",
        className
      )}
      data-slot="dialog-header"
      {...props}
    />
  );
}

interface DialogFooterProps extends ComponentProps<"div"> {
  /**
   * Whether to render a secondary close button inside the footer.
   * @default false
   */
  showCloseButton?: boolean;
}

/**
 * Footer section for dialog action buttons.
 */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      className={cn(
        "-mx-6 mt-2 -mb-6 flex flex-col-reverse gap-2 rounded-b-xl border-border border-t bg-muted/40 p-4 sm:flex-row sm:justify-end",
        className
      )}
      data-slot="dialog-footer"
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild data-slot="dialog-footer-close">
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;

/**
 * Accessible title heading for the dialog.
 */
function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "font-semibold text-foreground text-lg leading-none tracking-tight",
        className
      )}
      data-slot="dialog-title"
      {...props}
    />
  );
}

type DialogDescriptionProps = ComponentProps<
  typeof DialogPrimitive.Description
>;

/**
 * Accessible description explaining the purpose of the dialog.
 */
function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogOverlayProps,
  DialogPortalProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
};
export {
  Dialog,
  Dialog as RadixDialog,
  Dialog as default,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
