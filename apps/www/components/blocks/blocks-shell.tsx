"use client";

import type { ReactNode } from "react";

import type { ComponentGalleryItem } from "@/lib/registry/types";

import { BlocksMenuProvider } from "./blocks-menu-context";
import { BlocksMobileChromeProvider } from "./blocks-mobile-chrome-context";
import { ComponentPageBlocksMobileMenuLayer } from "./blocks-mobile-menu-layer";
import { ComponentPageBlocksSidebar } from "./blocks-sidebar";

interface ComponentPageBlocksShellProps {
  children: ReactNode;
  navItems: ComponentGalleryItem[];
}

export function ComponentPageBlocksShell({
  children,
  navItems,
}: ComponentPageBlocksShellProps) {
  return (
    <BlocksMenuProvider navItems={navItems}>
      <BlocksMobileChromeProvider>
        <ComponentPageBlocksMobileMenuLayer />
        <ComponentPageBlocksSidebar />
        <div className="min-h-0 min-w-0 flex-1">{children}</div>
      </BlocksMobileChromeProvider>
    </BlocksMenuProvider>
  );
}
