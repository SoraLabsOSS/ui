"use client";

import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ComponentProps, createContext, useContext, useMemo } from "react";

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext() {
  return useContext(ContextMenuContext);
}

interface ContextMenuSubContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ContextMenuSubContext = createContext<ContextMenuSubContextValue | null>(
  null
);

function useContextMenuSubContext() {
  return useContext(ContextMenuSubContext);
}

type ContextMenuProps = ComponentProps<typeof ContextMenuPrimitive.Root>;

/**
 * Root container for the Context Menu component powered by Base UI and Motion.
 */
function ContextMenu({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: ContextMenuProps) {
  const [open, setOpen] = useControlledState({
    defaultValue: defaultOpen,
    onChange: (nextOpen: boolean) => {
      onOpenChange?.(
        nextOpen,
        undefined as unknown as ContextMenuPrimitive.Root.ChangeEventDetails
      );
    },
    value: controlledOpen,
  });

  const contextValue = useMemo(
    () => ({ open: Boolean(open), setOpen }),
    [open, setOpen]
  );

  return (
    <ContextMenuContext.Provider value={contextValue}>
      <ContextMenuPrimitive.Root
        data-slot="context-menu"
        onOpenChange={(nextOpen, eventDetails) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen, eventDetails);
        }}
        open={open}
        {...props}
      >
        {children}
      </ContextMenuPrimitive.Root>
    </ContextMenuContext.Provider>
  );
}

type ContextMenuPortalProps = ComponentProps<
  typeof ContextMenuPrimitive.Portal
>;

/**
 * Portals the context menu content into the document body.
 */
function ContextMenuPortal({ ...props }: ContextMenuPortalProps) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

type ContextMenuTriggerProps = ComponentProps<
  typeof ContextMenuPrimitive.Trigger
>;

/**
 * The target element that opens the context menu on right click or long press.
 */
function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
  return (
    <ContextMenuPrimitive.Trigger
      className={cn("select-none", className)}
      data-slot="context-menu-trigger"
      {...props}
    />
  );
}

interface ContextMenuContentProps
  extends ComponentProps<typeof ContextMenuPrimitive.Popup>,
    Pick<
      ComponentProps<typeof ContextMenuPrimitive.Positioner>,
      | "align"
      | "alignOffset"
      | "anchor"
      | "arrowPadding"
      | "collisionAvoidance"
      | "collisionBoundary"
      | "collisionPadding"
      | "positionMethod"
      | "side"
      | "sideOffset"
      | "sticky"
    > {
  /**
   * Whether to disable Motion spring physics and animations.
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Additional CSS classes for the positioner container.
   */
  positionerClassName?: string;
}

/**
 * Context menu popup container with smooth Motion spring scale and opacity entrance/exit animations.
 */
