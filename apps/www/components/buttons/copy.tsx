"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { CopyIcon } from "@/registry/icons/copy";
import { Button, type ButtonProps } from "@/registry/ui/base/button";

type CopyButtonProps = Omit<ButtonProps, "children"> & {
  content?: string;
  delay?: number;
  onCopy?: (content: string) => void;
  isCopied?: boolean;
  onCopyChange?: (isCopied: boolean) => void;
};

function CopyButton({
  content,
  className,
  size = "icon-sm",
  variant = "ghost",
  delay = 3000,
  onClick,
  onCopy,
  isCopied,
  onCopyChange,
  ...props
}: CopyButtonProps) {
  const [localIsCopied, setLocalIsCopied] = useState(isCopied ?? false);

  useEffect(() => {
    setLocalIsCopied(isCopied ?? false);
  }, [isCopied]);

  const handleIsCopied = useCallback(
    (isCopied: boolean) => {
      setLocalIsCopied(isCopied);
      onCopyChange?.(isCopied);
    },
    [onCopyChange]
  );

  const handleCopy = useCallback(
    (e: Parameters<NonNullable<ButtonProps["onClick"]>>[0]) => {
      if (isCopied) {
        return;
      }
      if (content) {
        navigator.clipboard
          .writeText(content)
          .then(() => {
            handleIsCopied(true);
            setTimeout(() => handleIsCopied(false), delay);
            onCopy?.(content);
          })
          .catch((error) => {
            console.error("Error copying command", error);
          });
      }
      onClick?.(e);
    },
    [isCopied, content, delay, onClick, onCopy, handleIsCopied]
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
      <CopyIcon animate={localIsCopied} size={16} />
    </Button>
  );
}

export { CopyButton, type CopyButtonProps };
