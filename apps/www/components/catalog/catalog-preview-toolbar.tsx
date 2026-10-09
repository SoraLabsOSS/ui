"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  CodeXml,
  ExternalLink,
  Loader,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import { setThemeWithTransition } from "@/lib/theme-transition";
import {
  catalogChromeToolbarCellActiveClassName,
  catalogChromeToolbarCellClassName,
  catalogChromeToolbarClassName,
  catalogChromeToolbarIconClassName,
} from "./catalog-preview-classes";
import { ThemeToggleDarkIcon, ThemeToggleLightIcon } from "./theme-toggle-icon";

interface ComponentPagePreviewToolbarProps {
  className?: string;
  exampleUrl?: string;
  hasSourceCode?: boolean;
  isExpanded?: boolean;
  isLoadingPreview?: boolean;
  isSourceLoading?: boolean;
  isSourceOpen?: boolean;
  onRestart?: () => void;
  onToggleExpanded?: () => void;
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

function resolveSourceLabel(isLoading: boolean, isOpen: boolean) {
  if (isLoading) {
    return "Loading source code...";
  }
  return isOpen ? "Hide source code" : "View source code";
}

function PreviewToolbarExternalLinkButton({
  exampleUrl,
}: {
  exampleUrl?: string;
}) {
  return (
    <PreviewToolbarCell>
      {exampleUrl ? (
        <a
          aria-label="Open preview in new tab"
          className={catalogChromeToolbarIconClassName}
          href={exampleUrl}
          rel="noreferrer"
          target="_blank"
          title="Open full page preview in new tab"
        >
          <ExternalLink />
        </a>
      ) : (
        <ToolbarIconButton
          aria-label="Open preview in new tab"
          disabled
          title="Open preview in new tab"
        >
          <ExternalLink />
        </ToolbarIconButton>
      )}
    </PreviewToolbarCell>
  );
}

function PreviewToolbarSourceButton({
  isLoading,
  isOpen,
  onToggle,
}: {
  isLoading?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const label = resolveSourceLabel(Boolean(isLoading), Boolean(isOpen));

  return (
    <PreviewToolbarCell active={isOpen}>
      <ToolbarIconButton
        aria-label={label}
        aria-pressed={isOpen}
        disabled={isLoading || !onToggle}
        onClick={onToggle}
        title={label}
      >
        {isLoading ? (
          <Loader className="animate-spin text-current" />
        ) : (
          <CodeXml />
        )}
      </ToolbarIconButton>
    </PreviewToolbarCell>
  );
}

function PreviewToolbarRestartButton({
  isLoading,
  onRestart,
}: {
  isLoading?: boolean;
  onRestart?: () => void;
}) {
  return (
    <PreviewToolbarCell>
      <ToolbarIconButton
        aria-label="Restart animation"
        disabled={isLoading || !onRestart}
        onClick={onRestart}
        title="Restart animation"
      >
        <RotateCcw />
      </ToolbarIconButton>
    </PreviewToolbarCell>
  );
}

export function ComponentPagePreviewToolbar({
  className,
  exampleUrl,
  hasSourceCode: _hasSourceCode = false,
  isExpanded = false,
  isLoadingPreview = false,
  isSourceLoading = false,
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
      <PreviewToolbarExternalLinkButton exampleUrl={exampleUrl} />

      <PreviewToolbarSourceButton
        isLoading={isSourceLoading}
        isOpen={isSourceOpen}
        onToggle={onToggleSource}
      />

      <PreviewToolbarCell active={isExpanded} className="max-lg:hidden">
        <ToolbarIconButton
          aria-label={isExpanded ? "Collapse preview" : "Expand preview"}
          disabled={!onToggleExpanded}
          onClick={onToggleExpanded}
          title={
            isExpanded
              ? "Collapse view (⌘J / Ctrl+J)"
              : "Maximize view (⌘J / Ctrl+J)"
          }
        >
          {isExpanded ? <Minimize2 /> : <Maximize2 />}
        </ToolbarIconButton>
      </PreviewToolbarCell>

      <PreviewToolbarRestartButton
        isLoading={isLoadingPreview}
        onRestart={onRestart}
      />

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
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}

function ToolbarIconButton({
  children,
  disabled,
  onClick,
  title,
  ...ariaProps
}: ToolbarIconButtonProps) {
  return (
    <button
      className={cn(
        catalogChromeToolbarIconClassName,
        disabled && "pointer-events-none opacity-60"
      )}
      disabled={disabled}
      onClick={onClick}
      title={title}
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
