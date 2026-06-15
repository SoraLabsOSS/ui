"use client";

import type { ReactNode } from "react";

interface CommandPaletteShortcutProps {
  keys: string[];
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="pointer-events-none inline-flex h-5 w-fit min-w-5 shrink-0 select-none items-center justify-center gap-1 rounded-sm bg-muted px-1 font-medium font-sans text-muted-foreground text-xs"
      data-slot="kbd"
    >
      {children}
    </kbd>
  );
}

export function CommandPaletteShortcut({ keys }: CommandPaletteShortcutProps) {
  const nonModKeys = keys.filter((key) => key !== "mod");
  const hasMod = keys.includes("mod");

  return (
    <span
      className="ml-auto inline-flex shrink-0 items-center gap-0.5"
      data-slot="kbd-group"
    >
      {hasMod ? <Kbd>⌘</Kbd> : null}
      {nonModKeys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </span>
  );
}

export function CommandPaletteInputShortcut() {
  return (
    <span
      className="hidden shrink-0 items-center gap-0.5 sm:inline-flex"
      data-slot="kbd-group"
    >
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </span>
  );
}
