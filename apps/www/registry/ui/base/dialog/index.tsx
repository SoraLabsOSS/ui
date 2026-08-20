"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ComponentProps, createContext, useContext, useMemo } from "react";
import { Button } from "@/registry/ui/base/button";

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
 * Root container for the Dialog component powered by Base UI and Motion.
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
    onChange: (nextOpen: boolean) => {
      onOpenChange?.(
        nextOpen,
        undefined as unknown as DialogPrimitive.Root.ChangeEventDetails
      );
    },
    value: controlledOpen,
  });

  const contextValue = useMemo(
    () => ({ open: Boolean(open), setOpen }),
    [open, setOpen]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      <DialogPrimitive.Root
        onOpenChange={(nextOpen, eventDetails) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen, eventDetails);
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
function DialogTrigger({ className, render, ...props }: DialogTriggerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <DialogPrimitive.Trigger
      className={className}
      data-slot="dialog-trigger"
      render={
        render ?? (
          <motion.button
            data-primary-action
            type="button"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          />
        )
      }
      {...props}
    />
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
function DialogClose({ className, render, ...props }: DialogCloseProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <DialogPrimitive.Close
      className={className}
      data-slot="dialog-close"
      render={
        render ?? (
          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          />
        )
      }
      {...props}
    />
  );
}

type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Backdrop>;

/**
 * Semi-transparent backdrop overlay behind the dialog with blur and fade transition.
 */
function DialogOverlay({ className, render, ...props }: DialogOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-xs transition-opacity data-closed:opacity-0 data-open:opacity-100 dark:bg-black/70",
        className
      )}
      data-slot="dialog-overlay"
      render={
        render ?? (
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
        )
      }
      {...props}
    />
  );
}

type DialogViewportProps = ComponentProps<typeof DialogPrimitive.Viewport>;

/**
 * Optional scroll viewport wrapper for large or overflowing dialog popups.
 */
function DialogViewport({ className, ...props }: DialogViewportProps) {
  return (
    <DialogPrimitive.Viewport
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4",
        className
      )}
      data-slot="dialog-viewport"
      {...props}
    />
  );
}

interface DialogContentProps
  extends ComponentProps<typeof DialogPrimitive.Popup> {
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
  render,
  style,
  ...props
}: DialogContentProps) {
  const context = useDialogContext();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;

  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPrimitive.Portal keepMounted>
          <DialogOverlay className={overlayClassName} />
          <div
            className={cn(
              "pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4",
              containerClassName
            )}
          >
            <DialogPrimitive.Popup
              className={cn(
                "pointer-events-auto relative grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl border border-border bg-background p-6 text-foreground text-sm shadow-2xl outline-none sm:max-w-lg",
                className
              )}
              data-slot="dialog-content"
              render={
                render ?? (
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
                  />
                )
              }
              {...props}
            >
              {children}
              {showCloseButton && (
                <DialogPrimitive.Close
                  aria-label="Close"
                  className="absolute top-4 right-4 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-70 transition-opacity hover:bg-muted hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
                  data-slot="dialog-close-button"
                  render={
                    <motion.button
                      type="button"
                      whileHover={
                        prefersReducedMotion ? undefined : { scale: 1.1 }
                      }
                      whileTap={
                        prefersReducedMotion ? undefined : { scale: 0.95 }
                      }
                    />
                  }
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </DialogPrimitive.Popup>
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
        <DialogPrimitive.Close
          data-slot="dialog-footer-close"
          render={<Button variant="outline">Close</Button>}
        />
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
  DialogViewportProps,
};
export {
  Dialog,
  Dialog as BaseDialog,
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
  DialogViewport,
};
