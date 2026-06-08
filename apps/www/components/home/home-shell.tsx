import { cn } from "@workspace/ui/lib/utils";
import type { ElementType, ReactNode } from "react";

/** Extra inset on large screens — skipped on mobile so header/sections match hero width. */
export const homeShellOuterClass = "lg:px-8";

/** Shared horizontal gutter — one inset on mobile (hero, header, sections). */
export const homeShellGutterClass = "px-4 lg:px-12";

export const homeShellMaxWidthClass = "mx-auto w-full max-w-7xl";

interface HomeShellProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  gutterClassName?: string;
}

export function HomeShell({
  as: Component = "div",
  children,
  className,
  gutterClassName,
  contentClassName,
}: HomeShellProps) {
  return (
    <Component className={cn(homeShellOuterClass, className)}>
      <div className={cn(homeShellGutterClass, gutterClassName)}>
        <div className={cn(homeShellMaxWidthClass, contentClassName)}>
          {children}
        </div>
      </div>
    </Component>
  );
}
