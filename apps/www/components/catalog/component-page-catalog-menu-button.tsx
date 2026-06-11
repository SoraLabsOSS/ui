"use client";

import { SidebarToggleIcon } from "@workspace/ui/components/unlumen-ui/sidebar-toggle-icon";
import { motion } from "motion/react";
import { useCatalogMenu } from "./catalog-menu-context";
import { catalogChromeToolbarButtonClassName } from "./catalog-preview-classes";

export function ComponentPageCatalogMenuButton() {
  const { open, toggle } = useCatalogMenu();

  return (
    <motion.button
      aria-expanded={open}
      aria-label={open ? "Close components menu" : "Browse components"}
      className={catalogChromeToolbarButtonClassName}
      data-sidebar-toggle="true"
      onClick={toggle}
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <SidebarToggleIcon className="size-5" isOpen={open} />
    </motion.button>
  );
}
