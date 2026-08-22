"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import { Tabs as TabsPrimitive } from "radix-ui";
import type * as React from "react";
import { useControlledState } from "@/registry/hooks/use-controlled-state";
import { getStrictContext } from "@/registry/lib/get-strict-context";
import {
  AutoHeight,
  type AutoHeightProps,
} from "@/registry/primitives/effects/auto-height";
import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from "@/registry/primitives/effects/highlight";

interface TabsContextType {
  setValue: TabsProps["onValueChange"];
  value: string | undefined;
}

const [TabsProvider, useTabs] =
  getStrictContext<TabsContextType>("TabsContext");

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>;

function Tabs(props: TabsProps) {
  const [value, setValue] = useControlledState({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  });

  return (
    <TabsProvider value={{ value, setValue }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        {...props}
        onValueChange={setValue}
      />
    </TabsProvider>
  );
}

type TabsHighlightProps = Omit<HighlightProps, "value">;

function TabsHighlight({
  transition = { type: "spring", stiffness: 200, damping: 25 },
  ...props
}: TabsHighlightProps) {
  const { value } = useTabs();

  return (
    <Highlight
      data-slot="tabs-highlight"
      transition={transition}
      value={value}
      {...props}
    />
  );
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;

function TabsList(props: TabsListProps) {
  return <TabsPrimitive.List data-slot="tabs-list" {...props} />;
}

type TabsHighlightItemProps = HighlightItemProps & {
  value: string;
};

function TabsHighlightItem(props: TabsHighlightItemProps) {
  return <HighlightItem data-slot="tabs-highlight-item" {...props} />;
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;

function TabsTrigger(props: TabsTriggerProps) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" {...props} />;
}

type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content> &
  HTMLMotionProps<"div">;

function TabsContent({
  value,
  forceMount,
  transition = { duration: 0.5, ease: "easeInOut" },
  ...props
}: TabsContentProps) {
  const prefersReducedMotion = useReducedMotion();
  const resolvedTransition = prefersReducedMotion
    ? { duration: 0 }
    : transition;

  return (
    <AnimatePresence mode="wait">
      <TabsPrimitive.Content asChild forceMount={forceMount} value={value}>
        <motion.div
          animate={{ opacity: 1, filter: "blur(0px)" }}
          data-slot="tabs-content"
          exit={{ opacity: 0, filter: "blur(0px)" }}
          initial={{ opacity: 0, filter: "blur(0px)" }}
          transition={resolvedTransition}
          {...props}
        />
      </TabsPrimitive.Content>
    </AnimatePresence>
  );
}

type TabsContentsAutoProps = AutoHeightProps & {
  mode?: "auto-height";
  children: React.ReactNode;
  transition?: Transition;
};

type TabsContentsLayoutProps = Omit<HTMLMotionProps<"div">, "transition"> & {
  mode: "layout";
  children: React.ReactNode;
  transition?: Transition;
};

type TabsContentsProps = TabsContentsAutoProps | TabsContentsLayoutProps;

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
};

function isAutoMode(props: TabsContentsProps): props is TabsContentsAutoProps {
  return !("mode" in props) || props.mode === "auto-height";
}

function TabsContents(props: TabsContentsProps) {
  const { value } = useTabs();
  const prefersReducedMotion = useReducedMotion();

  if (isAutoMode(props)) {
    const { transition = defaultTransition, ...autoProps } = props;
    const resolvedTransition = prefersReducedMotion
      ? { duration: 0 }
      : transition;

    return (
      <AutoHeight
        data-slot="tabs-contents"
        deps={[value]}
        transition={resolvedTransition}
        {...autoProps}
      />
    );
  }

  const { transition = defaultTransition, style, ...layoutProps } = props;
  const resolvedTransition = prefersReducedMotion
    ? { duration: 0 }
    : { layout: transition };

  return (
    <motion.div
      data-slot="tabs-contents"
      layout={prefersReducedMotion ? false : "size"}
      layoutDependency={value}
      style={{ overflow: "hidden", ...style }}
      transition={resolvedTransition}
      {...layoutProps}
    />
  );
}

export {
  Tabs,
  TabsContent,
  type TabsContentProps,
  TabsContents,
  type TabsContentsProps,
  TabsHighlight,
  TabsHighlightItem,
  type TabsHighlightItemProps,
  type TabsHighlightProps,
  TabsList,
  type TabsListProps,
  type TabsProps,
  TabsTrigger,
  type TabsTriggerProps,
};
