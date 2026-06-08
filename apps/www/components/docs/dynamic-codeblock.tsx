"use client";

import { cn } from "@workspace/ui/lib/utils";
import type {
  HighlightOptionsCommon,
  HighlightOptionsThemes,
} from "fumadocs-core/highlight";
import { useShiki } from "fumadocs-core/highlight/client";
import { Loader } from "lucide-react";
import { CodeBlock, Pre } from "@/components/docs/codeblock";

const getComponents = ({
  title,
  icon,
  onCopy,
  className,
}: {
  title?: string;
  icon?: React.ReactNode;
  onCopy?: () => void;
  className?: string;
}) =>
  ({
    pre(props) {
      return (
        <CodeBlock
          {...props}
          className={cn("my-0", props.className, className)}
          icon={icon}
          onCopy={onCopy}
          title={title}
        >
          <Pre>{props.children}</Pre>
        </CodeBlock>
      );
    },
  }) satisfies HighlightOptionsCommon["components"];

export interface DynamicCodeBlockProps {
  className?: string;
  code?: string;
  icon?: React.ReactNode;
  lang: string;
  onCopy?: () => void;
  options?: Omit<HighlightOptionsCommon, "lang"> & HighlightOptionsThemes;
  title?: string;
}

function DynamicCodeBlockLoading({
  className,
  icon,
  title,
}: Pick<DynamicCodeBlockProps, "className" | "icon" | "title">) {
  return (
    <CodeBlock
      allowCopy={false}
      className={className}
      icon={icon}
      title={title}
    >
      <Pre className="flex min-h-[360px] items-center justify-center gap-2 text-muted-foreground">
        <Loader aria-hidden className="size-4 animate-spin" />
        <span className="text-sm">Loading code…</span>
      </Pre>
    </CodeBlock>
  );
}

export function DynamicCodeBlock({
  lang,
  code = "",
  options,
  title,
  icon,
  onCopy,
  className,
}: DynamicCodeBlockProps) {
  const components = getComponents({ title, icon, onCopy, className });
  const loading = (
    <DynamicCodeBlockLoading className={className} icon={icon} title={title} />
  );

  return useShiki(code, {
    lang,
    loading,
    ...options,
    components: {
      ...components,
      ...options?.components,
    },
    withPrerenderScript: true,
  });
}
