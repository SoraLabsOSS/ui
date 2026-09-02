"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { Banner } from "@/components/banner";

export function ConditionalBanner(props: ComponentProps<typeof Banner>) {
  const pathname = usePathname();
  if (pathname === "/") {
    return null;
  }
  return <Banner {...props} />;
}
