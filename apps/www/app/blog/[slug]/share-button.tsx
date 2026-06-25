"use client";

import { cn } from "@workspace/ui/lib/utils";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Copy } from "lucide-react";

export function BlogShareButton({ url }: { url: string }) {
  const [isChecked, onCopy] = useCopyButton(() => {
    navigator.clipboard
      .writeText(`${window.location.origin}${url}`)
      .catch(() => undefined);
  });

  return (
    <button
      className={cn(
        buttonVariants({
          color: "primary",
          size: "sm",
          className:
            "gap-1.5 border-0 [&_svg]:size-3.5 [&_svg]:text-primary-foreground/80",
        })
      )}
      onClick={onCopy}
      type="button"
    >
      {isChecked ? <Check aria-hidden /> : <Copy aria-hidden />}
      {isChecked ? "Copied" : "Copy link"}
    </button>
  );
}
