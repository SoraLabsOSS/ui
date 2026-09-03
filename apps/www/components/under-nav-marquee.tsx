"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface UnderNavMarqueeProps {
  isMenuOpen?: boolean;
  isScrollingStarted?: boolean;
}

export function UnderNavMarquee({
  isMenuOpen = false,
  isScrollingStarted: isScrollingStartedProp,
}: UnderNavMarqueeProps = {}) {
  const [internalScrollingStarted, setInternalScrollingStarted] =
    useState(false);

  useEffect(() => {
    if (isScrollingStartedProp !== undefined) {
      return;
    }
    const onScroll = () => {
      setInternalScrollingStarted(window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isScrollingStartedProp]);

  const isScrollingStarted = isScrollingStartedProp ?? internalScrollingStarted;
  const isHidden = isMenuOpen || isScrollingStarted;

  return (
    <div
      className="under-nav-bar"
      data-wf--under-nav-bar--variant="lightning"
      style={{
        opacity: isHidden ? 0 : 1,
        visibility: isHidden ? "hidden" : "visible",
        transform: isHidden
          ? "translateY(-2em) scale(0.975) rotate(0.001deg)"
          : "translateY(0em) scale(1) rotate(0.001deg)",
        transition: "all 0.6s cubic-bezier(0.625, 0.05, 0, 1)",
      }}
    >
      <div className="under-nav-bar__inner">
        <Link className="nav-marquee w-inline-block" href="/catalog">
          <div
            className="marquee-css"
            data-css-marquee=""
            style={{ animationDuration: "30s" }}
          >
            <div className="marquee-css__list" data-css-marquee-list="nav">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static repeated marquee item
                <div className="marquee-css__item" key={i}>
                  <p className="eyebrow is--nav-marquee">
                    Explore components built with Sora UI
                  </p>
                  <svg
                    className="marquee-css__item-svg"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                    width="100%"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Dot</title>
                    <circle cx="4" cy="4" fill="currentColor" r="3" />
                  </svg>
                </div>
              ))}
            </div>
            <div className="marquee-css__list" data-css-marquee-list="nav">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static repeated marquee item
                <div className="marquee-css__item" key={`repeat-${i}`}>
                  <p className="eyebrow is--nav-marquee">
                    Explore components built with Sora UI
                  </p>
                  <svg
                    className="marquee-css__item-svg"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                    width="100%"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Dot</title>
                    <circle cx="4" cy="4" fill="currentColor" r="3" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
