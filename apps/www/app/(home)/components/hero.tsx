"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const headings = heroRef.current?.querySelectorAll<HTMLElement>(
        "[data-load-heading]"
      );
      const logoIcon =
        heroRef.current?.querySelector<HTMLElement>("[data-load-icon]");
      const reveals =
        heroRef.current?.querySelectorAll<HTMLElement>("[data-load-reveal]");

      // 1. Text entrance with bottom-left rotation and line mask
      if (headings && headings.length > 0) {
        gsap.fromTo(
          headings,
          {
            yPercent: 100,
            rotate: 8,
            transformOrigin: "bottom left",
            opacity: 0,
          },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.08,
            ease: "expo.out",
            delay: 0.1,
          }
        );
      }

      // 2. Logo Icon 3D spin entrance
      if (logoIcon) {
        gsap.fromTo(
          logoIcon,
          {
            yPercent: 100,
            scale: 0.3,
            opacity: 0,
            rotate: -270,
            transformOrigin: "center center",
          },
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 1.2,
            ease: "expo.out",
            delay: 0.15,
          }
        );
      }

      // 3. Description reveal
      if (reveals && reveals.length > 0) {
        gsap.fromTo(
          reveals,
          {
            y: "2em",
            opacity: 0,
          },
          {
            y: "0em",
            opacity: 1,
            duration: 1.2,
            ease: "expo.out",
            delay: 0.25,
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="home-hero" data-theme-section="light" ref={heroRef}>
      <div
        className="padding-hero"
        data-wf--padding-hero--variant="nav-large"
      />

      <div className="is--md-m container">
        <div className="home-hero__content">
          <div className="home-hero__title-row" style={{ overflow: "hidden" }}>
            <h1 className="h-xl" data-load-heading="">
              Motion First
            </h1>
            {/* <svg
              className="home-hero__top-logo transition-transform duration-500 hover:scale-110 hover:rotate-12 cursor-pointer"
              data-load-icon=""
              fill="currentColor"
              viewBox="0 0 200 200"
            >
              <title>Sora UI</title>
              <g transform="translate(100 100) scale(0.8292) translate(-100 -100)">
                <path d="M 150.245 -0.676 L 150.658 49.581 L 49.237 49.477 L 49.714 -0.758 L 150.245 -0.676 Z M 49.342 150.419 L 49.237 49.477 L -1.04 49.794 L -1.304 150.337 L 49.342 150.419 Z M 150.763 150.523 L 150.658 49.581 L 201.304 49.663 L 201.04 150.206 L 150.763 150.523 Z M 150.763 150.523 L 49.342 150.419 L 49.755 200.676 L 150.286 200.758 L 150.763 150.523 Z" />
              </g>
            </svg> */}
            <h2 className="h-xl" data-load-heading="">
              For React
            </h2>
          </div>
          <div className="home-hero__description-row">
            <p className="home-hero__description-p" data-load-reveal="">
              Open-source, fully animated React component distribution built
              with TypeScript, Tailwind CSS v4, Base UI, Radix UI &amp; Motion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
