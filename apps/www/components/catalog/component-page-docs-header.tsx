"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/ui/sheet";
import { SidebarToggleIcon } from "@workspace/ui/components/unlumen-ui/sidebar-toggle-icon";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import {
  catalogChromeToolbarButtonClassName,
  catalogChromeToolbarClassName,
  catalogChromeToolbarDividerClassName,
  catalogDocsHeaderClassName,
  catalogDocsHeaderInsetClassName,
} from "./catalog-preview-classes";
import { CatalogScrollArea } from "./catalog-scroll-area";

interface ComponentPageDocsHeaderProps {
  isExpanded?: boolean;
  navItems: ComponentGalleryItem[];
  title: string;
}

export function ComponentPageDocsHeader({
  isExpanded = false,
  title,
  navItems,
}: ComponentPageDocsHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          catalogDocsHeaderClassName,
          catalogDocsHeaderInsetClassName,
          "max-lg:bg-background lg:bg-transparent"
        )}
      >
        <div className={catalogChromeToolbarClassName}>
          <motion.button
            aria-label="Browse components"
            className={catalogChromeToolbarButtonClassName}
            data-sidebar-toggle="true"
            onClick={() => setOpen(true)}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <SidebarToggleIcon className="size-4" isOpen={open} />
          </motion.button>

          <span aria-hidden className={catalogChromeToolbarDividerClassName} />

          <Breadcrumb className="px-2">
            <BreadcrumbList className="gap-1.5 text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="w-[min(100vw-2rem,20rem)]" side="left">
          <SheetHeader>
            <SheetTitle>Components</SheetTitle>
          </SheetHeader>
          <CatalogScrollArea className="mt-4 max-h-[min(70dvh,24rem)]">
            <nav className="flex flex-col gap-1 pr-3">
              {navItems.map((item) => (
                <Link
                  className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                  href={item.href}
                  key={item.slug}
                  onClick={() => setOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </CatalogScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
