"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/ui/sheet";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";
import { Loader, SlidersHorizontal } from "lucide-react";
import { MotionConfig } from "motion/react";
import { type ReactNode, Suspense, useEffect, useMemo, useState } from "react";
import { index } from "@/__registry__";
import { previewComponents } from "@/__registry__/preview";
import { catalogPreviewViewportClassName } from "@/components/catalog/catalog-preview-classes";
import { CatalogScrollArea } from "@/components/catalog/catalog-scroll-area";
import { RefreshButton } from "@/components/docs/refresh";
import { type Binds, Tweakpane } from "@/components/docs/tweakpane";
import { flattenFirstLevel, unwrapValues } from "@/lib/registry/demo-props";
import { Button } from "@/registry/ui/base/button";

interface ExamplePreviewClientProps {
  centered?: boolean;
  passDemoProps?: boolean;
  reducedMotion?: "always" | "never" | "user";
  slug: string;
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
  const demoPropsConfig = useMemo(() => {
    if (!passDemoProps) {
      return {};
    }

    const entry = index[slug] ?? index[`demo-${slug}`];
    return entry?.component?.demoProps ?? {};
  }, [passDemoProps, slug]);
  const hasDemoProps = Object.keys(demoPropsConfig).length > 0;
  const [binds, setBinds] = useState<Binds | null>(null);
  const [componentProps, setComponentProps] = useState<Record<string, unknown>>(
    {}
  );
  const [previewKey, setPreviewKey] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!hasDemoProps) {
      setBinds(null);
      setComponentProps({});
      return;
    }

    setBinds(demoPropsConfig as Binds);
    setComponentProps(
      flattenFirstLevel<Record<string, unknown>>(unwrapValues(demoPropsConfig))
    );
  }, [demoPropsConfig, hasDemoProps]);

  const handleBindsChange = (nextBinds: Binds) => {
    setBinds(nextBinds);
    setComponentProps(
      flattenFirstLevel<Record<string, unknown>>(unwrapValues(nextBinds))
    );
  };

  const handleReset = () => {
    setBinds(demoPropsConfig as Binds);
    setComponentProps(
      flattenFirstLevel<Record<string, unknown>>(unwrapValues(demoPropsConfig))
    );
  };

  let optionsPanel: ReactNode = null;
  if (hasDemoProps && binds) {
    if (isMobile) {
      optionsPanel = (
        <Sheet onOpenChange={setOptionsOpen} open={optionsOpen}>
          <SheetTrigger
            aria-label="Open example options"
            render={
              <Button className="fixed top-3 right-3 z-40" variant="default" />
            }
          >
            <SlidersHorizontal className="size-3.5" />
            Options
          </SheetTrigger>
          <SheetContent
            className="max-h-[70vh] overflow-y-auto rounded-t-2xl border-border/60 bg-background/95 p-4 backdrop-blur-md"
            closeButtonClassName="top-2 right-3"
            closeButtonSize="icon-xs"
            side="bottom"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Example options</SheetTitle>
              <SheetDescription>
                Adjust the props used by this example.
              </SheetDescription>
            </SheetHeader>
            <div className="pt-6">
              <Tweakpane
                binds={binds}
                columns={2}
                compact
                initialBinds={demoPropsConfig as Binds}
                onBindsChange={handleBindsChange}
                onReset={handleReset}
                stacked
                title="Options"
              />
            </div>
          </SheetContent>
        </Sheet>
      );
    } else {
      optionsPanel = (
        <div className="absolute top-3 right-3 z-20 max-h-[70vh] w-[min(26rem,calc(100%-1.5rem))] overflow-y-auto rounded-xl border border-border/60 bg-background/90 p-2 backdrop-blur-md">
          <Tweakpane
            binds={binds}
            columns={2}
            compact
            initialBinds={demoPropsConfig as Binds}
            onBindsChange={handleBindsChange}
            onReset={handleReset}
            stacked
            title="Options"
          />
        </div>
      );
    }
  }

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
        "relative h-screen w-full bg-background text-foreground antialiased",
        centered && "p-6"
      )}
    >
      <RefreshButton
        aria-label="Reload example"
        className="absolute top-3 left-3 z-30"
        onRefresh={() => setPreviewKey((prev) => prev + 1)}
        title="Reload example"
      />
      {optionsPanel}

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
              <div className="flex w-full max-w-xl justify-center">
                <Component key={previewKey} {...componentProps} />
              </div>
            </div>
          ) : (
            <CatalogScrollArea
              className="h-full w-full"
              hideScrollbar
              viewportClassName={catalogPreviewViewportClassName}
            >
              <div className="min-h-full w-full">
                <Component key={previewKey} {...componentProps} />
              </div>
            </CatalogScrollArea>
          )}
        </MotionConfig>
      </Suspense>
    </div>
  );
}
