"use client";

import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Direction, DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { type ComponentProps, createContext, useContext, useMemo } from "react";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null
);

function useDropdownMenuContext() {
  return useContext(DropdownMenuContext);
}

interface DropdownMenuSubContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuSubContext =
  createContext<DropdownMenuSubContextValue | null>(null);

function useDropdownMenuSubContext() {
  return useContext(DropdownMenuSubContext);
}

type DropdownMenuProps = ComponentProps<typeof DropdownMenuPrimitive.Root>;

/**
 * Root container for the Dropdown Menu component powered by Radix UI and Motion.
 */
function DropdownMenu({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: DropdownMenuProps) {
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
    <DropdownMenuContext.Provider value={contextValue}>
      <DropdownMenuPrimitive.Root
        data-slot="dropdown-menu"
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Root>
    </DropdownMenuContext.Provider>
  );
}

type DropdownMenuPortalProps = ComponentProps<
  typeof DropdownMenuPrimitive.Portal
>;

/**
 * Portals the dropdown menu content into the document body.
 */
function DropdownMenuPortal({ ...props }: DropdownMenuPortalProps) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

type DropdownMenuTriggerProps = ComponentProps<
  typeof DropdownMenuPrimitive.Trigger
>;

/**
 * The button or element that opens the dropdown menu on click.
 */
