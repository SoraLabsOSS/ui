"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { RotateCcw } from "lucide-react";
import {
  Button,
  type ButtonProps,
  type buttonVariants,
} from "@/registry/ui/base/button";

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
  ...props
}: RefreshButtonProps) {
  const resolvedSize = size ?? (label ? "sm" : "icon-sm");

  return (
    <Button
      className={cn(
        "rounded-lg bg-transparent hover:bg-foreground/5 dark:hover:bg-foreground/10",
        className
      )}
      disabled={disabled}
      onClick={() => onRefresh?.()}
      size={resolvedSize}
      variant={variant}
      {...props}
    >
      <RotateCcw aria-label="restart-btn" size={iconSize} />
      {label && <span>{label}</span>}
    </Button>
  );
}
