"use client";

import { DialRoot, DialStore } from "dialkit";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { Drawer } from "vaul";

import "./vaul.css";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobile(callback: () => void) {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileServerSnapshot() {
  return false;
}

function getThemeSnapshot(): "dark" | "light" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getThemeServerSnapshot(): "dark" | "light" {
  return "light";
}

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributeFilter: ["class", "style", "data-theme"],
    attributes: true,
  });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", callback);
  };
}

export function ExamplesDialRoot() {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot
  );
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const openPanels = () => {
      for (const panel of DialStore.getPanels("panel")) {
        DialStore.setPanelOpen(panel.id, true);
      }
    };

    openPanels();
    return DialStore.subscribeGlobal(openPanels);
  }, [isMobile]);

  if (isMobile) {
    return (
      <Drawer.Root direction="bottom">
        <Drawer.Trigger
          aria-label="Open controls"
          className="bg-primary text-primary-foreground fixed top-3 right-3 z-50 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium shadow"
        >
          <SlidersHorizontal className="size-4" />
          Controls
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content className="bg-background fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-xl outline-none">
            <div className="bg-muted mx-auto mt-3 h-1.5 w-10 rounded-full" />
            <div className="min-h-0 flex-1 overflow-auto p-3">
              <DialRoot mode="inline" productionEnabled theme={theme} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return <DialRoot productionEnabled theme={theme} />;
}
