import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

interface ComponentPageHeadingProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function ComponentPageHeading({
  children,
  className,
  id,
}: ComponentPageHeadingProps) {
  return (
    <h2
      className={cn(
        "mt-10 mb-5 scroll-mt-28 font-medium text-3xl text-foreground tracking-tight first:mt-0 md:text-4xl",
        className
      )}
      id={id}
    >
      {children}
    </h2>
  );
}
