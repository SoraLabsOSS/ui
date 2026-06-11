"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  Code2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { motion } from "motion/react";
import {
  catalogChromeToolbarButtonClassName,
  catalogChromeToolbarClassName,
  catalogChromeToolbarDividerClassName,
} from "./catalog-preview-classes";

interface ComponentPagePreviewToolbarProps {
  className?: string;
  controlsOpen: boolean;
  isExpanded: boolean;
  onOpenSource: () => void;
  onRestart: () => void;
  onToggleControls: () => void;
  onToggleExpanded: () => void;
}

export function ComponentPagePreviewToolbar({
  className,
  controlsOpen,
  isExpanded,
  onToggleControls,
  onRestart,
  onToggleExpanded,
  onOpenSource,
}: ComponentPagePreviewToolbarProps) {
  return (
    <div className={cn(catalogChromeToolbarClassName, className)}>
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

      <ToolbarButton
        aria-label={controlsOpen ? "Hide controls" : "Show controls"}
        aria-pressed={controlsOpen}
        onClick={onToggleControls}
      >
        <Settings2 className={cn("size-4", controlsOpen && "text-primary")} />
      </ToolbarButton>

      <span aria-hidden className={catalogChromeToolbarDividerClassName} />

      <ToolbarButton aria-label="View source code" onClick={onOpenSource}>
        <Code2 className="size-4 text-primary" />
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
