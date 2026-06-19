import { type MotionProps, motion } from "motion/react";
import type {
  ComponentType,
  CSSProperties,
  ElementType,
  ReactNode,
  Ref,
} from "react";

type CachedMotionProps = MotionProps & {
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
};

const cache = new Map<ElementType, ComponentType<CachedMotionProps>>();

export function getMotionComponent(
  Component: ElementType
): ComponentType<CachedMotionProps> {
  const cached = cache.get(Component);
  if (cached) {
    return cached;
  }

  const created = motion.create(Component as never);
  cache.set(Component, created);
  return created;
}
