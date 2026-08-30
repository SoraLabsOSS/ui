"use client";

import { useState } from "react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/ui/base/context-menu";

export default function ContextMenuDemo() {
  const [bookmarksChecked, setBookmarksChecked] = useState(true);
  const [urlsChecked, setUrlsChecked] = useState(false);
  const [person, setPerson] = useState("pedro");

  return (
    <div className="flex w-full max-w-md items-center justify-center p-6">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-56 w-full items-center justify-center rounded-xl border border-border border-dashed bg-muted/20 text-center font-medium text-muted-foreground text-sm transition-colors hover:border-foreground/30 hover:bg-muted/40">
          <div className="flex select-none flex-col items-center gap-1.5 p-4">
            <span className="font-semibold text-foreground">
              Right-click here
            </span>
            <span className="text-muted-foreground text-xs">
              Opens animated context menu with smooth spring transitions
            </span>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-64">
          <ContextMenuItem>
            Back
            <ContextMenuShortcut>⌘+[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>
            Forward
            <ContextMenuShortcut>⌘+]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Reload
            <ContextMenuShortcut>⌘+R</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSub>
            <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-52">
              <ContextMenuItem>
                Save Page As…
                <ContextMenuShortcut>⌘+S</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>Create Shortcut…</ContextMenuItem>
              <ContextMenuItem>Name Window…</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>
                Developer Tools
                <ContextMenuShortcut>⌥⌘I</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          <ContextMenuCheckboxItem
            checked={bookmarksChecked}
            onCheckedChange={setBookmarksChecked}
          >
            Show Bookmarks Bar
            <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={urlsChecked}
            onCheckedChange={setUrlsChecked}
          >
            Show Full URLs
          </ContextMenuCheckboxItem>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuLabel inset>People</ContextMenuLabel>
            <ContextMenuRadioGroup onValueChange={setPerson} value={person}>
              <ContextMenuRadioItem inset value="pedro">
                Pedro Duarte
              </ContextMenuRadioItem>
              <ContextMenuRadioItem inset value="colm">
                Colm Tuite
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuItem variant="destructive">
            Clear Cache
            <ContextMenuShortcut>⌘⇧⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
