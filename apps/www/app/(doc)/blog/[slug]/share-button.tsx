"use client";

import { cn } from "@workspace/ui/lib/utils";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { TextMorph } from "@/registry/primitives/texts/text-morph";

const layoutTransition = {
  type: "spring",
  bounce: 0,
  duration: 0.3,
} as const;

export function BlogShareButton({
  url,
  transition = layoutTransition,
}: {
  url: string;
  transition?: React.ComponentProps<typeof motion.button>["transition"];
}) {
  const [isChecked, onCopy] = useCopyButton(() => {
    navigator.clipboard
      .writeText(`${window.location.origin}${url}`)
      .catch(() => undefined);
  });

  const label = isChecked ? "Copied" : "Copy link";

  return (
    <button
      className={cn(
        buttonVariants({
          color: "primary",
          size: "sm",
          className:
            "shrink-0 gap-1.5 whitespace-nowrap border-0 [&_svg]:size-3.5 [&_svg]:text-primary-foreground/80",
        })
      )}
      onClick={onCopy}
      type="button"
    >
      {isChecked ? <Check aria-hidden /> : <Copy aria-hidden />}
      <motion.span
        className="inline-block"
        layout
        layoutRoot
        transition={transition}
      >
        <TextMorph as="span">{label}</TextMorph>
      </motion.span>
    </button>
  );
}
