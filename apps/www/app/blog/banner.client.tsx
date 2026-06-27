"use client";

import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlusSeparator } from "@/components/blog/plus-separator";

const GrainGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.GrainGradient),
  {
    ssr: false,
  }
);

const BANNER_HEIGHT = 300;

export function BlogHeaderBanner() {
  const [showShaders, setShowShaders] = useState(false);
  const isMobile = useIsMobile();

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
    <section className="w-full">
      <div className="blog-inner relative flex min-h-[300px] overflow-hidden rounded-xl">
        <PlusSeparator
          main={{ className: "z-20 opacity-40" }}
          position={["top-left", "top-right", "bottom-left", "bottom-right"]}
        />
        {showShaders ? (
          <div className="h-[300px] w-full">
            <GrainGradient
              className="w-full animate-fd-fade-in bg-background/20 duration-1000"
              colorBack="#ffffff00"
              colors={["#fb460d", "#c9784a", "#e8ddd6"]}
              height={BANNER_HEIGHT}
              intensity={0.15}
              noise={isMobile ? 0.25 : 0.5}
              offsetX={1}
              offsetY={0.6}
              scale={isMobile ? 1 : 2.5}
              shape="wave"
              softness={0.7}
              speed={0.7}
            />
          </div>
        ) : (
          <div className="h-[300px] w-full" />
        )}
        <div className="absolute inset-0 z-10 h-full w-full text-foreground">
          <div className="flex h-full flex-col justify-center gap-3 px-8 py-12 sm:px-10 md:gap-4 md:px-12 md:py-16">
            <h2 className="text-2xl md:text-4xl">
              Sora <span className="text-accent-pro">Blog.</span>
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
