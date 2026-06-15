"use client";

import type { SharedProps } from "fumadocs-ui/contexts/search";
import { CommandPaletteDialog } from "./command-palette-dialog";
import { useCommandPaletteGroups } from "./command-palette-groups-provider";

export function CommandPaletteSearchDialog({
  onOpenChange,
  open,
}: SharedProps) {
  const groups = useCommandPaletteGroups();

  return (
    <CommandPaletteDialog
      groups={groups}
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}
