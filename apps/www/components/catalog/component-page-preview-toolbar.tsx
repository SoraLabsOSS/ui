"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Code2, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import {
  catalogChromeToolbarButtonClassName,
  catalogChromeToolbarClassName,
} from "./catalog-preview-classes";

interface ComponentPagePreviewToolbarProps {
  className?: string;
  isExpanded: boolean;
  onOpenSource: () => void;
  onRestart: () => void;
  onToggleExpanded: () => void;
}

export function ComponentPagePreviewToolbar({
  className,
  isExpanded,
  onRestart,
  onToggleExpanded,
  onOpenSource,
}: ComponentPagePreviewToolbarProps) {
  return (
    <div
      className={cn(
        catalogChromeToolbarClassName,
        "pointer-events-auto",
        className
      )}
    >
      <ToolbarButton
        aria-label={isExpanded ? "Collapse preview" : "Expand preview"}
        className="max-lg:hidden"
        onClick={onToggleExpanded}
      >
        {isExpanded ? (
          <Minimize2 className="size-4" />
        ) : (
          <Maximize2 className="size-4" />
        )}
      </ToolbarButton>

      <ToolbarButton aria-label="Restart animation" onClick={onRestart}>
        <RotateCcw className="size-4" />
      </ToolbarButton>

      <CommandPaletteTrigger
        className={catalogChromeToolbarButtonClassName}
        variant="icon"
      />

      <ToolbarButton aria-label="View source code" onClick={onOpenSource}>
        <Code2 className="size-4" />
      </ToolbarButton>
    </div>
  );
}

interface ToolbarButtonProps {
  "aria-label": string;
  "aria-pressed"?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}

function ToolbarButton({
  children,
  className,
  onClick,
  ...ariaProps
}: ToolbarButtonProps) {
  return (
    <motion.button
      className={cn(catalogChromeToolbarButtonClassName, className)}
      onClick={onClick}
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      {...ariaProps}
    >
      {children}
    </motion.button>
  );
}
