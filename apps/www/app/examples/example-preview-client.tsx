"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";
import { MotionConfig } from "motion/react";
import { Suspense, useEffect, useMemo } from "react";
import { index } from "@/__registry__";
import { previewComponents } from "@/__registry__/preview";
import { catalogPreviewViewportClassName } from "@/components/catalog/catalog-preview-classes";
import { CatalogScrollArea } from "@/components/catalog/catalog-scroll-area";

interface ExamplePreviewClientProps {
  centered?: boolean;
  passDemoProps?: boolean;
  reducedMotion?: "always" | "never" | "user";
  slug: string;
}

function unwrapValues(value: unknown): unknown {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    if ("value" in value) {
      return (value as { value: unknown }).value;
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        unwrapValues(nestedValue),
      ])
    );
  }

  return value;
}

function flattenProps(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const props: Record<string, unknown> = {};
  for (const nestedValue of Object.values(value)) {
    if (nestedValue && typeof nestedValue === "object") {
      Object.assign(props, nestedValue);
    }
  }
  return props;
}

export function ExamplePreviewClient({
  centered = false,
  passDemoProps = true,
  reducedMotion = "user",
  slug,
}: ExamplePreviewClientProps) {
  useEffect(() => {
    function applyTheme(theme: string) {
      const isDark = theme === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.classList.toggle("light", !isDark);
      document.documentElement.style.colorScheme = theme;
    }

    function handleMessage(event: MessageEvent) {
      if (
        event.data?.type === "sora-catalog-theme-change" &&
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
      window.parent?.postMessage({ type: "sora-catalog-preview-ready" }, "*");
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
  const componentProps = useMemo(() => {
    if (!passDemoProps) {
      return {};
    }

    const entry = index[slug] ?? index[`demo-${slug}`];
    return flattenProps(unwrapValues(entry?.component?.demoProps ?? {}));
  }, [passDemoProps, slug]);

  if (!Component) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-muted-foreground text-sm">
        Example preview for{" "}
        <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {slug}
        </code>{" "}
        is not available.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-screen w-full bg-background text-foreground antialiased",
        centered && "p-6"
      )}
    >
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader className="size-5 animate-spin" />
            Loading preview...
          </div>
        }
      >
        <MotionConfig reducedMotion={reducedMotion}>
          {centered ? (
            <div className="flex h-full w-full items-center justify-center overflow-auto p-6">
              <div className="w-fit max-w-xl">
                <Component {...componentProps} />
              </div>
            </div>
          ) : (
            <CatalogScrollArea
              className="h-full w-full"
              hideScrollbar
              viewportClassName={catalogPreviewViewportClassName}
            >
              <div className="min-h-full w-full">
                <Component {...componentProps} />
              </div>
            </CatalogScrollArea>
          )}
        </MotionConfig>
      </Suspense>
    </div>
  );
}
