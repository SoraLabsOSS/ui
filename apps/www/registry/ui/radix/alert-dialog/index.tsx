"use client";

import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { type ComponentProps, createContext, useContext, useMemo } from "react";
import { Button } from "@/registry/ui/radix/button";

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function useAlertDialogContext() {
  return useContext(AlertDialogContext);
}

type AlertDialogProps = ComponentProps<typeof AlertDialogPrimitive.Root>;

/**
 * Root container for the Alert Dialog component powered by Radix UI and Motion.
 */
function AlertDialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: AlertDialogProps) {
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
    <AlertDialogContext.Provider value={contextValue}>
      <AlertDialogPrimitive.Root
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Root>
    </AlertDialogContext.Provider>
  );
}

type AlertDialogTriggerProps = ComponentProps<
  typeof AlertDialogPrimitive.Trigger
>;

/**
 * Trigger element that opens the alert dialog.
 * Features Motion hover and tap scaling.
 */
function AlertDialogTrigger({
  className,
  asChild,
  children,
  ...props
}: AlertDialogTriggerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (asChild) {
    return (
      <AlertDialogPrimitive.Trigger
        asChild
        className={className}
        data-slot="alert-dialog-trigger"
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Trigger>
    );
  }

  return (
    <AlertDialogPrimitive.Trigger
      asChild
      className={className}
      data-slot="alert-dialog-trigger"
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
    </AlertDialogPrimitive.Trigger>
  );
}

type AlertDialogPortalProps = ComponentProps<
  typeof AlertDialogPrimitive.Portal
>;

/**
 * Portals alert dialog overlay and content to the document body.
 */
function AlertDialogPortal({ ...props }: AlertDialogPortalProps) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

type AlertDialogOverlayProps = ComponentProps<
  typeof AlertDialogPrimitive.Overlay
>;

/**
 * Semi-transparent backdrop overlay behind the alert dialog with blur and fade transition.
 */
function AlertDialogOverlay({
  className,
  asChild,
  children,
  ...props
}: AlertDialogOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  if (asChild) {
    return (
      <AlertDialogPrimitive.Overlay
        asChild
        className={cn(
          "fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-xs dark:bg-black/70",
          className
        )}
        data-slot="alert-dialog-overlay"
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Overlay>
    );
  }

  return (
    <AlertDialogPrimitive.Overlay
      asChild
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-xs dark:bg-black/70",
        className
      )}
      data-slot="alert-dialog-overlay"
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
    </AlertDialogPrimitive.Overlay>
  );
}

type AlertDialogViewportProps = ComponentProps<"div">;

/**
 * Optional scroll viewport wrapper for overflowing alert dialog content.
 */
function AlertDialogViewport({
  className,
  ...props
}: AlertDialogViewportProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4",
        className
      )}
      data-slot="alert-dialog-viewport"
      {...props}
    />
  );
}

interface AlertDialogContentProps
  extends ComponentProps<typeof AlertDialogPrimitive.Content> {
  /**
   * Additional CSS class name for the fixed container wrapper.
   */
  containerClassName?: string;
  /**
   * Additional CSS class name for the backdrop overlay.
   */
  overlayClassName?: string;
  /**
   * Whether to render an optional top-right close icon button.
   * @default false
   */
  showCloseButton?: boolean;
  /**
   * Layout sizing variant of the alert dialog popup.
   * @default "default"
   */
  size?: "default" | "sm";
}

/**
 * Modal alert dialog content container with Motion 3D perspective rotation and blur entrance/exit animations.
 */
function AlertDialogContent({
  className,
  children,
  size = "default",
  showCloseButton = false,
  overlayClassName,
  containerClassName,
  asChild,
  style,
  ...props
}: AlertDialogContentProps) {
  const context = useAlertDialogContext();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;

  return (
    <AnimatePresence>
      {isOpen && (
        <AlertDialogPrimitive.Portal forceMount>
          <AlertDialogOverlay className={overlayClassName} />
          <div
            className={cn(
              "pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4",
              containerClassName
            )}
          >
            <AlertDialogPrimitive.Content
              asChild
              className={cn(
                "group/alert-dialog-content pointer-events-auto relative grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl border border-border bg-background p-6 text-foreground text-sm shadow-2xl outline-none data-[size=sm]:max-w-xs data-[size=sm]:p-4 data-[size=default]:sm:max-w-lg data-[size=sm]:sm:max-w-sm",
                className
              )}
              data-size={size}
              data-slot="alert-dialog-content"
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
                  <AlertDialogPrimitive.Cancel
                    asChild
                    className="absolute top-4 right-4 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-70 transition-opacity hover:bg-muted hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
                    data-slot="alert-dialog-close-button"
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
                  </AlertDialogPrimitive.Cancel>
                )}
              </motion.div>
            </AlertDialogPrimitive.Content>
          </div>
        </AlertDialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type AlertDialogHeaderProps = ComponentProps<"div">;

/**
 * Header section containing alert dialog title, description, and optional media slot.
 */
function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <div
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      data-slot="alert-dialog-header"
      {...props}
    />
  );
}

