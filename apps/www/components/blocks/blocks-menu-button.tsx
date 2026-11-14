"use client";

import { SidebarToggleIcon } from "@workspace/ui/components/sidebar-toggle-icon";
import { cn } from "@workspace/ui/lib/utils";
import { motion, useReducedMotion } from "motion/react";

import { useBlocksMenu } from "./blocks-menu-context";
import {
  blocksChromeToolbarIconClassName,
  blocksChromeToolbarSoloClassName,
  blocksChromeToolbarSoloOpenClassName,
  blocksChromeToolbarSurfaceClassName,
  blocksMenuToggleChipClassName,
  blocksMenuToggleChipOpenClassName,
  blocksMenuTogglePlainClassName,
  blocksMenuTogglePlainOpenClassName,
} from "./blocks-preview-classes";

interface BlocksMenuMorphButtonProps {
  className?: string;
  isExpanded?: boolean;
}

function BlocksMenuMorphButton({
  className,
  isExpanded = false,
}: BlocksMenuMorphButtonProps) {
  const { open, toggle } = useBlocksMenu();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center",
        className
      )}
    >
      {/* Background dock surface that morphs in underneath when preview is expanded */}
      <motion.div
        animate={{
          opacity: isExpanded ? 1 : 0,
          scale: isExpanded ? 1 : 0.88,
        }}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          blocksChromeToolbarSurfaceClassName,
          open && blocksChromeToolbarSoloOpenClassName
        )}
        initial={false}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 0.28,
                ease: [0.32, 0.72, 0, 1],
              }
        }
      />

      <button
        aria-expanded={open}
        aria-label={open ? "Close components menu" : "Browse components"}
        className={cn(
          "relative z-10 flex size-full items-center justify-center transition-colors duration-200 active:scale-95",
          "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
          isExpanded
            ? "text-foreground/65 hover:text-foreground rounded-2xl"
            : "rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
          open &&
            (isExpanded
              ? "text-foreground"
              : blocksMenuTogglePlainOpenClassName)
        )}
        data-sidebar-toggle="true"
        onClick={toggle}
        type="button"
      >
        <SidebarToggleIcon className="size-5" isOpen={open} />
      </button>
    </div>
  );
}

function BlocksMenuSoloButton({ className }: { className?: string }) {
  const { open, toggle } = useBlocksMenu();

  return (
    <button
      aria-expanded={open}
      aria-label={open ? "Close components menu" : "Browse components"}
      className={cn(
        blocksChromeToolbarSoloClassName,
        open && blocksChromeToolbarSoloOpenClassName,
        className
      )}
      data-sidebar-toggle="true"
      onClick={toggle}
      type="button"
    >
      <SidebarToggleIcon className="size-5" isOpen={open} />
    </button>
  );
}

function BlocksMenuStandardButton({
  className,
  variant,
}: {
  className?: string;
  variant: "chip" | "dock" | "plain";
}) {
  const { open, toggle } = useBlocksMenu();

  return (
    <button
      aria-expanded={open}
      aria-label={open ? "Close components menu" : "Browse components"}
      className={cn(
        variant === "plain" && blocksMenuTogglePlainClassName,
        variant === "plain" && open && blocksMenuTogglePlainOpenClassName,
        variant === "chip" && blocksMenuToggleChipClassName,
        variant === "chip" && open && blocksMenuToggleChipOpenClassName,
        variant === "dock" && blocksChromeToolbarIconClassName,
        className
      )}
      data-sidebar-toggle="true"
      onClick={toggle}
      type="button"
    >
      <SidebarToggleIcon
        className={cn(
          variant === "plain" && "size-6",
          variant !== "plain" && "size-5"
        )}
        isOpen={open}
      />
    </button>
  );
}

export function ComponentPageBlocksMenuButton({
  variant = "chip",
  isExpanded = false,
  className,
}: {
  /** `plain` = desktop icon only; `solo` = mobile dock; `chip` / `dock` = legacy surfaces; `morph` = animated fly-up dock */
  variant?: "chip" | "solo" | "dock" | "plain" | "morph";
  isExpanded?: boolean;
  className?: string;
}) {
  if (variant === "morph") {
    return (
      <BlocksMenuMorphButton className={className} isExpanded={isExpanded} />
    );
  }

  if (variant === "solo") {
    return <BlocksMenuSoloButton className={className} />;
  }

  return <BlocksMenuStandardButton className={className} variant={variant} />;
}
