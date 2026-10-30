"use client";

import { cn } from "@workspace/ui/lib/utils";
import type {
  HighlightOptionsCommon,
  HighlightOptionsThemes,
} from "fumadocs-core/highlight";
import { useShiki } from "fumadocs-core/highlight/client";
import { Loader } from "lucide-react";
import { Suspense, useEffect, useRef } from "react";
import { CodeBlock, Pre } from "@/components/docs/codeblock";

const getComponents = ({
  title,
  code,
  icon,
  onCopy,
  className,
}: {
  title?: string;
  code?: string;
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
          code={code}
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
  loadingMinHeight?: number | string;
  onCopy?: () => void;
  onLoaded?: () => void;
  options?: Omit<HighlightOptionsCommon, "lang"> & HighlightOptionsThemes;
  title?: string;
}

export function DynamicCodeBlockLoading({
  className,
  icon,
  title,
  loadingMinHeight = 360,
}: Pick<
  DynamicCodeBlockProps,
  "className" | "icon" | "title" | "loadingMinHeight"
>) {
  return (
    <CodeBlock
      allowCopy={false}
      className={className}
      icon={icon}
      title={title}
    >
      <Pre
        className="flex items-center justify-center gap-2 text-muted-foreground"
        style={{
          minHeight:
            typeof loadingMinHeight === "number"
              ? `${loadingMinHeight}px`
              : loadingMinHeight,
        }}
      >
        <Loader aria-hidden className="size-4 animate-spin" />
        <span className="text-sm">Loading code…</span>
      </Pre>
    </CodeBlock>
  );
}

const jsxCache = new Map<string, React.ReactNode>();

export function isCodeBlockCached(lang: string, code?: string): boolean {
  if (!code) {
    return false;
  }
  return jsxCache.has(`${lang}:${code}`);
}

function ShikiHighlight({
  lang,
  code = "",
  options,
  title,
  icon,
  onCopy,
  onLoaded,
  className,
  loading,
}: DynamicCodeBlockProps & { loading: React.ReactNode }) {
  const cacheKey = `${lang}:${code}`;
  const components = getComponents({ title, code, icon, onCopy, className });

  const result = useShiki(code, {
    lang,
    loading,
    ...options,
    components: {
      ...components,
      ...options?.components,
    },
    withPrerenderScript: true,
  });

  useEffect(() => {
    if (result && result !== loading) {
      jsxCache.set(cacheKey, result);
      onLoaded?.();
    }
  }, [result, loading, cacheKey, onLoaded]);

  return result;
}

export function DynamicCodeBlock(props: DynamicCodeBlockProps) {
  const cacheKey = `${props.lang}:${props.code ?? ""}`;
  const cached = props.code ? jsxCache.get(cacheKey) : null;
  const onLoadedRef = useRef(props.onLoaded);
  onLoadedRef.current = props.onLoaded;

  useEffect(() => {
    if (cached) {
      onLoadedRef.current?.();
    }
  }, [cached]);

  if (cached) {
    return cached;
  }

  const loading = (
    <DynamicCodeBlockLoading
      className={props.className}
      icon={props.icon}
      loadingMinHeight={props.loadingMinHeight}
      title={props.title}
    />
  );

  if (props.code === undefined) {
    return loading;
  }

  return (
    <Suspense fallback={loading}>
      <ShikiHighlight {...props} loading={loading} />
    </Suspense>
  );
}
