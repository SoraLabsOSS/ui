"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";
import { MotionConfig } from "motion/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { index } from "@/__registry__";
import { previewComponents } from "@/__registry__/preview";
import { blocksPreviewViewportClassName } from "@/components/blocks/blocks-preview-classes";
import { BlocksScrollArea } from "@/components/blocks/blocks-scroll-area";
import { RefreshButton } from "@/components/docs/refresh";
import type { Binds } from "@/components/docs/tweakpane";
import { useLenisSmoothScroll } from "@/hooks/use-lenis-smooth-scroll";
import { flattenFirstLevel, unwrapValues } from "@/lib/registry/demo-props";

import { DialKitBridge } from "./dialkit-bridge";

interface ExamplePreviewClientProps {
  centered?: boolean;
  passDemoProps?: boolean;
  reducedMotion?: "always" | "never" | "user";
  showRefreshButton?: boolean;
  slug: string;
  smoothScroll?: boolean;
}

export function ExamplePreviewClient({
  centered = false,
  passDemoProps = true,
  reducedMotion = "user",
  showRefreshButton = true,
  slug,
  smoothScroll = false,
}: ExamplePreviewClientProps) {
  const lenisRef = useLenisSmoothScroll(smoothScroll);
  useEffect(() => {
    function applyTheme(theme: string) {
      const isDark = theme === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.classList.toggle("light", !isDark);
      document.documentElement.style.colorScheme = theme;
    }

    function handleMessage(event: MessageEvent) {
      if (
        event.data?.type === "sora-blocks-theme-change" &&
        (event.data.theme === "dark" || event.data.theme === "light")
      ) {
        applyTheme(event.data.theme);
      }
    }

    try {
      if (window.parent && window.parent !== window) {
        const parentIsDark =
          window.parent.document.documentElement.classList.contains("dark");
        applyTheme(parentIsDark ? "dark" : "light");
      }
    } catch {
      // Fallback
    }

    try {
      window.parent?.postMessage({ type: "sora-blocks-preview-ready" }, "*");
    } catch {
      // Fallback
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const Component = useMemo(
    () => previewComponents[`demo-${slug}`] ?? previewComponents[slug] ?? null,
    [slug]
  );
  const demoPropsConfig = useMemo(() => {
    if (!passDemoProps) {
      return {};
    }

    const entry = index[slug] ?? index[`demo-${slug}`];
    return entry?.component?.demoProps ?? {};
  }, [passDemoProps, slug]);
  const hasDemoProps = Object.keys(demoPropsConfig).length > 0;
  const [componentProps, setComponentProps] = useState<Record<string, unknown>>(
    {}
  );
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (!hasDemoProps) {
      setComponentProps({});
      return;
    }

    setComponentProps(
      flattenFirstLevel<Record<string, unknown>>(unwrapValues(demoPropsConfig))
    );
  }, [demoPropsConfig, hasDemoProps]);

  useEffect(() => {
    if (!smoothScroll || previewKey < 0) {
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [lenisRef, previewKey, smoothScroll]);

  if (!Component) {
    return (
      <div className="text-muted-foreground flex min-h-screen items-center justify-center p-8 text-sm">
        Example preview for{" "}
        <code className="bg-muted mx-1 rounded px-1.5 py-0.5 font-mono text-xs">
          {slug}
        </code>{" "}
        is not available.
      </div>
    );
  }

  const renderedComponent = <Component key={previewKey} {...componentProps} />;

  let previewContent: ReactNode = null;
  if (centered) {
    previewContent = (
      <div className="flex h-full w-full items-center justify-center overflow-auto p-6">
        <div className="flex w-full max-w-xl justify-center">
          {renderedComponent}
        </div>
      </div>
    );
  } else if (smoothScroll) {
    previewContent = (
      <div className="min-h-screen w-full">{renderedComponent}</div>
    );
  } else {
    previewContent = (
      <BlocksScrollArea
        className="h-full w-full"
        hideScrollbar
        viewportClassName={blocksPreviewViewportClassName}
      >
        <div className="min-h-full w-full">{renderedComponent}</div>
      </BlocksScrollArea>
    );
  }

  return (
    <div
      className={cn(
        "bg-background text-foreground relative w-full antialiased",
        smoothScroll ? "min-h-screen" : "h-screen",
        centered && "p-6"
      )}
    >
      {showRefreshButton ? (
        <RefreshButton
          aria-label="Reload example"
          className="absolute top-3 left-3 z-30"
          onRefresh={() => setPreviewKey((prev) => prev + 1)}
          title="Reload example"
        />
      ) : null}
      {hasDemoProps ? (
        <DialKitBridge
          demoPropsConfig={demoPropsConfig as Binds}
          onPropsChange={setComponentProps}
          slug={slug}
        />
      ) : null}

      <Suspense
        fallback={
          <div className="text-muted-foreground flex h-screen items-center justify-center gap-2 text-sm">
            <Loader className="size-5 animate-spin" />
            Loading preview...
          </div>
        }
      >
        <MotionConfig reducedMotion={reducedMotion}>
          {previewContent}
        </MotionConfig>
      </Suspense>
    </div>
  );
}
