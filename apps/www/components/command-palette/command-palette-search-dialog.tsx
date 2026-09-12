"use client";

import type { SharedProps } from "fumadocs-ui/contexts/search";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCommandPaletteGroups } from "./command-palette-groups-provider";

const CommandPaletteDialog = dynamic(
  () =>
    import("./command-palette-dialog").then((mod) => mod.CommandPaletteDialog),
  { ssr: false }
);

export function CommandPaletteSearchDialog({
  onOpenChange,
  open,
}: SharedProps) {
  const groups = useCommandPaletteGroups();
  const [hasOpened, setHasOpened] = useState(open);

  useEffect(() => {
    const preload = () => {
      import("./command-palette-dialog").catch(() => undefined);
    };

    const win = window as Window & {
      cancelIdleCallback?: (id: number) => void;
      requestIdleCallback?: (cb: () => void) => number;
    };

    if (typeof win.requestIdleCallback === "function") {
      const handle = win.requestIdleCallback(preload);
      return () => {
        win.cancelIdleCallback?.(handle);
      };
    }

    const timer = setTimeout(preload, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" || event.metaKey || event.ctrlKey) {
        import("./command-palette-dialog").catch(() => undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown, {
      capture: true,
      once: true,
    });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (open) {
      setHasOpened(true);
    }
  }, [open]);

  if (!hasOpened) {
    return null;
  }

  return (
    <CommandPaletteDialog
      groups={groups}
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}