type AlertDialogMediaProps = ComponentProps<"div">;

/**
 * Icon or media container positioned nicely within the alert dialog header.
 */
function AlertDialogMedia({ className, ...props }: AlertDialogMediaProps) {
  return (
    <div
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted text-foreground sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className
      )}
      data-slot="alert-dialog-media"
      {...props}
    />
  );
}

type AlertDialogTitleProps = ComponentProps<typeof AlertDialogPrimitive.Title>;

/**
 * Accessible title heading for the alert dialog.
 */
function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      className={cn(
        "font-semibold text-base text-foreground tracking-tight sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      data-slot="alert-dialog-title"
      {...props}
    />
  );
}

type AlertDialogDescriptionProps = ComponentProps<
  typeof AlertDialogPrimitive.Description
>;

/**
 * Accessible description explaining the alert prompt or confirmation warning.
 */
function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      className={cn(
        "text-balance text-muted-foreground text-sm sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2 md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      data-slot="alert-dialog-description"
      {...props}
    />
  );
}

type AlertDialogFooterProps = ComponentProps<"div">;

/**
 * Footer section for alert dialog action buttons with responsive layouts.
 */
function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      className={cn(
        "mt-2 flex flex-col-reverse gap-2 rounded-b-xl border-border border-t bg-muted/40 p-4 group-data-[size=default]/alert-dialog-content:-mx-6 group-data-[size=sm]/alert-dialog-content:-mx-4 group-data-[size=default]/alert-dialog-content:-mb-6 group-data-[size=sm]/alert-dialog-content:-mb-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      data-slot="alert-dialog-footer"
      {...props}
    />
  );
}

interface AlertDialogActionProps extends ComponentProps<typeof Button> {
  /**
   * Whether clicking this action button should automatically close the alert dialog.
   * @default false
   */
  closeOnClick?: boolean;
}

/**
 * Primary action button for the alert dialog.
 */
function AlertDialogAction({
  className,
  closeOnClick = false,
  variant = "default",
  ...props
}: AlertDialogActionProps) {
  if (closeOnClick) {
    return (
      <AlertDialogPrimitive.Action asChild data-slot="alert-dialog-action">
        <Button className={className} variant={variant} {...props} />
      </AlertDialogPrimitive.Action>
    );
  }

  return (
    <Button
      className={className}
      data-slot="alert-dialog-action"
      variant={variant}
      {...props}
    />
  );
}

type AlertDialogCancelProps = ComponentProps<
  typeof AlertDialogPrimitive.Cancel
> &
  Pick<ComponentProps<typeof Button>, "variant" | "size">;

/**
 * Cancel or dismiss button that closes the alert dialog without proceeding.
 */
function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  children = "Cancel",
  ...props
}: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Cancel
      asChild
      className={className}
      data-slot="alert-dialog-cancel"
      {...props}
    >
      <Button size={size} variant={variant}>
        {children}
      </Button>
    </AlertDialogPrimitive.Cancel>
  );
}

type AlertDialogCloseProps = ComponentProps<typeof AlertDialogPrimitive.Cancel>;

/**
 * Generic close button wrapper for closing the alert dialog.
 */
function AlertDialogClose({
  className,
  asChild,
  children,
  ...props
}: AlertDialogCloseProps) {
  const prefersReducedMotion = useReducedMotion();

  if (asChild) {
    return (
      <AlertDialogPrimitive.Cancel
        asChild
        className={className}
        data-slot="alert-dialog-close"
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Cancel>
    );
  }

  return (
    <AlertDialogPrimitive.Cancel
      asChild
      className={className}
      data-slot="alert-dialog-close"
      {...props}
    >
      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      >
        {children}
      </motion.button>
    </AlertDialogPrimitive.Cancel>
  );
}

export type {
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogCloseProps,
  AlertDialogContentProps,
  AlertDialogDescriptionProps,
  AlertDialogFooterProps,
  AlertDialogHeaderProps,
  AlertDialogMediaProps,
  AlertDialogOverlayProps,
  AlertDialogPortalProps,
  AlertDialogProps,
  AlertDialogTitleProps,
  AlertDialogTriggerProps,
  AlertDialogViewportProps,
};
export {
  AlertDialog,
  AlertDialog as RadixAlertDialog,
  AlertDialog as default,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogViewport,
  useAlertDialogContext,
};
