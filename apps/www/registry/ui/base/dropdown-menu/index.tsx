"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

type DropdownMenuProps = ComponentProps<typeof MenuPrimitive.Root>;

/**
 * Root container for the Dropdown Menu component powered by Base UI and Motion.
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
    onChange: (nextOpen: boolean) => {
      onOpenChange?.(
        nextOpen,
        undefined as unknown as MenuPrimitive.Root.ChangeEventDetails
      );
    },
    value: controlledOpen,
  });

  const contextValue = useMemo(
    () => ({ open: Boolean(open), setOpen }),
    [open, setOpen]
  );

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <MenuPrimitive.Root
        data-slot="dropdown-menu"
        onOpenChange={(nextOpen, eventDetails) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen, eventDetails);
        }}
        open={open}
        {...props}
      >
        {children}
      </MenuPrimitive.Root>
    </DropdownMenuContext.Provider>
  );
}

type DropdownMenuPortalProps = ComponentProps<typeof MenuPrimitive.Portal>;

/**
 * Portals the dropdown menu content into the document body.
 */
function DropdownMenuPortal({ ...props }: DropdownMenuPortalProps) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

type DropdownMenuTriggerProps = ComponentProps<typeof MenuPrimitive.Trigger>;

/**
 * The button or element that opens the dropdown menu on click.
 */
function DropdownMenuTrigger({ ...props }: DropdownMenuTriggerProps) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

interface DropdownMenuContentProps
  extends ComponentProps<typeof MenuPrimitive.Popup>,
    Pick<
      ComponentProps<typeof MenuPrimitive.Positioner>,
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
 * Dropdown menu popup container with smooth Motion spring scale and opacity
 * entrance/exit animations. Scales from the transform origin set by Base UI.
 */
function DropdownMenuContent({
  className,
  positionerClassName,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
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
}: DropdownMenuContentProps) {
  const context = useDropdownMenuContext();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  return (
    <AnimatePresence>
      {isOpen && (
        <MenuPrimitive.Portal keepMounted>
          <MenuPrimitive.Positioner
            align={align}
            alignOffset={alignOffset}
            anchor={anchor}
            arrowPadding={arrowPadding}
            className={cn("isolate z-50 outline-none", positionerClassName)}
            collisionAvoidance={collisionAvoidance}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}
            data-slot="dropdown-menu-positioner"
            positionMethod={positionMethod}
            side={side}
            sideOffset={sideOffset}
            sticky={sticky}
          >
            <MenuPrimitive.Popup
              className={cn(
                "z-50 max-h-(--available-height) min-w-44 origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-xl outline-none ring-1 ring-foreground/5 backdrop-blur-md",
                className
              )}
              data-slot="dropdown-menu-content"
              render={
                render ?? (
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
                      shouldAnimate
                        ? { opacity: 0, scale: 0.95 }
                        : { opacity: 0 }
                    }
                    style={{
                      transformOrigin: "var(--transform-origin)",
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
                  />
                )
              }
              {...props}
            >
              {children}
            </MenuPrimitive.Popup>
          </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type DropdownMenuGroupProps = ComponentProps<typeof MenuPrimitive.Group>;

/**
 * Groups related dropdown menu items together.
 */
function DropdownMenuGroup({ ...props }: DropdownMenuGroupProps) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

interface DropdownMenuLabelProps
  extends ComponentProps<typeof MenuPrimitive.GroupLabel> {
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
    <MenuPrimitive.GroupLabel
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
  extends ComponentProps<typeof MenuPrimitive.Item> {
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
    <MenuPrimitive.Item
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

type DropdownMenuSubProps = ComponentProps<typeof MenuPrimitive.SubmenuRoot>;

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
    onChange: (nextOpen: boolean) => {
      onOpenChange?.(
        nextOpen,
        undefined as unknown as MenuPrimitive.SubmenuRoot.ChangeEventDetails
      );
    },
    value: controlledOpen,
  });

  const contextValue = useMemo(
    () => ({ open: Boolean(open), setOpen }),
    [open, setOpen]
  );

  return (
    <DropdownMenuSubContext.Provider value={contextValue}>
      <MenuPrimitive.SubmenuRoot
        data-slot="dropdown-menu-sub"
        onOpenChange={(nextOpen, eventDetails) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen, eventDetails);
        }}
        open={open}
        {...props}
      >
        {children}
      </MenuPrimitive.SubmenuRoot>
    </DropdownMenuSubContext.Provider>
  );
}

interface DropdownMenuSubTriggerProps
  extends ComponentProps<typeof MenuPrimitive.SubmenuTrigger> {
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
    <MenuPrimitive.SubmenuTrigger
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-open:bg-accent data-popup-open:bg-accent data-inset:pl-8 data-open:text-accent-foreground data-popup-open:text-accent-foreground data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-sub-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="cn-rtl-flip ml-auto size-4 text-muted-foreground" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

interface DropdownMenuSubContentProps
  extends ComponentProps<typeof MenuPrimitive.Popup>,
    Pick<
      ComponentProps<typeof MenuPrimitive.Positioner>,
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
   * Whether to disable Motion transitions and animations.
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
function DropdownMenuSubContent({
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
}: DropdownMenuSubContentProps) {
  const context = useDropdownMenuSubContext();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = context ? context.open : true;
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  return (
    <AnimatePresence>
      {isOpen && (
        <MenuPrimitive.Portal keepMounted>
          <MenuPrimitive.Positioner
            align={align}
            alignOffset={alignOffset}
            anchor={anchor}
            arrowPadding={arrowPadding}
            className={cn("isolate z-50 outline-none", positionerClassName)}
            collisionAvoidance={collisionAvoidance}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}
            data-slot="dropdown-menu-sub-positioner"
            positionMethod={positionMethod}
            side={side}
            sideOffset={sideOffset}
            sticky={sticky}
          >
            <MenuPrimitive.Popup
              className={cn(
                "z-50 max-h-(--available-height) min-w-40 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-2xl outline-none ring-1 ring-foreground/5 backdrop-blur-md",
                className
              )}
              data-slot="dropdown-menu-sub-content"
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
            </MenuPrimitive.Popup>
          </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

interface DropdownMenuCheckboxItemProps
  extends ComponentProps<typeof MenuPrimitive.CheckboxItem> {
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
    <MenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-8 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-checkbox-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-4" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

type DropdownMenuRadioGroupProps = ComponentProps<
  typeof MenuPrimitive.RadioGroup
>;

/**
 * Radio group container for mutually exclusive dropdown menu selections.
 */
function DropdownMenuRadioGroup({ ...props }: DropdownMenuRadioGroupProps) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

interface DropdownMenuRadioItemProps
  extends ComponentProps<typeof MenuPrimitive.RadioItem> {
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
    <MenuPrimitive.RadioItem
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-8 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-radio-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon className="size-4" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

type DropdownMenuSeparatorProps = ComponentProps<
  typeof MenuPrimitive.Separator
>;

/**
 * Divider separating groups of dropdown menu items.
 */
function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <MenuPrimitive.Separator
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
export {
  DropdownMenu,
  DropdownMenu as BaseDropdownMenu,
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