function ContextMenuContent({
  className,
  positionerClassName,
  align = "start",
  alignOffset = 4,
  side = "right",
  sideOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding = 8,
  positionMethod,
  sticky,
  disableAnimation = false,
  children,
  render,
  style,
  ...props
}: ContextMenuContentProps) {
  const context = useContextMenuContext();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  return (
    <AnimatePresence>
      {isOpen && (
        <ContextMenuPrimitive.Portal keepMounted>
          <ContextMenuPrimitive.Positioner
            align={align}
            alignOffset={alignOffset}
            anchor={anchor}
            arrowPadding={arrowPadding}
            className={cn("isolate z-50 outline-none", positionerClassName)}
            collisionAvoidance={collisionAvoidance}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}
            data-slot="context-menu-positioner"
            positionMethod={positionMethod}
            side={side}
            sideOffset={sideOffset}
            sticky={sticky}
          >
            <ContextMenuPrimitive.Popup
              className={cn(
                "z-50 max-h-(--available-height) min-w-44 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-xl outline-none ring-1 ring-foreground/5 backdrop-blur-md",
                className
              )}
              data-slot="context-menu-content"
              render={
                render ?? (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      shouldAnimate
                        ? {
                            opacity: 0,
                            scale: 0.9,
                            transition: {
                              duration: 0.1,
                            },
                          }
                        : { opacity: 0 }
                    }
                    initial={
                      shouldAnimate
                        ? { opacity: 0, scale: 0.9 }
                        : { opacity: 0 }
                    }
                    style={{ originX: 0, originY: 0, ...style }}
                    transition={
                      shouldAnimate
                        ? {
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                            opacity: { duration: 0.2 },
                          }
                        : { duration: 0 }
                    }
                  />
                )
              }
              {...props}
            >
              {children}
            </ContextMenuPrimitive.Popup>
          </ContextMenuPrimitive.Positioner>
        </ContextMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type ContextMenuGroupProps = ComponentProps<typeof ContextMenuPrimitive.Group>;

/**
 * Groups related context menu items together.
 */
function ContextMenuGroup({ ...props }: ContextMenuGroupProps) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

interface ContextMenuLabelProps
  extends ComponentProps<typeof ContextMenuPrimitive.GroupLabel> {
  /**
   * Whether to indent the label for alignment with checkable items.
   * @default false
   */
  inset?: boolean;
}

/**
 * Section label for a group of context menu items.
 */
function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.GroupLabel
      className={cn(
        "px-2 py-1.5 font-semibold text-muted-foreground text-xs data-inset:pl-8",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-label"
      {...props}
    />
  );
}

interface ContextMenuItemProps
  extends ComponentProps<typeof ContextMenuPrimitive.Item> {
  /**
   * Whether to indent the item for alignment with checkable items.
   * @default false
   */
  inset?: boolean;
  /**
   * Visual style variant of the item.
   * @default "default"
   */
  variant?: "default" | "destructive";
}

/**
 * An actionable item within the context menu.
 */
function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        "group/context-menu-item relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

type ContextMenuSubProps = ComponentProps<
  typeof ContextMenuPrimitive.SubmenuRoot
>;

/**
 * Submenu root container managing nested submenu state.
 */
function ContextMenuSub({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: ContextMenuSubProps) {
  const [open, setOpen] = useControlledState({
    defaultValue: defaultOpen,
    onChange: (nextOpen: boolean) => {
      onOpenChange?.(
        nextOpen,
        undefined as unknown as ContextMenuPrimitive.SubmenuRoot.ChangeEventDetails
      );
    },
    value: controlledOpen,
  });

  const contextValue = useMemo(
    () => ({ open: Boolean(open), setOpen }),
    [open, setOpen]
  );

  return (
    <ContextMenuSubContext.Provider value={contextValue}>
      <ContextMenuPrimitive.SubmenuRoot
        data-slot="context-menu-sub"
        onOpenChange={(nextOpen, eventDetails) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen, eventDetails);
        }}
        open={open}
        {...props}
      >
        {children}
      </ContextMenuPrimitive.SubmenuRoot>
    </ContextMenuSubContext.Provider>
  );
}

interface ContextMenuSubTriggerProps
  extends ComponentProps<typeof ContextMenuPrimitive.SubmenuTrigger> {
  /**
   * Whether to indent the item for alignment with checkable items.
   * @default false
   */
  inset?: boolean;
}

/**
 * Interactive menu item that reveals a submenu on hover or click.
 */
function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-open:bg-accent data-inset:pl-8 data-open:text-accent-foreground data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-sub-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="cn-rtl-flip ml-auto size-4 text-muted-foreground" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

interface ContextMenuSubContentProps
  extends ComponentProps<typeof ContextMenuPrimitive.Popup>,
    Pick<
      ComponentProps<typeof ContextMenuPrimitive.Positioner>,
      | "align"
      | "alignOffset"
      | "anchor"
      | "arrowPadding"
      | "collisionAvoidance"
      | "collisionBoundary"
      | "collisionPadding"
      | "positionMethod"
      | "side"
      | "sideOffset"
      | "sticky"
    > {
  /**
   * Whether to disable Motion spring physics and animations.
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Additional CSS classes for the positioner container.
   */
  positionerClassName?: string;
}

/**
 * Submenu popup content with smooth Motion spring slide entrance and exit animations.
 */
function ContextMenuSubContent({
  className,
  positionerClassName,
  align = "start",
  alignOffset = -4,
  side = "right",
  sideOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding = 8,
  positionMethod,
  sticky,
  disableAnimation = false,
  children,
  render,
  style,
  ...props
}: ContextMenuSubContentProps) {
  const context = useContextMenuSubContext();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  return (
    <AnimatePresence>
      {isOpen && (
        <ContextMenuPrimitive.Portal keepMounted>
          <ContextMenuPrimitive.Positioner
            align={align}
            alignOffset={alignOffset}
            anchor={anchor}
            arrowPadding={arrowPadding}
            className={cn("isolate z-50 outline-none", positionerClassName)}
            collisionAvoidance={collisionAvoidance}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}
            data-slot="context-menu-sub-positioner"
            positionMethod={positionMethod}
            side={side}
            sideOffset={sideOffset}
            sticky={sticky}
          >
            <ContextMenuPrimitive.Popup
              className={cn(
                "z-50 max-h-(--available-height) min-w-40 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-2xl outline-none ring-1 ring-foreground/5 backdrop-blur-md",
                className
              )}
              data-slot="context-menu-sub-content"
              render={
                render ?? (
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      shouldAnimate
                        ? {
                            opacity: 0,
                            x: -10,
                            transition: {
                              duration: 0.1,
                            },
                          }
                        : { opacity: 0 }
                    }
                    initial={
                      shouldAnimate ? { opacity: 0, x: -10 } : { opacity: 0 }
                    }
                    style={{ ...style }}
                    transition={
                      shouldAnimate
                        ? {
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                            opacity: { duration: 0.2 },
                          }
                        : { duration: 0 }
                    }
                  />
                )
              }
              {...props}
            >
              {children}
            </ContextMenuPrimitive.Popup>
          </ContextMenuPrimitive.Positioner>
        </ContextMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

interface ContextMenuCheckboxItemProps
  extends ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> {
  /**
   * Whether to indent the item for alignment.
   * @default false
   */
  inset?: boolean;
}

/**
 * An actionable context menu item with a checkbox toggle state.
 */
function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-8 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-checkbox-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

type ContextMenuRadioGroupProps = ComponentProps<
  typeof ContextMenuPrimitive.RadioGroup
>;

/**
 * Radio group container for mutually exclusive context menu selections.
 */
function ContextMenuRadioGroup({ ...props }: ContextMenuRadioGroupProps) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

interface ContextMenuRadioItemProps
  extends ComponentProps<typeof ContextMenuPrimitive.RadioItem> {
  /**
   * Whether to indent the item for alignment.
   * @default false
   */
  inset?: boolean;
}

/**
 * A selectable radio option within a ContextMenuRadioGroup.
 */
function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-8 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-radio-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

type ContextMenuSeparatorProps = ComponentProps<
  typeof ContextMenuPrimitive.Separator
>;

/**
 * Divider separating groups of context menu items.
 */
function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      data-slot="context-menu-separator"
      {...props}
    />
  );
}

type ContextMenuShortcutProps = ComponentProps<"span">;

/**
 * Renders keyboard shortcut combination hints aligned to the right.
 */
function ContextMenuShortcut({
  className,
  ...props
}: ContextMenuShortcutProps) {
  return (
    <span
      className={cn(
        "ml-auto text-muted-foreground text-xs tracking-widest group-focus/context-menu-item:text-accent-foreground",
        className
      )}
      data-slot="context-menu-shortcut"
      {...props}
    />
  );
}

export type {
  ContextMenuCheckboxItemProps,
  ContextMenuContentProps,
  ContextMenuGroupProps,
  ContextMenuItemProps,
  ContextMenuLabelProps,
  ContextMenuPortalProps,
  ContextMenuProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuSeparatorProps,
  ContextMenuShortcutProps,
  ContextMenuSubContentProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
  ContextMenuTriggerProps,
};
export {
  ContextMenu,
  ContextMenu as BaseContextMenu,
  ContextMenu as default,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  useContextMenuContext,
  useContextMenuSubContext,
};
