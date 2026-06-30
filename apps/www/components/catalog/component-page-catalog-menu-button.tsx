"use client";

import { SidebarToggleIcon } from "@workspace/ui/components/unlumen-ui/sidebar-toggle-icon";
import { cn } from "@workspace/ui/lib/utils";
import { useCatalogMenu } from "./catalog-menu-context";
import {
  catalogChromeToolbarIconClassName,
  catalogChromeToolbarSoloClassName,
  catalogChromeToolbarSoloOpenClassName,
  catalogMenuToggleChipClassName,
  catalogMenuToggleChipOpenClassName,
  catalogMenuTogglePlainClassName,
  catalogMenuTogglePlainOpenClassName,
} from "./catalog-preview-classes";

export function ComponentPageCatalogMenuButton({
  variant = "chip",
}: {
  /** `plain` = desktop icon only; `solo` = mobile dock; `chip` / `dock` = legacy surfaces */
  variant?: "chip" | "solo" | "dock" | "plain";
}) {
  const { open, toggle } = useCatalogMenu();

  if (variant === "solo") {
    return (
      <button
        aria-expanded={open}
        aria-label={open ? "Close components menu" : "Browse components"}
        className={cn(
          catalogChromeToolbarSoloClassName,
          open && catalogChromeToolbarSoloOpenClassName
        )}
        data-sidebar-toggle="true"
        onClick={toggle}
        type="button"
      >
        <SidebarToggleIcon className="size-4" isOpen={open} />
      </button>
    );
  }

  return (
    <button
      aria-expanded={open}
      aria-label={open ? "Close components menu" : "Browse components"}
      className={cn(
        variant === "plain" && catalogMenuTogglePlainClassName,
        variant === "plain" && open && catalogMenuTogglePlainOpenClassName,
        variant === "chip" && catalogMenuToggleChipClassName,
        variant === "chip" && open && catalogMenuToggleChipOpenClassName,
        variant === "dock" && catalogChromeToolbarIconClassName
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
