"use client";

import { buttonVariants } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import { MessageCircleIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { isAskAiPath } from "./is-ask-ai-path";
import { aiChatOpenStore } from "./open-store";

export interface AskAiNavTriggerProps {
  /**
   * Extra classes merged into the trigger (breakpoint visibility, spacing).
   */
  className?: string;
}

/**
 * Navbar entry point for Ask AI, placed next to the search bar on desktop.
 *
 * Shares the `open` state with the chat panel through `aiChatOpenStore`, so
 * opening it here also hides the floating trigger. Deliberately does not
 * import `search.tsx` to keep the AI SDK out of the navbar bundle.
 */
export function AskAiNavTrigger({ className }: AskAiNavTriggerProps) {
  const pathname = usePathname();
  const open = useSyncExternalStore(
    aiChatOpenStore.subscribe,
    aiChatOpenStore.getOpen,
    aiChatOpenStore.getServerOpen
  );

  if (!isAskAiPath(pathname)) {
    return null;
  }

  return (
    <button
      aria-expanded={open}
      aria-label="Ask AI"
      className={cn(
        buttonVariants({
          variant: "secondary",
          className:
            "h-8 gap-2 rounded-md px-3 font-normal text-fd-muted-foreground transition-colors duration-200 ease-in-out hover:bg-secondary/70",
        }),
        open &&
          "bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90",
        className
      )}
      data-state={open ? "open" : "closed"}
      onClick={() => aiChatOpenStore.setOpen(!open)}
      type="button"
    >
      <MessageCircleIcon className="size-4" />
      Ask AI
    </button>
  );
}
