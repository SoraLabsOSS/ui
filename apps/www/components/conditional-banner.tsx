"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { Banner } from "@/components/banner";

const NO_BANNER_PREFIXES = ["/pricing", "/legal"];

export function ConditionalBanner(props: ComponentProps<typeof Banner>) {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    NO_BANNER_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return null;
  }
  return <Banner {...props} />;
}
