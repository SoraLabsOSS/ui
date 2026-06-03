"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui-components/react/collapsible";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import type * as React from "react";
import { useControlledState } from "@/registry/hooks/use-controlled-state";
import { getStrictContext } from "@/registry/lib/get-strict-context";

type CollapsibleContextType = {
  isOpen: boolean;
  setIsOpen: CollapsibleProps["onOpenChange"];
};

const [CollapsibleProvider, useCollapsible] =
  getStrictContext<CollapsibleContextType>("CollapsibleContext");

type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>;

function Collapsible(props: CollapsibleProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <CollapsibleProvider value={{ isOpen, setIsOpen }}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        {...props}
        onOpenChange={setIsOpen}
      />
    </CollapsibleProvider>
  );
}

type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.Trigger
>;

function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  );
}

type CollapsiblePanelProps = Omit<
  React.ComponentProps<typeof CollapsiblePrimitive.Panel>,
  "keepMounted" | "render"
> &
  HTMLMotionProps<"div"> & {
    keepRendered?: boolean;
  };

function CollapsiblePanel({
  transition = { duration: 0.35, ease: "easeInOut" },
  hiddenUntilFound,
  keepRendered = false,
  ...props
}: CollapsiblePanelProps) {
  const { isOpen } = useCollapsible();

  return (
    <AnimatePresence>
      {keepRendered ? (
        <CollapsiblePrimitive.Panel
          hidden={false}
          hiddenUntilFound={hiddenUntilFound}
          keepMounted
          render={
            <motion.div
              animate={
                isOpen
                  ? { height: "auto", opacity: 1, "--mask-stop": "100%", y: 0 }
                  : { height: 0, opacity: 0, "--mask-stop": "0%", y: 20 }
              }
              data-slot="collapsible-panel"
              initial={{ height: 0, opacity: 0, "--mask-stop": "0%", y: 20 }}
              key="collapsible-panel"
              style={{
                maskImage:
                  "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
                WebkitMaskImage:
                  "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
                overflow: "hidden",
              }}
              transition={transition}
              {...props}
            />
          }
        />
      ) : (
        isOpen && (
          <CollapsiblePrimitive.Panel
            hidden={false}
            hiddenUntilFound={hiddenUntilFound}
            keepMounted
            render={
              <motion.div
                animate={{
                  height: "auto",
                  opacity: 1,
                  "--mask-stop": "100%",
                  y: 0,
                }}
                data-slot="collapsible-panel"
                exit={{ height: 0, opacity: 0, "--mask-stop": "0%", y: 20 }}
                initial={{ height: 0, opacity: 0, "--mask-stop": "0%", y: 20 }}
                key="collapsible-panel"
                style={{
                  maskImage:
                    "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
                  WebkitMaskImage:
                    "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
                  overflow: "hidden",
                }}
                transition={transition}
                {...props}
              />
            }
          />
        )
      )}
    </AnimatePresence>
  );
}

export {
  Collapsible,
  type CollapsibleContextType,
  CollapsiblePanel,
  type CollapsiblePanelProps,
  type CollapsibleProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
  useCollapsible,
};
