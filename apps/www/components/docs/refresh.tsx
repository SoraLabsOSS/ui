"use client";

import {
  Button,
  type ButtonProps,
  type buttonVariants,
} from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { RotateCcw } from "lucide-react";

export interface RefreshButtonProps
  extends Omit<ButtonProps, "children" | "onClick">,
    VariantProps<typeof buttonVariants> {
  /** Icon size in px. @default 14 */
  iconSize?: number;
  /** Optional text label displayed next to the icon. */
  label?: string;
  /** Called on click. Can be async. */
  onRefresh?: () => void | Promise<void>;
}

export function RefreshButton({
  className,
  variant = "ghost",
  size,
  onRefresh,
  iconSize = 14,
  label,
  disabled,
  title = "Reload preview",
  "aria-label": ariaLabel = "Reload preview",
  ...props
}: RefreshButtonProps) {
  const resolvedSize = size ?? (label ? "sm" : "icon-sm");

  return (
    <Button
      aria-label={ariaLabel}
      className={cn(
        "rounded-lg bg-transparent hover:bg-foreground/5 dark:hover:bg-foreground/10",
        className
      )}
      disabled={disabled}
      onClick={() => onRefresh?.()}
      size={resolvedSize}
      title={title}
      variant={variant}
      {...props}
    >
      <RotateCcw size={iconSize} />
      {label && <span>{label}</span>}
    </Button>
  );
}
