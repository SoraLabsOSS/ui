export type CommandPaletteIcon =
  | "arrow"
  | "book"
  | "bookmark"
  | "box"
  | "cog"
  | "external"
  | "settings";

export interface CommandPaletteItem {
  /** Shown on the right side of list items (e.g. category or section). */
  hint?: string;
  href?: string;
  icon: CommandPaletteIcon;
  id: string;
  keywords?: string[];
  label: string;
  /** Included in cmdk search value (label + hint). */
  searchValue: string;
  shortcut?: string[];
}

export interface CommandPaletteGroup {
  id: string;
  items: CommandPaletteItem[];
  label: string;
}

export type CommandPaletteActionId =
  | "reload"
  | "theme-dark"
  | "theme-light"
  | "theme-system";

export interface CommandPaletteActionItem {
  action: CommandPaletteActionId;
  hint?: string;
  icon: CommandPaletteIcon;
  id: string;
  label: string;
  searchValue: string;
  shortcut?: string[];
}
