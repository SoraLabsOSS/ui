"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { Banner } from "@/components/banner";

const NO_BANNER_PREFIXES = [
  "/pricing",
  "/legal",
  "/examples",
  "/library",
  "/settings",
  "/workspace",
];

export function ConditionalBanner(props: ComponentProps<typeof Banner>) {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname.startsWith("/catalog/") ||
    pathname.startsWith("/components/") ||
    NO_BANNER_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return null;
  }
  return <Banner {...props} />;
}
