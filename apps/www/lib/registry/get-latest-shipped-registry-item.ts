import { cache } from "react";
import { index } from "@/__registry__";
import type { PageReleaseDateFields } from "@/lib/docs/get-page-release-date";
import {
  getPageReleaseDateString,
  getPageReleaseTimestamp,
} from "@/lib/docs/get-page-release-date";
import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";

export interface LatestShippedItem {
  href: string;
  releasedAt: string;
  title: string;
}

type ShippedItemSource = "catalog" | "primitive";

interface ShippedItem extends LatestShippedItem {
  releasedAtTimestamp: number;
  source: ShippedItemSource;
}

interface CatalogPageData extends PageReleaseDateFields {
  registryName?: string;
}

const SOURCE_PRIORITY: Record<ShippedItemSource, number> = {
  catalog: 0,
  primitive: 1,
};

function getRegistryName(slugs: string[], data: CatalogPageData): string {
  return data.registryName ?? slugs.at(-1) ?? "";
}

function hasRegistryCommand(registryName: string): boolean {
  const entry = index[registryName] as { command?: string } | undefined;
  return Boolean(entry?.command);
}

function pushShippedItem(
  items: ShippedItem[],
  page: { data: { title: string }; url: string; slugs: string[] },
  data: CatalogPageData,
  source: ShippedItemSource
): void {
  const registryName = getRegistryName(page.slugs, data);

  if (!hasRegistryCommand(registryName)) {
    return;
  }

  const releasedAtTimestamp = getPageReleaseTimestamp(data);
  const releasedAt = getPageReleaseDateString(data);
  if (releasedAtTimestamp === undefined || !releasedAt) {
    return;
  }

  items.push({
    title: page.data.title,
    href: page.url,
    releasedAt,
    releasedAtTimestamp,
    source,
  });
}

function collectShippedItems(): ShippedItem[] {
  const items: ShippedItem[] = [];

  for (const page of source.getPages()) {
    if (
      !(
        page.url.startsWith("/docs/motion/") ||
        page.url.startsWith("/docs/primitives/")
      )
    ) {
      continue;
    }

    pushShippedItem(items, page, page.data as CatalogPageData, "primitive");
  }

  for (const page of componentSource.getPages()) {
    pushShippedItem(items, page, page.data as CatalogPageData, "catalog");
  }

  return items;
}

function compareShippedItems(a: ShippedItem, b: ShippedItem): number {
  const byTimestamp = b.releasedAtTimestamp - a.releasedAtTimestamp;
  if (byTimestamp !== 0) {
    return byTimestamp;
  }

  const bySource = SOURCE_PRIORITY[a.source] - SOURCE_PRIORITY[b.source];
  if (bySource !== 0) {
    return bySource;
  }

  return a.title.localeCompare(b.title);
}

export const getLatestShippedRegistryItem = cache(
  (): LatestShippedItem | null => {
    const items = collectShippedItems();

    if (items.length === 0) {
      return null;
    }

    const latest = items.toSorted(compareShippedItems)[0];
    if (!latest) {
      return null;
    }

    return {
      title: latest.title,
      href: latest.href,
      releasedAt: latest.releasedAt,
    };
  }
);
