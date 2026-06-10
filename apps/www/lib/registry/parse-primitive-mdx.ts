import type { ComponentTocItem } from "@/lib/registry/types";

const PRIMARY_SECTIONS = new Set([
  "installation",
  "usage",
  "props",
  "credits",
  "notes",
  "accessibility",
]);

function normalizeTitle(title: unknown): string {
  if (typeof title !== "string") {
    return "";
  }
  return title.trim().toLowerCase();
}

/** Keep top-level doc sections for the in-page table of contents. */
export function filterComponentToc(
  toc: ComponentTocItem[] | undefined
): ComponentTocItem[] {
  if (!toc?.length) {
    return [];
  }

  return toc.filter((item) => {
    if (item.depth !== 2) {
      return false;
    }
    const normalized = normalizeTitle(item.title);
    if (PRIMARY_SECTIONS.has(normalized)) {
      return true;
    }
    return normalized.startsWith("api reference");
  });
}
