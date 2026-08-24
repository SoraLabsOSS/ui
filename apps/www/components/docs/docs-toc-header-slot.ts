"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useSyncExternalStore } from "react";

export interface HeaderTocItem {
  depth: number;
  title: ReactNode;
  url: string;
}

const EMPTY_ITEMS: HeaderTocItem[] = [];
/** Covers the gap while the next page's publisher mounts (blog headings included). */
const UNPUBLISH_MS = 250;

let items: HeaderTocItem[] = EMPTY_ITEMS;
let epoch = 0;
let unpublishTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function sameItems(left: HeaderTocItem[], right: HeaderTocItem[]) {
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index++) {
    const a = left[index];
    const b = right[index];
    if (
      !(a && b) ||
      a.url !== b.url ||
      a.depth !== b.depth ||
      a.title !== b.title
    ) {
      return false;
    }
  }
  return true;
}

export function publishHeaderToc(nextItems: HeaderTocItem[]) {
  epoch += 1;
  if (unpublishTimer) {
    clearTimeout(unpublishTimer);
    unpublishTimer = null;
  }
  const resolved = nextItems.length > 0 ? nextItems : EMPTY_ITEMS;
  if (sameItems(items, resolved)) {
    return;
  }
  items = resolved;
  emit();
}

export function unpublishHeaderToc() {
  const epochAtUnmount = epoch;
  if (unpublishTimer) {
    clearTimeout(unpublishTimer);
  }
  unpublishTimer = setTimeout(() => {
    unpublishTimer = null;
    if (epoch !== epochAtUnmount) {
      return;
    }
    items = EMPTY_ITEMS;
    emit();
  }, UNPUBLISH_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return items;
}

function getServerSnapshot() {
  return EMPTY_ITEMS;
}

export function useHeaderTocItems() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Page-level publisher. Nav owns the visible chrome so route changes do not remount it. */
export function usePublishHeaderToc(
  nextItems: HeaderTocItem[],
  skipEmpty = false
) {
  useLayoutEffect(() => {
    if (skipEmpty && nextItems.length === 0) {
      return;
    }
    publishHeaderToc(nextItems);
    return () => {
      unpublishHeaderToc();
    };
  }, [nextItems, skipEmpty]);
}
