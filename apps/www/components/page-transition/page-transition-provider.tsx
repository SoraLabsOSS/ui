"use client";

import { Typer } from "@workspace/ui/components/ui/typer";
import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PageTransitionShader } from "./page-transition-shader";

export const DOCS_TRANSITION_PHRASES = [
  "explore copy install ship",
  "crafting motion through code",
  "where physics meets interface",
  "inspect tinker build deploy",
  "make interfaces feel alive",
  "initializing component studio",
  "pure craft zero boilerplate",
  "curate animate polish ship",
] as const;

export type TransitionMode = "commercial" | "docs";

export interface PageTransitionContextValue {
  isTransitioning: boolean;
  transitionMode: TransitionMode | null;
  transitionTo: (href: string, mode?: TransitionMode) => Promise<void>;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null
);

const defaultContext: PageTransitionContextValue = {
  isTransitioning: false,
  transitionMode: null,
  transitionTo: async () => Promise.resolve(),
};

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  return context ?? defaultContext;
}

export function normalizePathname(url: string): string {
  const clean = url.split("?")[0]?.split("#")[0] ?? url;
  if (clean === "" || clean === "/") {
    return "/";
  }
  return clean.endsWith("/") ? clean.slice(0, -1) : clean;
}

export function isMarketingPath(path: string): boolean {
  const clean = normalizePathname(path);
  if (clean === "/") {
    return true;
  }
  if (clean.startsWith("/pricing")) {
    return true;
  }
  if (clean.startsWith("/legal")) {
    return true;
  }
  return false;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shaderRef = useRef<PageTransitionShader | null>(null);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const pendingRouteRef = useRef<{
    targetPath: string;
    resolve: () => void;
  } | null>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode | null>(
    null
  );
  const [showTyper, setShowTyper] = useState(false);
  const [typerTrigger, setTyperTrigger] = useState<"in" | "out">("in");
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (!pendingRouteRef.current) {
      return;
    }
    const current = normalizePathname(pathname);
    if (current === pendingRouteRef.current.targetPath) {
      pendingRouteRef.current.resolve();
      pendingRouteRef.current = null;
    }
  }, [pathname]);

  const waitForRouteChange = useCallback(
    (targetHref: string, timeoutMs = 6000): Promise<void> => {
      const targetPath = normalizePathname(targetHref);
      const current = normalizePathname(pathnameRef.current);

      if (current === targetPath) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        const onDone = () => {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          resolve();
        };

        timer = setTimeout(() => {
          if (pendingRouteRef.current?.resolve === onDone) {
            pendingRouteRef.current = null;
          }
          onDone();
        }, timeoutMs);

        pendingRouteRef.current = {
          targetPath,
          resolve: onDone,
        };
      });
    },
    []
  );

  useEffect(() => {
    if (prefersReducedMotion || !canvasRef.current) {
      return;
    }
    const shader = new PageTransitionShader(canvasRef.current, {
      color: [0.0, 0.0, 0.0],
      ditherSize: 3.0,
      edgeSmoothness: 1.0,
      noiseFrequency: 0.5,
      noiseStrength: 0.8,
    });
    shaderRef.current = shader;

    return () => {
      shader.destroy();
      shaderRef.current = null;
      if (pendingRouteRef.current) {
        pendingRouteRef.current.resolve();
        pendingRouteRef.current = null;
      }
    };
  }, [prefersReducedMotion]);

  const transitionTo = useCallback(
    async (href: string, mode?: TransitionMode) => {
      if (isTransitioning) {
        return;
      }
      if (normalizePathname(pathname) === normalizePathname(href)) {
        return;
      }

      try {
        router.prefetch(href);
      } catch {
        // Ignore prefetch failures in unsupported environments
      }

      if (prefersReducedMotion) {
        router.push(href);
        return;
      }

      const shader = shaderRef.current;
      if (!shader) {
        router.push(href);
        return;
      }

      const selectedMode: TransitionMode =
        mode ??
        (href === "/docs" || href.startsWith("/docs") ? "docs" : "commercial");

      setIsTransitioning(true);
      setTransitionMode(selectedMode);

      if (selectedMode === "docs") {
        setPhraseIndex((prev) => {
          let next = Math.floor(Math.random() * DOCS_TRANSITION_PHRASES.length);
          if (next === prev && DOCS_TRANSITION_PHRASES.length > 1) {
            next = (next + 1) % DOCS_TRANSITION_PHRASES.length;
          }
          return next;
        });
        setTyperTrigger("in");
        setShowTyper(true);
        await shader.show(1.1, "power2.out");

        // Allow Typer to settle fully into hold state before initiating route render
        await new Promise((resolve) => setTimeout(resolve, 200));

        const routePromise = waitForRouteChange(href, 6000);

        startTransition(() => {
          router.push(href);
        });

        // Wait for both minimum reading hold and actual route mount
        const minHoldPromise = new Promise((resolve) =>
          setTimeout(resolve, 500)
        );
        await Promise.all([minHoldPromise, routePromise]);

        // Double rAF ensures browser paints the new page under the overlay
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });

        setTyperTrigger("out");
        await Promise.all([
          shader.hide(1.7, "power2.inOut"),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
        setShowTyper(false);
      } else {
        await shader.show(0.85, "power2.out");

        const routePromise = waitForRouteChange(href, 6000);

        startTransition(() => {
          router.push(href);
        });

        const minHoldPromise = new Promise((resolve) =>
          setTimeout(resolve, 220)
        );
        await Promise.all([minHoldPromise, routePromise]);

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });

        await shader.hide(1.0, "power2.inOut");
      }

      setIsTransitioning(false);
      setTransitionMode(null);
    },
    [
      isTransitioning,
      pathname,
      prefersReducedMotion,
      router,
      waitForRouteChange,
    ]
  );

  const value = useMemo(
    () => ({
      isTransitioning,
      transitionMode,
      transitionTo,
    }),
    [isTransitioning, transitionMode, transitionTo]
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      {!prefersReducedMotion && (
        <div
          aria-hidden={!isTransitioning}
          className={cn(
            "pointer-events-none fixed inset-0 z-[99999] transition-opacity duration-300",
            isTransitioning ? "pointer-events-auto opacity-100" : "opacity-0"
          )}
        >
          <canvas className="absolute inset-0 h-full w-full" ref={canvasRef} />
          {transitionMode === "docs" && showTyper && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
              <div
                className="flex select-none items-center justify-center font-bold font-mono text-base uppercase tracking-wider transition-typer-banner sm:text-xl md:text-2xl lg:text-3xl"
                style={
                  {
                    "--accent": "#fb460d",
                    "--background": "#000000",
                    "--foreground": "#fb460d",
                    "--typer-space-width": "clamp(1.25rem, 3.5vw, 3rem)",
                    color: "#fb460d",
                  } as React.CSSProperties
                }
              >
                <style>{`
                  .transition-typer-banner [data-typer] .space {
                    display: inline-block !important;
                    flex-shrink: 0 !important;
                    width: clamp(1.25rem, 3.5vw, 3rem) !important;
                  }
                `}</style>
                <Typer
                  className="inline-flex items-center justify-center whitespace-nowrap"
                  cycleLength={0.5}
                  cycles={3}
                  fps={20}
                  key={DOCS_TRANSITION_PHRASES[phraseIndex]}
                  trigger={typerTrigger}
                  variations={[
                    "charFill",
                    "charBorder",
                    "charAccent",
                    "charAccentFill",
                  ]}
                >
                  {DOCS_TRANSITION_PHRASES[phraseIndex]}
                </Typer>
              </div>
            </div>
          )}
        </div>
      )}
    </PageTransitionContext.Provider>
  );
}
