"use client";

import type { SharedProps } from "fumadocs-ui/contexts/search";
import dynamic from "next/dynamic";
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

  if (!open) {
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
