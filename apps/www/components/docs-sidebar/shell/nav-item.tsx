'use client';

import type * as React from 'react';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@workspace/ui/lib/utils';
import { useDocsShellHover } from './context';
import { useScrollActiveItemIntoView } from './scroll-active-nearest';

export interface DocsShellNavItemProps {
  href: string;
  label: React.ReactNode;
  isActive: boolean;
  isNew?: boolean;
  className?: string;
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

  const opacity = isActive
    ? 1
    : hovered !== null
      ? isHovered
        ? 1
        : 0.3
      : 0.55;
  const x = isActive ? 8 : isHovered ? 6 : 0;

  return (
    <div className="relative">
      {isActive && (
        <motion.span
          layoutId="docs-shell-active-indicator"
          className="pointer-events-none absolute left-[4px] top-1/2 z-[35] h-[2.5px] w-[23px] -translate-y-1/2 rounded-full"
          style={{ backgroundColor: 'var(--accent-pro)' }}
          transition={{ type: 'spring', stiffness: 800, damping: 40 }}
        />
      )}

      <motion.span
        className="pointer-events-none absolute left-0 top-1/2 z-0 -translate-y-1/2 h-px bg-foreground/50"
        animate={{ width: isActive ? 0 : isHovered ? 26 : 18 }}
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      />
      <motion.span className="pointer-events-none absolute left-0 top-1/4 z-0 h-px w-[13px] bg-foreground/30" />
      <motion.span className="pointer-events-none absolute left-0 top-0 z-0 h-px w-[16px] bg-foreground/30" />
      <motion.span className="pointer-events-none absolute left-0 top-3/4 z-0 h-px w-[13px] bg-foreground/30" />

      <motion.div
        ref={itemRef}
        animate={{ opacity, x }}
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        style={{ transformOrigin: 'left center' }}
      >
        <Link
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
          className={cn(
            'relative flex items-center gap-2 ml-2 pl-4 py-1.5 text-sm select-none',
            className,
          )}
        >
          <span className="relative z-1 truncate">{label}</span>
          {isNew && (
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: 'var(--accent-pro)' }}
            />
          )}
        </Link>
      </motion.div>
    </div>
  );
});
