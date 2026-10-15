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

// Preload as soon as this module evaluates. The root layout imports it
// statically, so this runs during page load. Fumadocs only mounts `SearchDialog`
// once `isOpen` is no longer undefined — i.e. only after the first open — so any
// preload living inside the component would start loading the chunk at the same
// moment the dialog is being shown, which is exactly the delay we are avoiding.
if (typeof window !== "undefined") {
  import("./command-palette-dialog").catch(() => undefined);
}

export function CommandPaletteSearchDialog({
  onOpenChange,
  open,
}: SharedProps) {
  const groups = useCommandPaletteGroups();
  const [hasOpened, setHasOpened] = useState(open);

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
