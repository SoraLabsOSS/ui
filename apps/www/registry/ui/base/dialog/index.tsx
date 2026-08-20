"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { XIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type * as React from "react";

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>;

/**
 * Root container for the Dialog component powered by Base UI.
 */
function Dialog({ ...props }: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>;

/**
 * Button or trigger element that opens the dialog.
 */
function DialogTrigger({ ...props }: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

type DialogPortalProps = React.ComponentProps<typeof DialogPrimitive.Portal>;

/**
 * Portals dialog overlay and content to the document body.
 */
function DialogPortal({ ...props }: DialogPortalProps) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>;

/**
 * Action button that dismisses the dialog.
 */
function DialogClose({ ...props }: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

type DialogOverlayProps = React.ComponentProps<typeof DialogPrimitive.Backdrop>;

/**
 * Semi-transparent backdrop overlay behind the dialog.
 */
function DialogOverlay({ className, render, ...props }: DialogOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/40 backdrop-blur-xs transition-opacity data-closed:opacity-0 data-open:opacity-100 dark:bg-black/60",
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
                : { duration: 0.15, ease: "easeOut" }
            }
          />
        )
      }
      {...props}
    />
  );
}

type DialogViewportProps = React.ComponentProps<
  typeof DialogPrimitive.Viewport
>;

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
  extends React.ComponentProps<typeof DialogPrimitive.Popup> {
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
 * Modal dialog content container with animated entrance and exit.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  overlayClassName,
  render,
  ...props
}: DialogContentProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Popup
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-background p-6 text-foreground text-sm shadow-xl outline-none duration-150 sm:max-w-lg",
          className
        )}
        data-slot="dialog-content"
        render={
          render ?? (
            <motion.div
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
              initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", bounce: 0, duration: 0.25 }
              }
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
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

/**
 * Header section containing dialog title and description.
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
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

interface DialogFooterProps extends React.ComponentProps<"div"> {
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
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          data-slot="dialog-footer-close"
        >
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;

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

type DialogDescriptionProps = React.ComponentProps<
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
