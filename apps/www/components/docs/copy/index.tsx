"use client";

import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import { useControlledState } from "@/registry/hooks/use-controlled-state";
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

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn(className)}
      data-slot="copy-button"
      onClick={handleCopy}
      size={size}
      variant={variant}
      {...props}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          data-slot="copy-button-icon"
          exit={{ scale: 0, opacity: 0.4, filter: "blur(4px)" }}
          initial={{ scale: 0, opacity: 0.4, filter: "blur(4px)" }}
          key={isCopied ? "check" : "copy"}
          transition={{ duration: 0.25 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

export { CopyButton, type CopyButtonProps };
