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
        "component-page-docs flex min-w-0 flex-col [&_.fd-codeblock]:mt-2! [&_.fd-codeblock]:mb-8! [&_.prose]:w-full [&_.prose]:min-w-0 [&_.prose]:max-w-full [&_.sora-type-table]:min-w-0 [&_a:not([data-card])]:underline-offset-4 hover:[&_a:not([data-card])]:underline [&_div:has(>table):not(.sora-type-table)]:mt-4 [&_div:has(>table):not(.sora-type-table)]:overflow-x-auto [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:scroll-mt-28 [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:tracking-tight md:[&_h2]:mt-8 md:[&_h2]:mb-4 md:[&_h2]:text-2xl [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-base [&_h3]:text-foreground md:[&_h3]:mt-6 md:[&_h3]:mb-2.5 md:[&_h3]:text-lg [&_li]:my-1.5 [&_li]:text-foreground/80 [&_li]:text-sm md:[&_li]:text-base [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:text-foreground/80 [&_p]:text-sm [&_p]:leading-6 md:[&_p]:text-base md:[&_p]:leading-7 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
        className
      )}
    >
      {children}
    </div>
  );
}
