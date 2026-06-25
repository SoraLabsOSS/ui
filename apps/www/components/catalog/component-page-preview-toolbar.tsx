"use client";

import { cn } from "@workspace/ui/lib/utils";
import { CodeXml, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import {
  catalogChromeToolbarButtonClassName,
  catalogChromeToolbarClassName,
} from "./catalog-preview-classes";

interface ComponentPagePreviewToolbarProps {
  className?: string;
  hasSourceCode?: boolean;
  isExpanded: boolean;
  isSourceOpen?: boolean;
  onRestart: () => void;
  onToggleExpanded: () => void;
  onToggleSource?: () => void;
}

export function ComponentPagePreviewToolbar({
  className,
  hasSourceCode = false,
  isExpanded,
  isSourceOpen = false,
  onRestart,
  onToggleExpanded,
  onToggleSource,
}: ComponentPagePreviewToolbarProps) {
  return (
    <div
      className={cn(
        catalogChromeToolbarClassName,
        "pointer-events-auto",
        className
      )}
    >
      {hasSourceCode && onToggleSource ? (
        <ToolbarButton
          aria-label={isSourceOpen ? "Hide source" : "View source"}
          aria-pressed={isSourceOpen}
          className={cn(
            isSourceOpen &&
              "bg-foreground text-background hover:bg-foreground/90 hover:text-background max-lg:text-background dark:bg-zinc-100 dark:text-zinc-900 max-lg:dark:text-zinc-900 dark:hover:bg-zinc-100/90"
          )}
          onClick={onToggleSource}
        >
          <CodeXml className="size-4" />
        </ToolbarButton>
      ) : null}

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
