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
        "component-page-docs flex min-w-0 flex-col [&_.fd-codeblock]:mt-2! [&_.fd-codeblock]:mb-8! [&_.prose]:w-full [&_.prose]:min-w-0 [&_.prose]:max-w-full [&_.sora-type-table]:min-w-0 [&_div:has(>table):not(.sora-type-table)]:mt-4 [&_div:has(>table):not(.sora-type-table)]:overflow-x-auto [&_h2]:mt-6 [&_h2]:mb-4 [&_h2]:scroll-mt-28 [&_h2]:text-2xl [&_h2]:text-foreground [&_h2]:tracking-tight md:[&_h2]:mt-8 md:[&_h2]:mb-5 md:[&_h2]:text-3xl lg:[&_h2]:text-4xl [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-foreground [&_h3]:text-lg md:[&_h3]:mt-7 md:[&_h3]:mb-3 md:[&_h3]:text-xl lg:[&_h3]:text-2xl [&_li]:list-disc [&_li]:pl-5 [&_li]:font-light [&_li]:text-base [&_li]:text-foreground/80 [&_li]:tracking-wide md:[&_li]:text-lg [&_p]:font-light [&_p]:text-base [&_p]:text-foreground/80 [&_p]:leading-7 [&_p]:tracking-wide md:[&_p]:text-lg md:[&_p]:leading-relaxed",
        className
      )}
    >
      {children}
    </div>
  );
}
