"use client";

import { cn } from "@workspace/ui/lib/utils";
import { MessageCircleIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
  isAskAiPath,
} from "@/components/ai/search";
import { buttonVariants } from "@/components/ui/button";

function AISearchSiteTrigger() {
  const pathname = usePathname();

  if (!isAskAiPath(pathname)) {
    return null;
  }

  return (
    <AISearchTrigger
      className={cn(
        buttonVariants({
          variant: "secondary",
          className: "rounded-2xl text-fd-muted-foreground",
        })
      )}
      position="float"
    >
      <MessageCircleIcon className="size-4.5" />
      Ask AI
    </AISearchTrigger>
  );
}

/** Single Ask AI instance for the whole app — lives in the root layout.
 * Hidden on home, settings, and auth. */
export function AISearchRoot() {
  return (
    <AISearch>
      <AISearchPanel />
      <AISearchSiteTrigger />
    </AISearch>
  );
}
