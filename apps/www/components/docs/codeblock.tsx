"use client";

import {
  ScrollArea,
  ScrollBar,
  ScrollViewport,
} from "@workspace/ui/components/ui/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import type { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import {
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useRef,
  useState,
} from "react";
import { CopyButton } from "@/components/buttons/copy";

export type CodeBlockProps = HTMLAttributes<HTMLElement> & {
  icon?: ReactNode;
  allowCopy?: boolean;
  viewportProps?: ScrollAreaPrimitive.ScrollAreaViewportProps;
  onCopy?: () => void;
};

export const Pre = ({
  className,
  ref,
  ...props
}: HTMLAttributes<HTMLPreElement> & {
  ref?: Ref<HTMLPreElement>;
}) => (
  <pre
    className={cn("p-4 focus-visible:outline-none", className)}
    ref={ref}
    {...props}
  >
    {props.children}
  </pre>
);

Pre.displayName = "Pre";

export const CodeBlock = ({
  title,
  allowCopy = true,
  icon,
  viewportProps,
  onCopy: onCopyEvent,
  ref,
  ...props
}: CodeBlockProps & { ref?: Ref<HTMLElement> }) => {
  const [isCopied, setIsCopied] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const onCopy = useCallback(() => {
    const pre = areaRef.current?.getElementsByTagName("pre").item(0);

    if (!pre) {
      return;
    }

    const clone = pre.cloneNode(true) as HTMLElement;
    for (const node of clone.querySelectorAll(".nd-copy-ignore")) {
      node.remove();
    }

    navigator.clipboard.writeText(clone.textContent ?? "").then(() => {
      setIsCopied(true);
      onCopyEvent?.();
      setTimeout(() => setIsCopied(false), 3000);
    });
  }, [onCopyEvent]);

  let iconNode: ReactNode = null;
  if (typeof icon === "string") {
    iconNode = (
      <div
        className="text-muted-foreground/70 [&_svg]:size-3.5"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: icon SVG markup
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    );
  } else if (icon) {
    iconNode = (
      <div className="text-muted-foreground/70 [&_svg]:size-3.5">{icon}</div>
    );
  }

  return (
    <figure
      ref={ref}
      {...props}
      className={cn(
        "not-prose group fd-codeblock relative mt-2 mb-8 overflow-hidden rounded-xl border border-border/60 text-sm",
        props.className
      )}
    >
      {title ? (
        <div className="flex h-10 flex-row items-center gap-2 border-border/50 border-b pr-3 pl-4 backdrop-blur-sm">
          {iconNode}
          <figcaption className="flex-1 truncate font-medium font-mono text-muted-foreground text-xs">
            {title}
          </figcaption>
          {allowCopy ? (
            <CopyButton
              className="-me-1 bg-transparent hover:bg-foreground/5 dark:hover:bg-foreground/10"
              isCopied={isCopied}
              onClick={onCopy}
              size="icon-sm"
              variant="ghost"
            />
          ) : null}
        </div>
      ) : (
        allowCopy && (
          <div className="absolute top-2 right-2 z-[2]">
            <CopyButton
              className="border border-border/40 bg-accent/80 backdrop-blur-sm hover:bg-accent"
              isCopied={isCopied}
              onClick={onCopy}
              size="icon-sm"
              variant="ghost"
            />
          </div>
        )
      )}
      <div className={cn("p-1.5", title && "pt-1.5")}>
        <ScrollArea dir="ltr" ref={areaRef}>
          <ScrollViewport
            {...viewportProps}
            className={cn(
              "[&_code]:!text-[13px] [&_code_.line]:!px-0 h-auto max-h-[600px] w-full rounded-lg bg-surface",
              viewportProps?.className
            )}
            data-slot="codeblock-viewport"
          >
            {props.children}
          </ScrollViewport>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </figure>
  );
};

CodeBlock.displayName = "CodeBlock";
