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
        "component-page-docs fade-in slide-in-from-bottom-2 flex min-w-0 animate-in flex-col fill-mode-both duration-500 [&_.fd-codeblock]:mt-2! [&_.fd-codeblock]:mb-8! [&_.prose]:w-full [&_.prose]:min-w-0 [&_.prose]:max-w-full [&_div:has(>table)]:mt-4 [&_h2]:mt-8 [&_h2]:mb-5 [&_h2]:scroll-mt-28 [&_h2]:text-4xl [&_h2]:text-foreground [&_h2]:tracking-tight [&_h3]:mt-7 [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:text-foreground [&_li]:list-disc [&_li]:pl-5 [&_li]:font-light [&_li]:text-foreground/80 [&_li]:text-lg [&_li]:tracking-wide [&_p]:font-light [&_p]:text-foreground/80 [&_p]:text-lg [&_p]:leading-relaxed [&_p]:tracking-wide [&_table]:w-full [&_table]:max-w-full [&_table]:table-fixed [&_table]:whitespace-normal [&_td]:whitespace-normal [&_td]:break-words [&_th]:whitespace-normal",
        className
      )}
    >
      {children}
    </div>
  );
}
