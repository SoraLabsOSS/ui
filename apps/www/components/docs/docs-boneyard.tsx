"use client";

import { Skeleton } from "boneyard-js/react";
import type { ReactNode } from "react";

export type DocsSkeletonName =
  | "blog-index"
  | "blog-post"
  | "docs-page"
  | "icons-page"
  | "motion-page"
  | "ui-page";

export function DocsBoneyardCapture({
  children,
  name,
}: {
  children: ReactNode;
  name: DocsSkeletonName;
}) {
  if (
    typeof window === "undefined" ||
    !(window as Window & { __BONEYARD_BUILD?: boolean }).__BONEYARD_BUILD
  ) {
    return children;
  }

  return (
    <Skeleton loading={false} name={name} select="viewport">
      {children}
    </Skeleton>
  );
}
