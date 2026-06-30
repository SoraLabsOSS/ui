"use client";

import { cn } from "@workspace/ui/lib/utils";
import { CodeXml, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import { setThemeWithTransition } from "@/lib/theme/set-theme-with-transition";
import {
  catalogChromeToolbarCellActiveClassName,
  catalogChromeToolbarCellClassName,
  catalogChromeToolbarClassName,
  catalogChromeToolbarIconClassName,
} from "./catalog-preview-classes";
import { ThemeToggleDarkIcon, ThemeToggleLightIcon } from "./theme-toggle-icon";

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

      <PreviewToolbarThemeToggle />

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

function PreviewToolbarThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleToggle = useCallback(() => {
    setThemeWithTransition(setTheme, isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  if (!isClient) {
    return null;
  }

  return (
    <PreviewToolbarCell>
      <button
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={catalogChromeToolbarIconClassName}
        onClick={handleToggle}
        type="button"
      >
        <span className="relative block size-4">
          <ThemeToggleLightIcon
            className={cn(
              "absolute inset-0 transition-opacity duration-200",
              isDark ? "opacity-0" : "opacity-100"
            )}
          />
          <ThemeToggleDarkIcon
            className={cn(
              "absolute inset-0 transition-opacity duration-200",
              isDark ? "opacity-100" : "opacity-0"
            )}
          />
        </span>
      </button>
    </PreviewToolbarCell>
  );
}
