"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useCallback } from "react";
import { useControlledState } from "@/registry/hooks/use-controlled-state";
import { CopyIcon } from "@/registry/icons/copy";
import { Button, type ButtonProps } from "@/registry/ui/base/button";

type CopyButtonProps = Omit<ButtonProps, "children"> & {
  content: string;
  copied?: boolean;
  onCopiedChange?: (copied: boolean, content?: string) => void;
  delay?: number;
};

function CopyButton({
  className,
  content,
  copied,
  onCopiedChange,
  onClick,
  variant = "ghost",
  size = "icon-sm",
  delay = 3000,
  ...props
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useControlledState({
    value: copied,
    onChange: onCopiedChange,
  });

  const handleCopy = useCallback(
    (e: Parameters<NonNullable<ButtonProps["onClick"]>>[0]) => {
      onClick?.(e);
      if (isCopied) {
        return;
      }
      if (content) {
        navigator.clipboard
          .writeText(content)
          .then(() => {
            setIsCopied(true);
            onCopiedChange?.(true, content);
            setTimeout(() => {
              setIsCopied(false);
              onCopiedChange?.(false);
            }, delay);
          })
          .catch((error) => {
            console.error("Error copying command", error);
          });
      }
    },
    [onClick, isCopied, content, setIsCopied, onCopiedChange, delay]
  );

  return (
    <Button
      className={cn(className)}
      data-slot="copy-button"
      onClick={handleCopy}
      size={size}
      variant={variant}
      {...props}
    >
      <CopyIcon animate={isCopied} size={16} />
    </Button>
  );
}

export { CopyButton, type CopyButtonProps };
