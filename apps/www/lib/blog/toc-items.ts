export interface KbTocItem {
  href: string;
  level: number;
  name: string;
}

function tocTitleToText(title: unknown): string {
  if (typeof title === "string" || typeof title === "number") {
    return String(title);
  }
  if (Array.isArray(title)) {
    return title.map(tocTitleToText).join("");
  }
  if (title && typeof title === "object" && "props" in title) {
    const children = (title as { props?: { children?: unknown } }).props
      ?.children;
    return tocTitleToText(children);
  }
  return "";
}

/** Map Fumadocs compile-time TOC (h2–h4) into blog minimap items. */
export function kbTocItemsFromFumadocs(
  toc: { depth: number; title?: unknown; url: string }[] | undefined
): KbTocItem[] {
  if (!toc?.length) {
    return [];
  }

  return toc.flatMap((item) => {
    if (item.depth < 2 || item.depth > 4) {
      return [];
    }
    const name = tocTitleToText(item.title).trim();
    if (!name) {
      return [];
    }
    const href = item.url.startsWith("#") ? item.url : `#${item.url}`;
    return [{ href, level: item.depth, name }];
  });
}
