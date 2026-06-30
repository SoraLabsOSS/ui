"use client";

import {
  Highlight,
  HighlightItem,
} from "@/registry/primitives/effects/highlight";

const MENU_ITEMS = [
  { value: "inbox", label: "Inbox", count: 12 },
  { value: "drafts", label: "Drafts", count: 3 },
  { value: "sent", label: "Sent" },
  { value: "starred", label: "Starred" },
  { value: "archive", label: "Archive" },
];

export function HighlightClickDemo() {
  return (
    <div className="flex w-full items-center justify-center px-4 py-6">
      <div className="flex w-full max-w-52 flex-col overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
        <Highlight
          className="rounded-md bg-foreground/8"
          defaultValue="inbox"
          mode="children"
          trigger="click"
        >
          {MENU_ITEMS.map(({ value, label, count }) => (
            <HighlightItem key={value} value={value}>
              <button
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm"
                type="button"
              >
                <span>{label}</span>
                {count === undefined ? null : (
                  <span className="text-foreground/40 text-xs tabular-nums">
                    {count}
                  </span>
                )}
              </button>
            </HighlightItem>
          ))}
        </Highlight>
      </div>
    </div>
  );
}

export default HighlightClickDemo;
