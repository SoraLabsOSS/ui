"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { CommandPaletteGroup } from "@/lib/command-palette/types";

const CommandPaletteGroupsContext = createContext<CommandPaletteGroup[]>([]);

export function CommandPaletteGroupsProvider({
  children,
  groups,
}: {
  children: ReactNode;
  groups: CommandPaletteGroup[];
}) {
  return (
    <CommandPaletteGroupsContext.Provider value={groups}>
      {children}
    </CommandPaletteGroupsContext.Provider>
  );
}

export function useCommandPaletteGroups(): CommandPaletteGroup[] {
  return useContext(CommandPaletteGroupsContext);
}
