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

// Preload the JS chunk as soon as this module evaluates.
if (typeof window !== "undefined") {
  import("./command-palette-dialog").catch(() => undefined);
}

export function CommandPaletteSearchDialog({
  onOpenChange,
  open,
}: SharedProps) {
  const groups = useCommandPaletteGroups();
  const [hasOpened, setHasOpened] = useState(open);

  // Pre-mount during browser idle time so the first Cmd+K / click is instant
  useEffect(() => {
    if (hasOpened) {
      return;
    }

    if (open) {
      setHasOpened(true);
      return;
    }

    const win = window as Window & {
      cancelIdleCallback?: (id: number) => void;
      requestIdleCallback?: (cb: () => void) => number;
    };

    if (typeof win.requestIdleCallback === "function") {
      const handle = win.requestIdleCallback(() => {
        setHasOpened(true);
      });
      return () => {
        win.cancelIdleCallback?.(handle);
      };
    }

    const timer = setTimeout(() => {
      setHasOpened(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [hasOpened, open]);

  if (!(hasOpened || open)) {
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