function DropdownMenuTrigger({
  asChild,
  className,
  ...props
}: DropdownMenuTriggerProps) {
  return (
    <DropdownMenuPrimitive.Trigger
      asChild={asChild}
      className={className}
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

interface DropdownMenuContentProps
  extends ComponentProps<typeof DropdownMenuPrimitive.Content> {
  /**
   * Whether to disable Motion spring physics and animations.
   * @default false
   */
  disableAnimation?: boolean;
}

/**
 * Dropdown menu popup container with smooth Motion spring scale and opacity
 * entrance/exit animations.
 */
function DropdownMenuContent({
  className,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  collisionPadding = 8,
  disableAnimation = false,
  children,
  asChild,
  style,
  ...props
}: DropdownMenuContentProps) {
  const context = useDropdownMenuContext();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenuPrimitive.Portal forceMount>
          <DropdownMenuPrimitive.Content
            align={align}
            alignOffset={alignOffset}
            asChild
            className={cn(
              "z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-44 origin-(--radix-dropdown-menu-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-xl outline-none ring-1 ring-foreground/5 backdrop-blur-md",
              className
            )}
            collisionPadding={collisionPadding}
            data-slot="dropdown-menu-content"
            forceMount
            side={side}
            sideOffset={sideOffset}
            {...props}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={
                shouldAnimate
                  ? {
                      opacity: 0,
                      scale: 0.95,
                      transition: {
                        duration: 0.1,
                      },
                    }
                  : { opacity: 0 }
              }
              initial={
                shouldAnimate ? { opacity: 0, scale: 0.95 } : { opacity: 0 }
              }
              style={{
                transformOrigin:
                  "var(--radix-dropdown-menu-content-transform-origin, var(--transform-origin))",
                ...style,
              }}
              transition={
                shouldAnimate
                  ? {
                      type: "spring",
                      stiffness: 400,
                      damping: 24,
                      opacity: { duration: 0.18 },
                    }
                  : { duration: 0 }
              }
            >
              {children}
            </motion.div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type DropdownMenuGroupProps = ComponentProps<
  typeof DropdownMenuPrimitive.Group
>;

/**
 * Groups related dropdown menu items together.
 */
function DropdownMenuGroup({ ...props }: DropdownMenuGroupProps) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

interface DropdownMenuLabelProps
  extends ComponentProps<typeof DropdownMenuPrimitive.Label> {
  /**
   * Whether to indent the label for alignment with checkable items.
   * @default false
   */
  inset?: boolean;
}

/**
 * Section label for a group of dropdown menu items.
 * Must be used inside `<DropdownMenuGroup>` or `<DropdownMenuRadioGroup>`.
 */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        "px-2 py-1.5 font-semibold text-muted-foreground text-xs data-inset:pl-8",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-label"
      {...props}
    />
  );
}

interface DropdownMenuItemProps
  extends ComponentProps<typeof DropdownMenuPrimitive.Item> {
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
 * An actionable item within the dropdown menu.
 */
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive data-disabled:pointer-events-none data-highlighted:bg-accent data-inset:pl-8 data-[variant=destructive]:text-destructive data-highlighted:text-accent-foreground data-disabled:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground rtl:data-inset:pr-8 rtl:data-inset:pl-2 dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive data-highlighted:*:[svg]:text-accent-foreground",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

type DropdownMenuSubProps = ComponentProps<typeof DropdownMenuPrimitive.Sub>;

/**
 * Submenu root container managing nested submenu state.
 */
function DropdownMenuSub({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: DropdownMenuSubProps) {
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
    <DropdownMenuSubContext.Provider value={contextValue}>
      <DropdownMenuPrimitive.Sub
        data-slot="dropdown-menu-sub"
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Sub>
    </DropdownMenuSubContext.Provider>
  );
}

interface DropdownMenuSubTriggerProps
  extends ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> {
  /**
   * Whether to indent the item for alignment with checkable items.
   * @default false
   */
  inset?: boolean;
}

/**
 * Interactive menu item that reveals a submenu on hover or click.
 */
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-[state=open]:bg-accent data-highlighted:bg-accent data-open:bg-accent data-popup-open:bg-accent data-inset:pl-8 data-[state=open]:text-accent-foreground data-highlighted:text-accent-foreground data-open:text-accent-foreground data-popup-open:text-accent-foreground data-disabled:opacity-50 rtl:data-inset:pr-8 rtl:data-inset:pl-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-sub-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto size-4 text-muted-foreground rtl:rotate-180" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

interface DropdownMenuSubContentProps
  extends ComponentProps<typeof DropdownMenuPrimitive.SubContent> {
  /**
   * Whether to disable Motion transitions and animations.
   * @default false
   */
  disableAnimation?: boolean;
}

/**
 * Submenu popup content with smooth Motion spring slide entrance and exit animations.
 */
function DropdownMenuSubContent({
  className,
  alignOffset = -4,
  sideOffset = 0,
  collisionPadding = 8,
  disableAnimation = false,
  children,
  asChild,
  style,
  ...props
}: DropdownMenuSubContentProps) {
  const context = useDropdownMenuSubContext();
  const direction = Direction.useDirection();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);
  const slideOffset = direction === "rtl" ? 10 : -10;

  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenuPrimitive.Portal forceMount>
          <DropdownMenuPrimitive.SubContent
            alignOffset={alignOffset}
            asChild
            className={cn(
              "z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-40 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-2xl outline-none ring-1 ring-foreground/5 backdrop-blur-md",
              className
            )}
            collisionPadding={collisionPadding}
            data-slot="dropdown-menu-sub-content"
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
          </DropdownMenuPrimitive.SubContent>
        </DropdownMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

interface DropdownMenuCheckboxItemProps
  extends ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> {
  /**
   * Whether to indent the item for alignment.
   * @default false
   */
  inset?: boolean;
}

/**
 * An actionable dropdown menu item with a checkbox toggle state.
 */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-highlighted:bg-accent data-inset:pl-8 data-highlighted:text-accent-foreground data-disabled:opacity-50 rtl:pr-8 rtl:pl-2 rtl:data-inset:pr-8 rtl:data-inset:pl-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-checkbox-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center rtl:right-2 rtl:left-auto">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

type DropdownMenuRadioGroupProps = ComponentProps<
  typeof DropdownMenuPrimitive.RadioGroup
>;

/**
 * Radio group container for mutually exclusive dropdown menu selections.
 */
function DropdownMenuRadioGroup({ ...props }: DropdownMenuRadioGroupProps) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

interface DropdownMenuRadioItemProps
  extends ComponentProps<typeof DropdownMenuPrimitive.RadioItem> {
  /**
   * Whether to indent the item for alignment.
   * @default false
   */
  inset?: boolean;
}

/**
 * A selectable radio option within a DropdownMenuRadioGroup.
 */
function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-highlighted:bg-accent data-inset:pl-8 data-highlighted:text-accent-foreground data-disabled:opacity-50 rtl:pr-8 rtl:pl-2 rtl:data-inset:pr-8 rtl:data-inset:pl-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-radio-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center rtl:right-2 rtl:left-auto">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

type DropdownMenuSeparatorProps = ComponentProps<
  typeof DropdownMenuPrimitive.Separator
>;

/**
 * Divider separating groups of dropdown menu items.
 */
function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  );
}

type DropdownMenuShortcutProps = ComponentProps<"span">;

/**
 * Renders keyboard shortcut combination hints aligned to the right.
 */
function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps) {
  return (
    <span
      className={cn(
        "ml-auto text-muted-foreground text-xs tracking-widest group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      data-slot="dropdown-menu-shortcut"
      {...props}
    />
  );
}

export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuPortalProps,
  DropdownMenuProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuShortcutProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuTriggerProps,
};

const DirectionProvider = Direction.DirectionProvider;

export {
  DirectionProvider,
  DropdownMenu,
  DropdownMenu as RadixDropdownMenu,
  DropdownMenu as default,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useDropdownMenuContext,
  useDropdownMenuSubContext,
};
