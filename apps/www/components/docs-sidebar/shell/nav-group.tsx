"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import { useCallback, useId, useRef, useState } from "react";

import { useDocsShellHover } from "./context";

const MotionChevron = motion.create(ChevronRight);

export interface DocsShellNavGroupProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  label: React.ReactNode;
}

export function DocsShellNavGroup({
  label,
  children,
  defaultOpen = false,
  icon,
  className,
}: DocsShellNavGroupProps) {
  const [prevDefaultOpen, setPrevDefaultOpen] = useState(defaultOpen);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (prevDefaultOpen !== defaultOpen) {
    setPrevDefaultOpen(defaultOpen);
    setIsOpen(defaultOpen);
  }

  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { setHovered, containerRef } = useDocsShellHover();

  const handleMouseEnter = useCallback(() => {
    const el = buttonRef.current;
    const container = containerRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setHovered(id, {
        top: elRect.top - containerRect.top,
        height: elRect.height,
        left: 0,
      });
    } else {
      setHovered(id);
    }
  }, [id, setHovered, containerRef]);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, [setHovered]);

  return (
    <div className={cn("flex flex-col", className)}>
      <button
        className="group relative z-1 flex w-full items-center gap-1.5 py-1.5 pr-2 text-left select-none"
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={buttonRef}
        type="button"
      >
        {icon ? (
          <>
            <span className="text-foreground/35 shrink-0 [&_svg]:size-3.5">
              {icon}
            </span>
            <span className="text-foreground/45 group-hover:text-foreground/70 flex-1 text-sm transition-colors duration-150">
              {label}
            </span>
            <MotionChevron
              animate={{ rotate: isOpen ? 90 : 0 }}
              className="text-foreground/25 mr-1 shrink-0"
              size={14}
              strokeWidth={2.5}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </>
        ) : (
          <>
            <MotionChevron
              animate={{ rotate: isOpen ? 90 : 0 }}
              className="text-foreground/35 shrink-0"
              size={11}
              strokeWidth={2.5}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
            <span className="text-foreground/45 group-hover:text-foreground/70 text-sm transition-colors duration-150">
              {label}
            </span>
          </>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <div className="flex flex-col pl-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
