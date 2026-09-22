"use client";

import { Skeleton } from "boneyard-js/react";
import { type ReactNode, useEffect, useState } from "react";

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
  const [buildMode, setBuildMode] = useState(false);

  useEffect(() => {
    setBuildMode(
      Boolean(
        (window as Window & { __BONEYARD_BUILD?: boolean }).__BONEYARD_BUILD
      )
    );
  }, []);

  if (!buildMode) {
    return children;
  }

  return (
    <Skeleton
      className="w-full min-w-0"
      loading={false}
      name={name}
      select="viewport"
    >
      {children}
    </Skeleton>
  );
}
