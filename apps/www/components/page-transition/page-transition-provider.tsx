"use client";

import { Typer } from "@workspace/ui/components/ui/typer";
import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
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

export function isMarketingPath(path: string): boolean {
  const clean = path.split("?")[0].split("#")[0];
  if (clean === "/" || clean === "") {
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

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode | null>(
    null
  );
  const [showTyper, setShowTyper] = useState(false);
  const [typerTrigger, setTyperTrigger] = useState<"in" | "out">("in");
  const [phraseIndex, setPhraseIndex] = useState(0);

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
    };
  }, [prefersReducedMotion]);

  const transitionTo = useCallback(
    async (href: string, mode?: TransitionMode) => {
      if (isTransitioning) {
        return;
      }
      if (pathname === href) {
        return;
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
        router.push(href);

        await new Promise((resolve) => setTimeout(resolve, 900));
        setTyperTrigger("out");
        await Promise.all([
          shader.hide(1.7, "power2.inOut"),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
        setShowTyper(false);
      } else {
        await shader.show(0.85, "power2.out");
        router.push(href);

        await new Promise((resolve) => setTimeout(resolve, 220));
        await shader.hide(1.0, "power2.inOut");
      }

      setIsTransitioning(false);
      setTransitionMode(null);
    },
    [isTransitioning, pathname, prefersReducedMotion, router]
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
