import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

const legalProseClassName = cn(
  "prose dark:prose-invert max-w-none",
  "prose-headings:font-semibold prose-headings:tracking-tight",
  "prose-li:text-foreground/80 prose-p:text-foreground/80",
  "prose-a:text-foreground prose-a:underline-offset-4 hover:prose-a:underline"
);

export function LegalArticle({ children }: { children: ReactNode }) {
  return <article className={legalProseClassName}>{children}</article>;
}
