"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

import { Header } from "@/components/header";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeroFeatures } from "@/components/home/home-hero-features";
import { HomeLenis } from "@/components/home/home-lenis";
import { HomeTwoWays } from "@/components/home/home-two-ways";
import { WhoItsFor } from "@/components/home/who-its-for";
import {
  dispatchHomeScrollReady,
  HOME_SCROLL_READY_EVENT,
} from "@/lib/home/home-scroll-ready";
import type { LatestShippedItem } from "@/lib/registry/get-latest-shipped-registry-item";

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
  useEffect(() => {
    const refresh = () => {
      ScrollTrigger.refresh();
    };

    const onHomeScrollReady = () => {
      refresh();
    };

    window.addEventListener(HOME_SCROLL_READY_EVENT, onHomeScrollReady);

    const frameId = requestAnimationFrame(refresh);
    const timeoutId = window.setTimeout(refresh, 150);
    const lateTimeoutId = window.setTimeout(() => {
      dispatchHomeScrollReady();
    }, 300);

    return () => {
      window.removeEventListener(HOME_SCROLL_READY_EVENT, onHomeScrollReady);
      cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      window.clearTimeout(lateTimeoutId);
    };
  }, []);

  return (
    <>
      <Header className="top-[calc(var(--fd-banner-height)+0.75rem)]" />
      <HomeLenis>
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
      </HomeLenis>
    </>
  );
}
