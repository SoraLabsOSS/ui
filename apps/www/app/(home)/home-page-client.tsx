"use client";

import { useLayoutEffect } from "react";

import { Header } from "@/components/header";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeroFeatures } from "@/components/home/home-hero-features";
import { HomeTwoWays } from "@/components/home/home-two-ways";
import { WhoItsFor } from "@/components/home/who-its-for";
import { dispatchHomeScrollReady } from "@/lib/home/home-scroll-ready";
import type { LatestShippedItem } from "@/lib/registry/get-latest-shipped-registry-item";

const HOME_PAGE_ID = "home-page";
const HOME_SCROLL_CLASS =
  "relative z-0 h-[calc(100dvh-var(--fd-banner-height))] overflow-x-hidden overflow-y-auto";

interface HomePageClientProps {
  blocksCount: number;
  blocksUrl: string;
  latestShipped: LatestShippedItem | null;
  primitivesUrl: string;
}

export function HomePageClient({
  blocksCount,
  blocksUrl,
  latestShipped,
  primitivesUrl,
}: HomePageClientProps) {
  useLayoutEffect(() => {
    dispatchHomeScrollReady();
    const lateTimeoutId = window.setTimeout(() => {
      dispatchHomeScrollReady();
    }, 300);

    return () => {
      window.clearTimeout(lateTimeoutId);
    };
  }, []);

  return (
    <>
      <Header />
      <main className={HOME_SCROLL_CLASS} id={HOME_PAGE_ID}>
        <div className="flex min-h-full w-full flex-col justify-between">
          <div>
            <HomeHeroFeatures />
            <WhoItsFor primitivesUrl={primitivesUrl} />
            <HomeTwoWays
              blocksCount={blocksCount}
              blocksUrl={blocksUrl}
              primitivesUrl={primitivesUrl}
            />
            <HomeFaq />
          </div>
          <HomeFooter latestShipped={latestShipped} />
        </div>
      </main>
    </>
  );
}
