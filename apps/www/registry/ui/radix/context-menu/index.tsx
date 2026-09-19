"use client";

import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ContextMenu as ContextMenuPrimitive, Direction } from "radix-ui";
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

interface ContextMenuProps
  extends ComponentProps<typeof ContextMenuPrimitive.Root> {
  /**
   * The default open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * The controlled open state of the context menu.
   */
  open?: boolean;
}

/**
 * Root container for the Context Menu component powered by Radix UI and Motion.
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
    onChange: onOpenChange,
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
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
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
  extends ComponentProps<typeof ContextMenuPrimitive.Content> {
  /**
   * Whether to disable Motion spring physics and animations.
   * @default false
   */
  disableAnimation?: boolean;
}

/**
 * Context menu popup container with smooth Motion spring scale and opacity entrance/exit animations.
 */
function ContextMenuContent({
  className,
  alignOffset = 4,
  collisionPadding = 8,
  disableAnimation = false,
  children,
  asChild,
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
        <ContextMenuPrimitive.Portal forceMount>
          <ContextMenuPrimitive.Content
            alignOffset={alignOffset}
            asChild
            className={cn(
              "z-50 max-h-(--radix-context-menu-content-available-height) min-w-44 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-xl outline-none ring-1 ring-foreground/5 backdrop-blur-md",
              className
            )}
            collisionPadding={collisionPadding}
            data-slot="context-menu-content"
            forceMount
            {...props}
          >
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
                shouldAnimate ? { opacity: 0, scale: 0.9 } : { opacity: 0 }
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
            >
              {children}
            </motion.div>
          </ContextMenuPrimitive.Content>
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
  extends ComponentProps<typeof ContextMenuPrimitive.Label> {
  /**
   * Whether to indent the label for alignment with checkable items.
   * @default false
   */
  inset?: boolean;
}

/**
 * Section label for a group of context menu items.
 * Must be used inside `<ContextMenuGroup>` or `<ContextMenuRadioGroup>`.
 */
function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.Label
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
        "group/context-menu-item relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive data-disabled:pointer-events-none data-highlighted:bg-accent data-inset:pl-8 data-[variant=destructive]:text-destructive data-highlighted:text-accent-foreground data-disabled:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground rtl:data-inset:pr-8 rtl:data-inset:pl-2 dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive data-highlighted:*:[svg]:text-accent-foreground",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

type ContextMenuSubProps = ComponentProps<typeof ContextMenuPrimitive.Sub>;

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
    onChange: onOpenChange,
    value: controlledOpen,
  });

  const contextValue = useMemo(
    () => ({ open: Boolean(open), setOpen }),
    [open, setOpen]
  );

  return (
    <ContextMenuSubContext.Provider value={contextValue}>
      <ContextMenuPrimitive.Sub
        data-slot="context-menu-sub"
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
        {...props}
      >
        {children}
      </ContextMenuPrimitive.Sub>
    </ContextMenuSubContext.Provider>
  );
}

interface ContextMenuSubTriggerProps
  extends ComponentProps<typeof ContextMenuPrimitive.SubTrigger> {
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
    <ContextMenuPrimitive.SubTrigger
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-[state=open]:bg-accent data-highlighted:bg-accent data-open:bg-accent data-popup-open:bg-accent data-inset:pl-8 data-[state=open]:text-accent-foreground data-highlighted:text-accent-foreground data-open:text-accent-foreground data-popup-open:text-accent-foreground data-disabled:opacity-50 rtl:data-inset:pr-8 rtl:data-inset:pl-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-sub-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto size-4 text-muted-foreground rtl:rotate-180" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

interface ContextMenuSubContentProps
  extends ComponentProps<typeof ContextMenuPrimitive.SubContent> {
  /**
   * Whether to disable Motion transitions and animations.
   * @default false
   */
  disableAnimation?: boolean;
}

/**
 * Submenu popup content with smooth Motion spring slide entrance and exit animations.
 */
function ContextMenuSubContent({
  className,
  alignOffset = -4,
  sideOffset = 0,
  collisionPadding = 8,
  disableAnimation = false,
  children,
  asChild,
  style,
  ...props
}: ContextMenuSubContentProps) {
  const context = useContextMenuSubContext();
  const direction = Direction.useDirection();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);
  const slideOffset = direction === "rtl" ? 10 : -10;

  return (
    <AnimatePresence>
      {isOpen && (
        <ContextMenuPrimitive.Portal forceMount>
          <ContextMenuPrimitive.SubContent
            alignOffset={alignOffset}
            asChild
            className={cn(
              "z-50 max-h-(--radix-context-menu-content-available-height) min-w-40 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-2xl outline-none ring-1 ring-foreground/5 backdrop-blur-md",
              className
            )}
            collisionPadding={collisionPadding}
            data-slot="context-menu-sub-content"
            forceMount
            sideOffset={sideOffset}
            {...props}
          >
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={
                shouldAnimate
                  ? {
                      opacity: 0,
                      x: slideOffset,
                      transition: {
                        duration: 0.1,
                      },
                    }
                  : { opacity: 0 }
              }
              initial={
                shouldAnimate ? { opacity: 0, x: slideOffset } : { opacity: 0 }
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
            >
              {children}
            </motion.div>
          </ContextMenuPrimitive.SubContent>
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
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-highlighted:bg-accent data-inset:pl-8 data-highlighted:text-accent-foreground data-disabled:opacity-50 rtl:pr-8 rtl:pl-2 rtl:data-inset:pr-8 rtl:data-inset:pl-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-checkbox-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center rtl:right-2 rtl:left-auto">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
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
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-highlighted:bg-accent data-inset:pl-8 data-highlighted:text-accent-foreground data-disabled:opacity-50 rtl:pr-8 rtl:pl-2 rtl:data-inset:pr-8 rtl:data-inset:pl-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-radio-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center rtl:right-2 rtl:left-auto">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
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

const DirectionProvider = Direction.DirectionProvider;

export {
  ContextMenu,
  ContextMenu as RadixContextMenu,
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
  DirectionProvider,
  useContextMenuContext,
  useContextMenuSubContext,
};
