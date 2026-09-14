"use client";

import { Loader } from "lucide-react";
import { MotionConfig } from "motion/react";
import { Suspense, useEffect, useMemo } from "react";
import { previewComponents } from "@/__registry__/preview";
import { catalogPreviewViewportClassName } from "@/components/catalog/catalog-preview-classes";
import { CatalogScrollArea } from "@/components/catalog/catalog-scroll-area";

interface CatalogExampleClientProps {
  slug: string;
}

export function CatalogExampleClient({ slug }: CatalogExampleClientProps) {
  // Listen for real-time theme toggles from parent window without invoking next-themes
  // to avoid localStorage sync conflicts with the parent window
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

    // Try reading theme from parent window directly on mount
    try {
      if (window.parent && window.parent !== window) {
        const parentIsDark =
          window.parent.document.documentElement.classList.contains("dark");
        applyTheme(parentIsDark ? "dark" : "light");
      }
    } catch {
      // Fallback
    }

    // Notify parent window that the preview component is fully ready
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

  if (!Component) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-muted-foreground text-sm">
        Catalog preview for{" "}
        <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {slug}
        </code>{" "}
        is not available.
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background text-foreground antialiased">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader className="size-5 animate-spin" />
            Loading preview...
          </div>
        }
      >
        <MotionConfig reducedMotion="never">
          <CatalogScrollArea
            className="h-full w-full"
            hideScrollbar
            viewportClassName={catalogPreviewViewportClassName}
          >
            <Component />
          </CatalogScrollArea>
        </MotionConfig>
      </Suspense>
    </div>
  );
}
