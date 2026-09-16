"use client";

import { SidebarToggleIcon } from "@workspace/ui/components/unlumen-ui/sidebar-toggle-icon";
import { cn } from "@workspace/ui/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useCatalogMenu } from "./catalog-menu-context";
import {
  catalogChromeToolbarIconClassName,
  catalogChromeToolbarSoloClassName,
  catalogChromeToolbarSoloOpenClassName,
  catalogChromeToolbarSurfaceClassName,
  catalogMenuToggleChipClassName,
  catalogMenuToggleChipOpenClassName,
  catalogMenuTogglePlainClassName,
  catalogMenuTogglePlainOpenClassName,
} from "./catalog-preview-classes";

interface CatalogMenuMorphButtonProps {
  className?: string;
  isExpanded?: boolean;
}

function CatalogMenuMorphButton({
  className,
  isExpanded = false,
}: CatalogMenuMorphButtonProps) {
  const { open, toggle } = useCatalogMenu();
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
          catalogChromeToolbarSurfaceClassName,
          open && catalogChromeToolbarSoloOpenClassName
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          isExpanded
            ? "rounded-2xl text-foreground/65 hover:text-foreground"
            : "rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
          open &&
            (isExpanded
              ? "text-foreground"
              : catalogMenuTogglePlainOpenClassName)
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

function CatalogMenuSoloButton({ className }: { className?: string }) {
  const { open, toggle } = useCatalogMenu();

  return (
    <button
      aria-expanded={open}
      aria-label={open ? "Close components menu" : "Browse components"}
      className={cn(
        catalogChromeToolbarSoloClassName,
        open && catalogChromeToolbarSoloOpenClassName,
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

function CatalogMenuStandardButton({
  className,
  variant,
}: {
  className?: string;
  variant: "chip" | "dock" | "plain";
}) {
  const { open, toggle } = useCatalogMenu();

  return (
    <button
      aria-expanded={open}
      aria-label={open ? "Close components menu" : "Browse components"}
      className={cn(
        variant === "plain" && catalogMenuTogglePlainClassName,
        variant === "plain" && open && catalogMenuTogglePlainOpenClassName,
        variant === "chip" && catalogMenuToggleChipClassName,
        variant === "chip" && open && catalogMenuToggleChipOpenClassName,
        variant === "dock" && catalogChromeToolbarIconClassName,
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

export function ComponentPageCatalogMenuButton({
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
      <CatalogMenuMorphButton className={className} isExpanded={isExpanded} />
    );
  }

  if (variant === "solo") {
    return <CatalogMenuSoloButton className={className} />;
  }

  return <CatalogMenuStandardButton className={className} variant={variant} />;
}
