"use client";

import { cn } from "@workspace/ui/lib/utils";
import { CodeXml, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import {
  catalogChromeToolbarCellActiveClassName,
  catalogChromeToolbarCellClassName,
  catalogChromeToolbarClassName,
  catalogChromeToolbarIconClassName,
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

export function PreviewToolbarCell({
  active,
  children,
  className,
}: {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        catalogChromeToolbarCellClassName,
        active && catalogChromeToolbarCellActiveClassName,
        className
      )}
    >
      {children}
    </div>
  );
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
        <PreviewToolbarCell active={isSourceOpen}>
          <ToolbarIconButton
            aria-label={isSourceOpen ? "Hide source" : "View source"}
            aria-pressed={isSourceOpen}
            onClick={onToggleSource}
          >
            <CodeXml />
          </ToolbarIconButton>
        </PreviewToolbarCell>
      ) : null}

      <PreviewToolbarCell active={isExpanded} className="max-lg:hidden">
        <ToolbarIconButton
          aria-label={isExpanded ? "Collapse preview" : "Expand preview"}
          onClick={onToggleExpanded}
        >
          {isExpanded ? <Minimize2 /> : <Maximize2 />}
        </ToolbarIconButton>
      </PreviewToolbarCell>

      <PreviewToolbarCell>
        <ToolbarIconButton aria-label="Restart animation" onClick={onRestart}>
          <RotateCcw />
        </ToolbarIconButton>
      </PreviewToolbarCell>

      <PreviewToolbarCell>
        <CommandPaletteTrigger
          className={catalogChromeToolbarIconClassName}
          variant="icon"
        />
      </PreviewToolbarCell>
    </div>
  );
}

interface ToolbarIconButtonProps {
  "aria-label": string;
  "aria-pressed"?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

function ToolbarIconButton({
  children,
  onClick,
  ...ariaProps
}: ToolbarIconButtonProps) {
  return (
    <button
      className={catalogChromeToolbarIconClassName}
      onClick={onClick}
      type="button"
      {...ariaProps}
    >
      {children}
    </button>
  );
}
