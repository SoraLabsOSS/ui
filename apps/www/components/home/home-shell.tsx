import { cn } from "@workspace/ui/lib/utils";
import type { ElementType, ReactNode } from "react";

/** Matches footer outer frame: dark gutter horizontal inset. */
export const homeShellOuterClass = "px-5 lg:px-8";

/** Gutter outside max-width — mirrors footer card horizontal padding. */
export const homeShellGutterClass = "px-6 lg:px-12";

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
