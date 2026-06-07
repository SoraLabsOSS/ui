"use client";

import {
  DockNav,
  type DockNavItem,
} from "@/registry/primitives/effects/dock-nav";

const DEFAULT_DOCK_ITEMS: DockNavItem[] = [
  {
    label: "Notion",
    iconSrc:
      "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be92ee5ddf0080fb90_notion.png",
    alt: "Notion app icon",
  },
  {
    label: "Asana",
    iconSrc:
      "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6bef9d004f8a9cf3b29_asana.png",
    alt: "Asana app icon",
  },
  {
    label: "Slack",
    iconSrc:
      "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be8c099d4e1ed55770_slack.png",
    alt: "Slack app icon",
  },
  {
    label: "Loom",
    iconSrc:
      "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be5b31ba243e4da377_loom.png",
    alt: "Loom app icon",
  },
  {
    label: "Spotify",
    iconSrc:
      "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6bea97e140677496dae_spotify.png",
    alt: "Spotify app icon",
  },
  {
    label: "Webflow",
    iconSrc:
      "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6bea73fcc6ee568f6f0_webflow.png",
    alt: "Webflow app icon",
  },
  {
    label: "Figma",
    iconSrc:
      "https://cdn.prod.website-files.com/6728a3e6f4f4161c235bc519/6728a6be1de916069b5e1aaa_figma.png",
    alt: "Figma app icon",
  },
];

export function DockNavExample() {
  return (
    <div className="flex min-h-48 w-full items-end justify-center px-4 pb-6">
      <DockNav className="w-full max-w-4xl" items={DEFAULT_DOCK_ITEMS} />
    </div>
  );
}
