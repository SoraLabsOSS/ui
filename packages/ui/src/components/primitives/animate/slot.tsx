"use client";

import { cn } from "@workspace/ui/lib/utils";
import { type HTMLMotionProps, isMotionComponent, motion } from "motion/react";
import type * as React from "react";
import { createElement, isValidElement, useCallback, useMemo } from "react";

type AnyProps = Record<string, unknown>;

type DOMMotionProps<T extends HTMLElement = HTMLElement> = Omit<
  HTMLMotionProps<keyof HTMLElementTagNameMap>,
  "ref"
> & { ref?: React.Ref<T> };

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: React.ReactElement })
  | (Base & { asChild?: false | undefined });

type SlotProps<T extends HTMLElement = HTMLElement> = DOMMotionProps<T>;

function useComposedRefs<T>(
  childRef: React.Ref<T> | undefined,
  forwardedRef: React.Ref<T> | undefined
): React.RefCallback<T> {
  return useCallback(
    (node) => {
      for (const ref of [childRef, forwardedRef]) {
        if (!ref) {
          continue;
        }
        if (typeof ref === "function") {
          ref(node);
        } else {
          (ref as React.RefObject<T | null>).current = node;
        }
      }
    },
    [childRef, forwardedRef]
  );
}

function mergeProps<T extends HTMLElement>(
  childProps: AnyProps,
  slotProps: DOMMotionProps<T>
): AnyProps {
  const merged: AnyProps = { ...childProps, ...slotProps };

  if (childProps.className || slotProps.className) {
    merged.className = cn(
      childProps.className as string,
      slotProps.className as string
    );
  }

  if (childProps.style || slotProps.style) {
    merged.style = {
      ...(childProps.style as React.CSSProperties),
      ...(slotProps.style as React.CSSProperties),
    };
  }

  return merged;
}

function Slot<T extends HTMLElement = HTMLElement>({
  children,
  ref,
  ...props
}: SlotProps<T>) {
  const child = isValidElement(children) ? children : null;
  const childType = child?.type as React.ElementType | undefined;
  const isAlreadyMotion =
    childType !== undefined &&
    typeof childType === "object" &&
    isMotionComponent(childType);

  const Base = useMemo(() => {
    if (!childType) {
      return null;
    }
    return isAlreadyMotion ? childType : motion.create(childType);
  }, [isAlreadyMotion, childType]);

  const { ref: childRef, ...childProps } =
    (child?.props as AnyProps | undefined) ?? {};
  const composedRef = useComposedRefs<T>(childRef as React.Ref<T>, ref);

  if (!(child && Base)) {
    return null;
  }

  const mergedProps = mergeProps(childProps, props);

  return createElement(Base as React.ElementType, {
    ...mergedProps,
    ref: composedRef,
  });
}

export {
  type AnyProps,
  type DOMMotionProps,
  Slot,
  type SlotProps,
  type WithAsChild,
};
