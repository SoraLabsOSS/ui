"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import type * as React from "react";
import { memo } from "react";
import { useDocsShellHover } from "./context";
import { useScrollActiveItemIntoView } from "./scroll-active-nearest";

export interface DocsShellNavItemProps {
  className?: string;
  href: string;
  isActive: boolean;
  isNew?: boolean;
  label: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const DocsShellNavItem = memo(function DocsShellNavItem({
  href,
  label,
  isActive,
  isNew,
  className,
  onClick,
}: DocsShellNavItemProps) {
  const { hovered, setHovered, containerRef } = useDocsShellHover();
  const isHovered = hovered === href;
  const itemRef = useScrollActiveItemIntoView(isActive);

  const opacity = isActive ? 1 : hovered === null ? 0.55 : isHovered ? 1 : 0.3;
  const x = isActive ? 8 : isHovered ? 6 : 0;

  return (
    <div className="relative">
      {isActive && (
        <motion.span
          className="pointer-events-none absolute top-1/2 left-[4px] z-[35] h-[2.5px] w-[23px] -translate-y-1/2 rounded-full"
          layoutId="docs-shell-active-indicator"
          style={{ backgroundColor: "var(--accent-pro)" }}
          transition={{ type: "spring", stiffness: 800, damping: 40 }}
        />
      )}

      <motion.span
        animate={{ width: isActive ? 0 : isHovered ? 26 : 18 }}
        className="pointer-events-none absolute top-1/2 left-0 z-0 h-px -translate-y-1/2 bg-foreground/50"
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
      />
      <motion.span className="pointer-events-none absolute top-1/4 left-0 z-0 h-px w-[13px] bg-foreground/30" />
      <motion.span className="pointer-events-none absolute top-0 left-0 z-0 h-px w-[16px] bg-foreground/30" />
      <motion.span className="pointer-events-none absolute top-3/4 left-0 z-0 h-px w-[13px] bg-foreground/30" />

      <motion.div
        animate={{ opacity, x }}
        ref={itemRef}
        style={{ transformOrigin: "left center" }}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      >
        <Link
          className={cn(
            "relative ml-2 flex select-none items-center gap-2 py-1.5 pl-4 text-sm",
            className
          )}
          href={href}
          onClick={onClick}
          onMouseEnter={() => {
            const el = itemRef.current;
            const container = containerRef.current;
            if (el && container) {
              const elRect = el.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              setHovered(href, {
                top: elRect.top - containerRect.top,
                height: elRect.height,
                left: 25,
              });
            } else {
              setHovered(href);
            }
          }}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="relative z-1 truncate">{label}</span>
          {isNew && (
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: "var(--accent-pro)" }}
            />
          )}
        </Link>
      </motion.div>
    </div>
  );
});
