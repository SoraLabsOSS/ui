"use client";

import Link from "next/link";
import { useRef } from "react";
import { useButton3DHover } from "@/hooks/use-button-3d-hover";
import { PRICING_CORE_MESSAGE } from "./pricing-config";

export function PricingHero() {
  const containerRef = useRef<HTMLElement>(null);
  useButton3DHover(containerRef);

  return (
    <section className="home-hero" ref={containerRef}>
      <div
        className="padding-hero"
        data-wf--padding-hero--variant="nav-large"
      />

      <div className="is--md-m container">
        <div className="home-hero__content text-center">
          {/* Title at 5em */}
          <div className="mx-auto max-w-4xl">
            <h1 className="h-l text-balance text-neutral-900 leading-[1.02] tracking-tight dark:text-white">
              <span className="block">Everything you need,</span>
              <span className="block">free forever.</span>
            </h1>

            <p className="pricing-hero__subtitle mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed sm:text-xl">
              {PRICING_CORE_MESSAGE}
            </p>
          </div>

          {/* Scribble annotation & Actions */}
          <div className="relative mt-4 flex flex-col items-center">
            {/* Handwritten scribble annotation */}
            <div className="pointer-events-none absolute -top-11 left-1/2 ml-14 flex select-none items-end sm:ml-20">
              <svg
                aria-hidden="true"
                className="h-9 w-9 -rotate-12 text-[#fe624c]"
                fill="none"
                viewBox="0 0 40 40"
              >
                <title>Free discount arrow</title>
                <path
                  d="M34 6 C28 14, 16 18, 10 32"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.2"
                />
                <path
                  d="M6 23 L10 33 L20 30"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                />
              </svg>
              <span className="scribble mb-3 ml-1 -rotate-3 whitespace-nowrap font-normal text-[#fe624c] text-xl sm:text-2xl">
                100% Free
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                className="button w-inline-block rounded-[1.5rem]!"
                data-button-rotate=""
                data-button-rotate-hover=""
                data-shape="round"
                data-theme=""
                href="/docs/installation"
                style={{ borderRadius: "1.5rem" }}
              >
                <div
                  className="button-bg rounded-[1.5rem]!"
                  data-wf--button-theme--variant="electric"
                  style={{ borderRadius: "1.5rem" }}
                />
                <div className="button-label__wrap">
                  <div className="button-label">
                    <span>Start Installing</span>
                  </div>
                  <div aria-hidden="true" className="button-label">
                    <span>Start Installing</span>
                  </div>
                </div>
              </Link>
              <Link
                className="button w-inline-block rounded-[.875rem]!"
                data-button-rotate=""
                data-button-rotate-hover=""
                data-shape=""
                data-theme=""
                href="/catalog"
                style={{ borderRadius: ".875rem" }}
              >
                <div
                  className="button-bg rounded-[.875rem]!"
                  data-wf--button-theme--variant="dark-outline"
                  style={{ borderRadius: ".875rem" }}
                />
                <div className="button-label__wrap">
                  <div className="button-label">
                    <span>Browse Catalog &rarr;</span>
                  </div>
                  <div aria-hidden="true" className="button-label">
                    <span>Browse Catalog &rarr;</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
