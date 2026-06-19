"use client";

import { Kbd, KbdGroup } from "@workspace/ui/components/ui/kbd";

interface CommandPaletteShortcutProps {
  keys: string[];
}

export function CommandPaletteShortcut({ keys }: CommandPaletteShortcutProps) {
  const nonModKeys = keys.filter((key) => key !== "mod");
  const hasMod = keys.includes("mod");

  return (
    <KbdGroup className="ml-auto shrink-0">
      {hasMod ? <Kbd>⌘</Kbd> : null}
      {nonModKeys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </KbdGroup>
  );
}

export function CommandPaletteInputShortcut() {
  return (
    <KbdGroup className="hidden shrink-0 sm:inline-flex">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  );
}
