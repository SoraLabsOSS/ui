import { cache } from "react";
import { index } from "@/__registry__";
import type { PageReleaseDateFields } from "@/lib/docs/get-page-release-date";
import { getPageReleaseDateString } from "@/lib/docs/get-page-release-date";
import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";

export interface LatestShippedItem {
  href: string;
  releasedAt: string;
  title: string;
}

interface CatalogPageData extends PageReleaseDateFields {
  registryName?: string;
}

function getRegistryName(slugs: string[], data: CatalogPageData): string {
  return data.registryName ?? slugs.at(-1) ?? "";
}

function hasRegistryCommand(registryName: string): boolean {
  const entry = index[registryName] as { command?: string } | undefined;
  return Boolean(entry?.command);
}

function collectShippedItems(): LatestShippedItem[] {
  const items: LatestShippedItem[] = [];

  for (const page of source.getPages()) {
    if (!page.url.startsWith("/docs/primitives/")) {
      continue;
    }

    const data = page.data as CatalogPageData;
    const registryName = getRegistryName(page.slugs, data);

    if (!hasRegistryCommand(registryName)) {
      continue;
    }

    const releasedAt = getPageReleaseDateString(data);
    if (!releasedAt) {
      continue;
    }

    items.push({
      title: page.data.title,
      href: page.url,
      releasedAt,
    });
  }

  for (const page of componentSource.getPages()) {
    const data = page.data as CatalogPageData;
    const registryName = getRegistryName(page.slugs, data);

    if (!hasRegistryCommand(registryName)) {
      continue;
    }

    const releasedAt = getPageReleaseDateString(data);
    if (!releasedAt) {
      continue;
    }

    items.push({
      title: page.data.title,
      href: page.url,
      releasedAt,
    });
  }

  return items;
}

export const getLatestShippedRegistryItem = cache(
  (): LatestShippedItem | null => {
    const items = collectShippedItems();

    if (items.length === 0) {
      return null;
    }

    return (
      items.toSorted((a, b) => {
        const byDate = b.releasedAt.localeCompare(a.releasedAt);
        if (byDate !== 0) {
          return byDate;
        }

        return a.title.localeCompare(b.title);
      })[0] ?? null
    );
  }
);
