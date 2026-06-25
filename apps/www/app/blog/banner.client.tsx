"use client";

import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { PlusSeparator } from "@/components/blog/plus-separator";

const GrainGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.GrainGradient),
  {
    ssr: false,
  }
);

const BANNER_HEIGHT = 300;

const BANNER_GRADIENT = {
  dark: {
    colors: ["#fb460d", "#1a1a1a", "#0c0c0c"],
    colorBack: "#09090b",
    intensity: 0.1,
    noise: 0.35,
  },
  light: {
    colors: ["#fb460d", "#f3ece6", "#fafafa"],
    colorBack: "#fafafa",
    intensity: 0.08,
    noise: 0.3,
  },
} as const;

export function BlogHeaderBanner() {
  const [showShaders, setShowShaders] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const isDark = resolvedTheme === "dark";
  const gradient = isDark ? BANNER_GRADIENT.dark : BANNER_GRADIENT.light;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Delay avoids uniform load errors on slower devices.
    const timer = window.setTimeout(() => {
      setShowShaders(true);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section className="w-full border-border/40 border-b">
      <div className="blog-inner relative flex min-h-[300px] border-border/40 border-x">
        <PlusSeparator
          main={{ className: "z-20" }}
          position={["top-left", "top-right", "bottom-left", "bottom-right"]}
        />
        {showShaders && isMounted ? (
          <div className="relative h-[300px] w-full">
            <GrainGradient
              className="w-full animate-fd-fade-in bg-background/20 duration-1000"
              colorBack={gradient.colorBack}
              colors={[...gradient.colors]}
              height={BANNER_HEIGHT}
              intensity={gradient.intensity}
              key={resolvedTheme}
              noise={isMobile ? 0.25 : gradient.noise}
              offsetX={1}
              offsetY={0.6}
              scale={isMobile ? 1 : 2.5}
              shape="wave"
              softness={0.7}
              speed={0.7}
            />
            {isDark ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-background/25"
              />
            ) : null}
          </div>
        ) : (
          <div className="h-[300px] w-full bg-muted/30" />
        )}
        <div className="absolute inset-0 z-10 h-full w-full text-foreground">
          <div className="flex h-full flex-col justify-center gap-3 px-8 py-12 sm:px-10 md:gap-4 md:px-12 md:py-16">
            <h2 className="text-2xl md:text-4xl">
              Sora UI <span className="text-accent-pro">blog.</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Notes on motion, UI craft, and shipping React experiences.
            </p>
            <Link
              className="font-mono text-blue-600 hover:underline dark:text-blue-400"
              href="/blog/rss.xml"
            >
              [/rss.xml]
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
