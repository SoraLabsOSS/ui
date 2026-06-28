"use client";

import { useEffect, useRef } from "react";
import { initAnimatedFooter } from "@/lib/brand-landing/animated-footer-engine";
import { BRAND_NAV_LINKS, BRAND_TAGLINE } from "@/lib/brand-landing/config";
import { isInitialLoad } from "@/lib/brand-landing/preloader-state";

export function AnimatedFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const autoReveal = prefersReducedMotion || !isInitialLoad;

    return initAnimatedFooter(footer, { autoReveal });
  }, []);

  return (
    <footer
      className="fixed inset-0 z-0 flex h-svh w-full flex-col overflow-hidden bg-background max-[1000px]:justify-start max-[1000px]:gap-4 max-[1000px]:overflow-y-auto"
      ref={footerRef}
    >
      <div className="footer-content relative z-10 flex w-full shrink-0 justify-between gap-8 p-6 text-foreground max-[1000px]:flex-col max-[1000px]:p-6 min-[1001px]:absolute min-[1001px]:top-0 min-[1001px]:left-0 min-[1001px]:p-8">
        <nav aria-label="Primary" className="footer-links flex flex-col gap-1">
          {BRAND_NAV_LINKS.map((link) => (
            <a
              className="text-[1.1rem] text-foreground no-underline transition-colors hover:text-accent-brand max-[1000px]:text-base"
              href={link.href}
              key={link.label}
              rel={link.external ? "noopener noreferrer" : undefined}
              target={link.external ? "_blank" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="footer-text max-w-md max-[1000px]:max-w-full">
          <p className="text-[1.1rem] leading-[1.4] max-[1000px]:text-base max-[1000px]:leading-[1.45]">
            {BRAND_TAGLINE}
          </p>
        </div>
      </div>

      <div className="footer-stage relative mx-auto flex w-full max-w-[1400px] flex-1 items-center justify-center overflow-visible px-2 max-[1000px]:min-h-[min(420px,55vh)] max-[1000px]:flex-none max-[1000px]:shrink-0 min-[1001px]:px-5 min-[1001px]:pb-12">
        {/* <div className="footer-center relative z-10 flex scale-75 flex-col items-center sm:scale-[0.85] lg:scale-100">
          <div className="footer-header text-center">
            <h1 className="overflow-hidden font-medium text-[clamp(3.5rem,12vw,9rem)] leading-none tracking-[-0.02em]">
              Sora
            </h1>
          </div>
        </div> */}

        <div className="footer-hand-slot footer-hand-slot--left pointer-events-none absolute inset-y-0 left-0 flex w-full items-center overflow-visible">
          <div className="footer-hand-img pointer-events-none relative w-[min(52vw,640px)] max-w-[48%] will-change-transform max-[1000px]:w-[min(50vw,240px)] max-[1000px]:max-w-[48%] min-[1001px]:pointer-events-auto">
            {/* biome-ignore lint/performance/noImgElement: hidden sampler for ASCII canvas */}
            <img
              alt=""
              className="ascii-hand block w-full opacity-0"
              height={1}
              src="/hand-left.jpg"
              width={1}
            />
            <canvas className="absolute inset-0 h-full w-full" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-[min(18%,120px)] bg-gradient-to-r from-background via-background/80 to-transparent"
          />
        </div>

        <div className="footer-hand-slot footer-hand-slot--right pointer-events-none absolute inset-y-0 right-0 flex w-full items-center justify-end overflow-visible">
          <div className="footer-hand-img pointer-events-none relative w-[min(52vw,640px)] max-w-[48%] will-change-transform max-[1000px]:w-[min(50vw,240px)] max-[1000px]:max-w-[48%] min-[1001px]:pointer-events-auto">
            {/* biome-ignore lint/performance/noImgElement: hidden sampler for ASCII canvas */}
            <img
              alt=""
              className="ascii-hand block w-full opacity-0"
              height={1}
              src="/hand-right.jpg"
              width={1}
            />
            <canvas className="absolute inset-0 h-full w-full" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-[min(18%,120px)] bg-gradient-to-l from-background via-background/80 to-transparent"
          />
        </div>
      </div>
    </footer>
  );
}
