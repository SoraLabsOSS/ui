"use client";

import { useEffect, useRef } from "react";
import { initAnimatedFooter } from "@/lib/brand-landing/animated-footer-engine";
import { BRAND_NAV_LINKS, BRAND_TAGLINE } from "@/lib/brand-landing/config";

export function AnimatedFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) {
      return;
    }

    return initAnimatedFooter(footer);
  }, []);

  return (
    <footer
      className="fixed inset-0 z-0 flex h-svh w-full flex-col overflow-hidden bg-background max-[1000px]:justify-start max-[1000px]:gap-6 max-[1000px]:overflow-y-auto"
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

      <div className="footer-images pointer-events-none relative flex shrink-0 touch-none items-start justify-between px-2 max-[1000px]:origin-top max-[1000px]:scale-[0.9] min-[1001px]:pointer-events-auto min-[1001px]:absolute min-[1001px]:inset-0 min-[1001px]:min-h-0 min-[1001px]:flex-1 min-[1001px]:scale-100 min-[1001px]:touch-auto min-[1001px]:items-center min-[1001px]:px-0 min-[1001px]:pb-0">
        <div className="footer-hand-img relative w-[46%] min-w-0 will-change-transform min-[1001px]:w-[40%] min-[1001px]:min-w-[200px]">
          {/* biome-ignore lint/performance/noImgElement: hidden sampler for ASCII canvas, matches Codegrid demo */}
          <img
            alt=""
            className="ascii-hand block w-full opacity-0"
            src="/hand-left.jpg"
          />
          <canvas className="absolute inset-0 h-full w-full" />
        </div>

        <div className="footer-hand-img relative w-[46%] min-w-0 will-change-transform min-[1001px]:w-[40%] min-[1001px]:min-w-[200px]">
          {/* biome-ignore lint/performance/noImgElement: hidden sampler for ASCII canvas, matches Codegrid demo */}
          <img
            alt=""
            className="ascii-hand block w-full opacity-0"
            src="/hand-right.jpg"
          />
          <canvas className="absolute inset-0 h-full w-full" />
        </div>
      </div>
    </footer>
  );
}
