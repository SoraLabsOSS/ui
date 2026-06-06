import type { PageTree } from "fumadocs-core/server";
import { source } from "@/lib/docs/source";

function isRootFolder(
  item: PageTree.Node
): item is PageTree.Folder & { root: true } {
  return item.type === "folder" && Boolean((item as PageTree.Folder).root);
}

function firstDocPageUrl(nodes: PageTree.Node[]): string | undefined {
  for (const node of nodes) {
    if (node.type === "separator") {
      continue;
    }
    if (node.type === "page") {
      return node.url;
    }
    if (node.type === "folder") {
      const url =
        firstDocPageUrl(node.children) ??
        (node.index?.type === "page" ? node.index.url : undefined);
      if (url) {
        return url;
      }
    }
  }
}

/** First doc page under Fumadocs root folders (meta.json root flag). Server-only. */
export function getFirstPrimitiveDocUrl(): string {
  const { children } = source.getPageTree();

  for (const node of children) {
    if (!isRootFolder(node)) {
      continue;
    }
    const url = firstDocPageUrl(node.children);
    if (url) {
      return url;
    }
  }

  return "/docs";
}
