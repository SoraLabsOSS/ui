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
  ref?: RefObject<HTMLPreElement | null>;
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
}: CodeBlockProps & { ref?: RefObject<HTMLElement | null> }) => {
  const [isCopied, setIsCopied] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const onCopy = useCallback(() => {
    const pre = areaRef.current?.getElementsByTagName("pre").item(0);

    if (!pre) {
      return;
    }

    const clone = pre.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".nd-copy-ignore").forEach((node) => {
      node.remove();
    });

    void navigator.clipboard.writeText(clone.textContent ?? "").then(() => {
      setIsCopied(true);
      onCopyEvent?.();
      setTimeout(() => setIsCopied(false), 3000);
    });
  }, [onCopyEvent]);

  return (
    <figure
      ref={ref}
      {...props}
      className={cn(
        "not-prose group fd-codeblock [&.shiki]:!bg-accent relative my-6 overflow-hidden rounded-xl text-sm",
        props.className
      )}
    >
      {title ? (
        <div className="flex h-10 flex-row items-center gap-2 pr-4 pl-4">
          {icon ? (
            <div
              className="text-muted-foreground [&_svg]:size-3.5"
              dangerouslySetInnerHTML={
                typeof icon === "string" ? { __html: icon } : undefined
              }
            >
              {typeof icon === "string" ? null : icon}
            </div>
          ) : null}
          <figcaption className="flex-1 truncate text-muted-foreground">
            {title}
          </figcaption>
          {allowCopy ? (
            <CopyButton
              className="-me-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
              isCopied={isCopied}
              onClick={onCopy}
              size="xs"
              variant="ghost"
            />
          ) : null}
        </div>
      ) : (
        allowCopy && (
          <div className="absolute top-0 right-0 z-[2] rounded-bl-xl bg-accent p-1.5">
            <CopyButton
              className="bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
              isCopied={isCopied}
              onClick={onCopy}
              size="xs"
              variant="ghost"
            />
          </div>
        )
      )}
      <div className={cn("p-1.5", title && "pt-0")}>
        <ScrollArea dir="ltr" ref={areaRef}>
          <ScrollViewport
            {...viewportProps}
            className={cn(
              "[&_code]:!text-[13px] [&_code_.line]:!px-0 max-h-[600px] rounded-md bg-background",
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
