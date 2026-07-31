"use client";

import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PlusSeparator } from "@/components/blog/plus-separator";

const GrainGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.GrainGradient),
  {
    ssr: false,
  }
);

const BANNER_HEIGHT = 300;
const BANNER_READY_DELAY_MS = 400;
const BANNER_FADE_DURATION_S = 1.4;
/** Safety net if shader mount detection misses. */
const SHADER_REVEAL_FALLBACK_MS = 1800;

function supportsWebGL2() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

function waitForNextPaint(callback: () => void) {
  let raf1 = 0;
  let raf2 = 0;

  raf1 = window.requestAnimationFrame(() => {
    raf2 = window.requestAnimationFrame(callback);
  });

  return () => {
    window.cancelAnimationFrame(raf1);
    window.cancelAnimationFrame(raf2);
  };
}

function isShaderPainted(container: HTMLElement) {
  return Boolean(container.querySelector("[data-paper-shader] canvas"));
}

export function BlogHeaderBanner() {
  const [showShaders, setShowShaders] = useState(false);
  const [isFallbackVisible, setIsFallbackVisible] = useState(false);
  const [isShaderVisible, setIsShaderVisible] = useState(false);
  const shaderContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    import("@paper-design/shaders-react").catch(() => {
      // Preload only; runtime path handles missing WebGL separately.
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hasWebGL = supportsWebGL2();
      setShowShaders(hasWebGL);
      if (!hasWebGL) {
        setIsFallbackVisible(true);
      }
    }, BANNER_READY_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!showShaders) {
      setIsShaderVisible(false);
      return;
    }

    let cancelled = false;
    let retryRaf = 0;
    let cancelPaintWait: (() => void) | undefined;
    let observer: MutationObserver | undefined;
    let fallbackTimer = 0;

    const reveal = () => {
      if (cancelled) {
        return;
      }

      cancelPaintWait = waitForNextPaint(() => {
        if (!cancelled) {
          setIsShaderVisible(true);
        }
      });
    };

    const attach = (container: HTMLElement) => {
      if (isShaderPainted(container)) {
        reveal();
        return;
      }

      observer = new MutationObserver(() => {
        if (isShaderPainted(container)) {
          observer?.disconnect();
          reveal();
        }
      });
      observer.observe(container, { childList: true, subtree: true });

      fallbackTimer = window.setTimeout(() => {
        if (!cancelled) {
          reveal();
        }
      }, SHADER_REVEAL_FALLBACK_MS);
    };

    const waitForContainer = () => {
      const container = shaderContainerRef.current;
      if (!container) {
        retryRaf = window.requestAnimationFrame(waitForContainer);
        return;
      }

      attach(container);
    };

    waitForContainer();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(retryRaf);
      window.clearTimeout(fallbackTimer);
      cancelPaintWait?.();
      observer?.disconnect();
    };
  }, [showShaders]);

  const fadeTransition = {
    duration: prefersReducedMotion ? 0 : BANNER_FADE_DURATION_S,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  return (
    <section className="blog-inner px-3 sm:px-4 md:px-0">
      <div className="relative min-h-[300px] w-full overflow-hidden rounded-xl">
        <div aria-hidden className="h-[300px] w-full" />

        <PlusSeparator
          main={{ className: "z-20 opacity-40" }}
          position={["top-left", "top-right", "bottom-left", "bottom-right"]}
        />

        {showShaders ? (
          <motion.div
            animate={{ opacity: isShaderVisible ? 1 : 0 }}
            className="absolute inset-0 h-[300px] w-full"
            initial={{ opacity: 0 }}
            transition={fadeTransition}
          >
            <div className="h-full w-full" ref={shaderContainerRef}>
              <GrainGradient
                className="w-full bg-background/20"
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
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: isFallbackVisible ? 1 : 0 }}
            className="absolute inset-0 h-[300px] w-full bg-muted/25"
            initial={{ opacity: 0 }}
            transition={fadeTransition}
          />
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
