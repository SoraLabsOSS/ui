import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

interface ComponentPageDocsProps {
  children: ReactNode;
  className?: string;
}

export function ComponentPageDocs({
  children,
  className,
}: ComponentPageDocsProps) {
  return (
    <div
      className={cn(
        "component-page-docs fade-in slide-in-from-bottom-2 flex animate-in flex-col fill-mode-both duration-500 [&_.fd-codeblock]:my-4 [&_h2]:mt-10 [&_h2]:mb-5 [&_h2]:scroll-mt-28 [&_h2]:font-medium [&_h2]:text-3xl [&_h2]:text-foreground [&_h2]:tracking-tight [&_h2]:first:mt-0 [&_h2]:md:text-4xl [&_h3]:mt-7 [&_h3]:mb-3 [&_h3]:font-medium [&_h3]:text-2xl [&_h3]:text-foreground [&_li]:text-foreground/80 [&_p]:text-foreground/80 [&_p]:leading-relaxed",
        className
      )}
    >
      {children}
    </div>
  );
}
