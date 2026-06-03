import { source } from "@/lib/source";

function toReleaseDateString(value: Date | string): string | undefined {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return;
  }
  return date.toISOString().slice(0, 10);
}

/** Built from MDX `releaseDate` frontmatter via Fumadocs source (server-only). */
export function getReleaseDatesByUrl(): Record<string, string> {
  const map: Record<string, string> = {};

  for (const page of source.getPages()) {
    const data = page.data as { releaseDate?: Date | string };
    if (!data.releaseDate) {
      continue;
    }
    const iso = toReleaseDateString(data.releaseDate);
    if (iso) {
      map[page.url] = iso;
    }
  }

  return map;
}
