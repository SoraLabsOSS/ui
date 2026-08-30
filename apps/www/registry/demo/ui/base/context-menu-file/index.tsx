"use client";

import {
  CopyIcon,
  DownloadIcon,
  FileCodeIcon,
  FolderSyncIcon,
  PencilIcon,
  Share2Icon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/ui/base/context-menu";

export default function ContextMenuFileDemo() {
  return (
    <div className="flex w-full max-w-md items-center justify-center p-6">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card/60 p-6 text-center shadow-xs transition-colors hover:border-foreground/30 hover:bg-card/90">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileCodeIcon className="size-7" />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-foreground text-sm">
              app-layout.tsx
            </span>
            <span className="text-muted-foreground text-xs">
              Right-click file card for quick actions
            </span>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56">
          <ContextMenuItem>
            <DownloadIcon className="size-4" />
            Download
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <CopyIcon className="size-4" />
            Copy Path
            <ContextMenuShortcut>⌥⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <PencilIcon className="size-4" />
            Rename
            <ContextMenuShortcut>⏎</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Share2Icon className="size-4" />
              Share
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                <UserPlusIcon className="size-4" />
                Invite Collaborator
              </ContextMenuItem>
              <ContextMenuItem>
                <FolderSyncIcon className="size-4" />
                Sync with Team
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuLabel>Danger Zone</ContextMenuLabel>
            <ContextMenuItem variant="destructive">
              <Trash2Icon className="size-4" />
              Delete File
              <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
