"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Banner } from "@/components/banner";
import {
  BANNER_DISMISS_CLASS,
  BANNER_HEIGHT,
  isComponentDetailPath,
} from "@/lib/banner-config";

function useBannerLayoutHeight(pathname: string) {
  useEffect(() => {
    if (isComponentDetailPath(pathname)) {
      document.documentElement.style.setProperty("--fd-banner-height", "0px");
      return;
    }

    // Site banner is always visible (no dismiss) — keep layout offset in sync.
    document.documentElement.classList.remove(BANNER_DISMISS_CLASS);
    document.documentElement.style.setProperty(
      "--fd-banner-height",
      BANNER_HEIGHT
    );
  }, [pathname]);
}

export function SiteBanner() {
  const pathname = usePathname();
  useBannerLayoutHeight(pathname);

  if (isComponentDetailPath(pathname)) {
    return null;
  }

  return (
    <Banner
      rainbowColors={[
        "rgba(255,100,0, 0.5)",
        "rgba(255,100,0, 0.5)",
        "transparent",
        "rgba(255,100,0, 0.5)",
        "transparent",
        "rgba(255,100,0, 0.5)",
        "transparent",
      ]}
      variant="rainbow"
    >
      🎉 Sora UI is now part of the shadcn/ui registry ecosystem.
    </Banner>
  );
}
