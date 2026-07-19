// biome-ignore-all lint: GSAP-driven draggable scrollbar/chapter-panel primitive
"use client";

import { useGSAP } from "@gsap/react";
import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";
import {
  observeWindowResize,
  waitForScrollerReady,
} from "@/registry/lib/scroll-trigger-utils";

gsap.registerPlugin(Draggable, ScrollTrigger);

const GHOST_OPACITY = 0.45;
const PANEL_BREAKPOINT = "(min-width: 768px)";

/**
 * Minimal layout defaults — structural only, plus a `bg-foreground`
 * fallback on the cursor/ghost so the widget isn't invisible out of the
 * box. It's the *first* class in the string precisely so `classNames`
 * (merged in after, see `resolveScrollChaptersClasses`) can override it —
 * a fallback color appended after `classNames` in the `cn()` chain would
 * win via tailwind-merge's last-conflicting-utility-wins rule and quietly
 * clobber whatever color a consumer passed in.
 */
const LAYOUT = {
  chapter: "relative w-full",
  cursor:
    "bg-foreground absolute top-[-0.125rem] z-[5] h-4 w-[3px] cursor-grab rounded-[3px] [will-change:transform]",
  cursorGhost: "pointer-events-none z-[4] opacity-0",
  nav: "pointer-events-none fixed right-16 bottom-16 z-20 h-64 w-84 max-w-[calc(100%-2rem)] overflow-hidden",
  panel:
    "pointer-events-none absolute inset-x-0 bottom-12 z-[1] w-full opacity-0 [will-change:transform,opacity]",
  // z-[2]: must stay above the panel (z-[1]) so the track/cursor never
  // visually loses to it if their boxes happen to overlap — the panel is
  // read-only, pointer-events-none, so this only affects paint order.
  progressCard: "absolute inset-x-0 bottom-0 z-[2] h-10 opacity-0",
  root: "relative w-full",
  tick: "pointer-events-none relative z-0 h-3 flex-1 opacity-0",
  track:
    "relative top-[0.865rem] left-4 flex h-3 w-[calc(100%-2rem)] cursor-pointer",
} as const;

export interface ScrollChaptersChapter {
  /** In-flow section content — fully consumer-supplied markup. */
  content: ReactNode;
  id: string;
  /** Omit to opt this chapter out of showing a panel entirely. */
  preview?: ReactNode;
}

export interface ScrollChaptersClassNames {
  chapter?: string;
  cursor?: string;
  cursorGhost?: string;
  nav?: string;
  panel?: string;
  progressCard?: string;
  tick?: string;
  track?: string;
}

export interface ScrollChaptersProps {
  chapters: ScrollChaptersChapter[];
  className?: string;
  /** Per-slot class overrides. `cn()` merges after the structural defaults. */
  classNames?: ScrollChaptersClassNames;
  /** Use container query height (`cqh`) instead of viewport height (`svh`) for embedded mode. @default false */
  containerQuery?: boolean;
  /** Catalog/docs preview — sizes chapters against `scroller` instead of the viewport. @default false */
  embedded?: boolean;
  /** Progress (0-1) above which the widget hides, when `hideCardAtEnd` is true. @default 0.98 */
  endThreshold?: number;
  /** Hide the whole widget near the very end of the content. @default true */
  hideCardAtEnd?: boolean;
  /** Hide the whole widget near the very start of the content. @default true */
  hideCardAtStart?: boolean;
  /**
   * GSAP ScrollTrigger refresh priority. Lower numbers refresh later.
   * @default -1
   */
  refreshPriority?: number;
  /** Scroll container for ScrollTrigger. Defaults to `window`. */
  scroller?: Element | Window;
  /** Progress (0-1) below which the widget hides, when `hideCardAtStart` is true. @default 0.02 */
  startThreshold?: number;
}

function resolveScrollChaptersClasses(
  className: string | undefined,
  classNames: ScrollChaptersClassNames | undefined
) {
  return {
    chapter: cn(LAYOUT.chapter, classNames?.chapter),
    cursor: cn(LAYOUT.cursor, classNames?.cursor),
    cursorGhost: cn(LAYOUT.cursorGhost, classNames?.cursorGhost),
    nav: cn(LAYOUT.nav, classNames?.nav),
    panel: cn(LAYOUT.panel, classNames?.panel),
    progressCard: cn(LAYOUT.progressCard, classNames?.progressCard),
    root: cn(LAYOUT.root, className),
    tick: cn(LAYOUT.tick, classNames?.tick),
    track: cn(LAYOUT.track, classNames?.track),
  };
}

export function ScrollChapters({
  chapters,
  className,
  classNames,
  containerQuery = false,
  embedded = false,
  endThreshold = 0.98,
  hideCardAtEnd = true,
  hideCardAtStart = true,
  refreshPriority = -1,
  scroller: scrollerProp,
  startThreshold = 0.02,
}: ScrollChaptersProps) {
  const classes = resolveScrollChaptersClasses(className, classNames);
  const prefersReducedMotion = usePrefersReducedMotion();

  const rootRef = useRef<HTMLElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const progressCardRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const [displayedChapter, setDisplayedChapter] = useState<
    ScrollChaptersChapter | undefined
  >();

  const hasCards = chapters.length > 0;

  useGSAP(
    () => {
      if (!hasCards) {
        return;
      }

      const root = rootRef.current;
      const nav = navRef.current;
      const progressCard = progressCardRef.current;
      const track = trackRef.current;
      const cursor = cursorRef.current;
      const ghost = ghostRef.current;
      const panel = panelRef.current;

      if (!(root && nav && progressCard && track && cursor && ghost && panel)) {
        return;
      }

      if (embedded && scrollerProp === undefined) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[ScrollChapters] embedded=true requires a `scroller` prop — animation will not mount without it."
          );
        }
        return;
      }

      let disposed = false;
      let masterTrigger: ScrollTrigger | null = null;
      let draggable: Draggable | undefined;
      let mm: ReturnType<typeof gsap.matchMedia> | null = null;
      let unbindResize: (() => void) | undefined;
      let resizeObserver: ResizeObserver | undefined;
      const cleanupFns: (() => void)[] = [];

      const mount = async () => {
        const chapterEls = chapterRefs.current.filter(
          (el): el is HTMLElement => el !== null
        );
        const ticks = tickRefs.current.filter(
          (el): el is HTMLDivElement => el !== null
        );

        if (chapterEls.length !== chapters.length) {
          return;
        }

        const scroller = scrollerProp ?? window;
        await waitForScrollerReady(scroller);

        if (disposed || rootRef.current !== root) {
          return;
        }

        if (prefersReducedMotion) {
          gsap.set(progressCard, { opacity: 0 });
          gsap.set(panel, { opacity: 0 });
          return;
        }

        const snapStep = gsap.utils.snap(1 / 65);
        const clampProgress = gsap.utils.clamp(0, 1);
        const cursorTravel = () => track.offsetWidth - cursor.offsetWidth;

        const progressFromEvent = (e: MouseEvent) => {
          const rect = track.getBoundingClientRect();
          const raw = (e.clientX - rect.left) / rect.width;
          return clampProgress(snapStep(raw));
        };

        gsap.set(cursor, { x: 0 });
        gsap.set(ghost, { x: 0, opacity: 0 });
        gsap.set(progressCard, { opacity: 0, y: "100%" });
        gsap.set(ticks, { opacity: 0 });
        gsap.set(panel, { opacity: 0, y: "120%" });
        gsap.set(nav, { pointerEvents: "none" });

        const grabCursor = () => {
          gsap.to(cursor, { duration: 0.25, scale: 1.25 });
        };
        const releaseCursor = () => {
          gsap.to(cursor, { duration: 0.15, scale: 1 });
        };

        // Draggable re-reads the element's live transform on every `onPress`,
        // so there's no need to resync it here — doing so mid-tween (via
        // `.update()`) snaps the element back to Draggable's last-known
        // position and fights the tween started below. `overwrite: "auto"`
        // matters too: `true` kills *every* other tween on this target,
        // including the reveal scale-in below — since this runs on every
        // scroll tick, that permanently strands the cursor mid-tween.
        const setCursorProgress = (progress: number) => {
          gsap.to(cursor, {
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto",
            x: progress * cursorTravel(),
          });
        };

        let widgetVisible = false;
        // Whether the panel is currently showing *something* — tracked
        // separately so a same-visibility transition (chapter A's panel ->
        // chapter B's panel, both showing) can play a quick refresh flash
        // instead of reusing the reveal/hide tween, which would be a no-op.
        let panelVisible = false;
        // Gated by the mobile matchMedia below — panels never show under
        // the breakpoint, mirroring the original's mobile skip.
        let panelsEnabled = false;
        // The active chapter is derived from a single progress value (the
        // same one driving the cursor), not N independent per-chapter
        // ScrollTriggers each guessing their own "top center"/"bottom
        // center" boundary in pixels. Two separately-rounded boundaries
        // that are each supposed to land on the exact same scroll
        // position (chapter i's end == chapter i+1's start, in theory)
        // can be off by a pixel in `embedded`/`containerQuery` mode,
        // where chapter height comes from a `cqh` calc — that 1px gap is
        // a dead zone where *no* chapter is "active", which stops
        // scrolling right on it hides the panel with nothing left to
        // bring it back. A single division has no second number to
        // disagree with.
        let activeChapterIndex = -1;
        const currentChapter = () => chapters[activeChapterIndex];
        const chapterIndexForProgress = (progress: number) =>
          gsap.utils.clamp(
            0,
            chapters.length - 1,
            Math.floor(progress * chapters.length)
          );

        // Holds whichever tween/timeline `syncPanel` last started, so the
        // *next* call can explicitly `.kill()` it up front. A drag
        // gesture can cross several chapters within milliseconds — each
        // crossing calls `syncPanel` again before the previous call's
        // animation has finished. Relying on each `.to()`'s own
        // `overwrite: "auto"` to cancel the previous call's tween isn't
        // reliable here: GSAP's auto-overwrite scans for *other active
        // tweens of the same target*, but tweens nested inside a
        // `gsap.timeline()` (the flash branch below creates a fresh one
        // every call) aren't always found and killed the same way plain
        // `gsap.to()` calls are — in testing, a fast multi-chapter drag
        // could leave an earlier call's `onComplete` (which sets
        // `displayedChapter`) firing *after* a later call's, leaving the
        // panel showing stale content indefinitely. Explicitly killing
        // the previous animation removes any ambiguity: only the latest
        // call's `onComplete` can ever run.
        let panelTween: gsap.core.Timeline | gsap.core.Tween | null = null;

        const syncPanel = (
          show: boolean,
          chapter: ScrollChaptersChapter | undefined
        ) => {
          const shouldShow = widgetVisible && panelsEnabled && show;
          panelTween?.kill();
          if (shouldShow && panelVisible) {
            // Swap the rendered content at the trough of the flash, while
            // the panel is faded down to opacity 0 — never while it's
            // visibly on screen with its old height.
            panelTween = gsap
              .timeline()
              .to(panel, {
                duration: 0.15,
                ease: "power2.in",
                onComplete: () => setDisplayedChapter(chapter),
                opacity: 0,
                y: -6,
              })
              .to(panel, {
                duration: 0.25,
                ease: "power3.out",
                opacity: 1,
                y: 0,
              });
          } else if (shouldShow) {
            // Coming from hidden: the panel has no height on screen yet
            // (opacity 0, translated off), so it's safe to set the new
            // content immediately, before the reveal tween runs.
            setDisplayedChapter(chapter);
            panelTween = gsap.to(panel, {
              duration: 0.35,
              ease: "power3.inOut",
              opacity: 1,
              y: 0,
            });
          } else {
            panelTween = gsap.to(panel, {
              duration: 0.25,
              ease: "power3.inOut",
              onComplete: () => setDisplayedChapter(undefined),
              opacity: 0,
              y: "120%",
            });
          }
          panelVisible = shouldShow;
        };

        const syncCurrentPanel = () => {
          const chapter = currentChapter();
          syncPanel(Boolean(chapter?.preview), chapter);
        };

        const updateActiveChapter = (progress: number) => {
          const index = chapterIndexForProgress(progress);
          if (index === activeChapterIndex) {
            return;
          }
          activeChapterIndex = index;
          syncCurrentPanel();
        };

        let navHidden = true;
        const revealNav = () => {
          if (!navHidden) {
            return;
          }
          navHidden = false;
          widgetVisible = true;
          gsap.set(nav, { pointerEvents: "auto" });
          gsap
            .timeline({ id: "reveal-scroll-chapters-nav" })
            .to(progressCard, { duration: 0.25, opacity: 1, y: 0 })
            .to(ticks, { duration: 0.25, opacity: 0.5, stagger: 0.02 }, "<")
            .fromTo(
              cursor,
              { opacity: 0, scale: 0 },
              { duration: 0.25, ease: "back.out(2)", opacity: 1, scale: 1 },
              "<+=0.05"
            );
          syncCurrentPanel();
        };
        const hideNav = () => {
          if (navHidden) {
            return;
          }
          navHidden = true;
          widgetVisible = false;
          gsap.set(nav, { pointerEvents: "none" });
          gsap.to(progressCard, { duration: 0.25, opacity: 0, y: "100%" });
          gsap.to(ticks, { duration: 0.2, opacity: 0 });
          syncCurrentPanel();
        };
        const toggleNav = (progress: number) => {
          if (hideCardAtStart && progress < startThreshold) {
            hideNav();
          } else if (hideCardAtEnd && progress > endThreshold) {
            hideNav();
          } else {
            revealNav();
          }
        };

        masterTrigger = ScrollTrigger.create({
          end: "bottom bottom",
          onUpdate: (self) => {
            if (!draggable?.isDragging) {
              setCursorProgress(self.progress);
            }
            updateActiveChapter(self.progress);
            toggleNav(self.progress);
          },
          refreshPriority,
          scroller,
          start: "top top",
          trigger: root,
        });

        const st = masterTrigger;

        draggable = Draggable.create(cursor, {
          activeCursor: "grabbing",
          bounds: track,
          cursor: "grab",
          onDrag() {
            const progress = clampProgress(this.x / cursorTravel());
            st.scroll(gsap.utils.interpolate(st.start, st.end, progress));
            // Update immediately rather than waiting for the `scroll`
            // event this triggers to round-trip back to `st`'s own
            // onUpdate — keeps the panel glued to the cursor while
            // dragging instead of lagging a frame behind.
            updateActiveChapter(progress);
          },
          onPress: grabCursor,
          onRelease() {
            releaseCursor();
            toggleNav(clampProgress(this.x / cursorTravel()));
          },
          type: "x",
        })[0];

        const showGhost = () => {
          gsap.to(ghost, { duration: 0.15, opacity: GHOST_OPACITY });
        };
        const hideGhost = () => {
          gsap.to(ghost, { duration: 0.15, opacity: 0 });
        };
        const onTrackMove = (e: MouseEvent) => {
          if (draggable?.isDragging || e.target === cursor) {
            hideGhost();
            return;
          }
          gsap.to(ghost, {
            duration: 0.12,
            ease: "power2.out",
            opacity: GHOST_OPACITY,
            x: progressFromEvent(e) * cursorTravel(),
          });
        };
        const onTrackClick = (e: MouseEvent) => {
          if (e.target === cursor) {
            return;
          }
          st.scroll(
            gsap.utils.interpolate(st.start, st.end, progressFromEvent(e))
          );
        };

        track.addEventListener("click", onTrackClick);
        track.addEventListener("mousemove", onTrackMove);
        track.addEventListener("mouseenter", showGhost);
        track.addEventListener("mouseleave", hideGhost);
        cursor.addEventListener("mouseenter", grabCursor);
        cursor.addEventListener("mouseleave", releaseCursor);
        cleanupFns.push(() => {
          track.removeEventListener("click", onTrackClick);
          track.removeEventListener("mousemove", onTrackMove);
          track.removeEventListener("mouseenter", showGhost);
          track.removeEventListener("mouseleave", hideGhost);
          cursor.removeEventListener("mouseenter", grabCursor);
          cursor.removeEventListener("mouseleave", releaseCursor);
        });

        // Mirrors the original's mobile skip: panels never animate in
        // below the breakpoint at all. `activeChapterIndex` itself still
        // updates below the breakpoint (cheap, and keeps state correct
        // if the viewport grows back past it) — only the panel's
        // visibility is gated.
        mm = gsap.matchMedia();
        mm.add(PANEL_BREAKPOINT, () => {
          panelsEnabled = true;
          syncCurrentPanel();

          return () => {
            panelsEnabled = false;
            syncCurrentPanel();
          };
        });

        if (scroller instanceof HTMLElement) {
          resizeObserver = new ResizeObserver(() => {
            ScrollTrigger.refresh();
          });
          resizeObserver.observe(scroller);
        } else {
          unbindResize = observeWindowResize(() => {
            ScrollTrigger.refresh();
          });
        }

        ScrollTrigger.refresh();
      };

      void mount();

      return () => {
        disposed = true;
        resizeObserver?.disconnect();
        unbindResize?.();
        mm?.revert();
        masterTrigger?.kill();
        draggable?.kill();
        for (const cleanup of cleanupFns) {
          cleanup();
        }
      };
    },
    {
      dependencies: [
        chapters,
        embedded,
        scrollerProp,
        refreshPriority,
        hasCards,
        prefersReducedMotion,
        hideCardAtStart,
        hideCardAtEnd,
        startThreshold,
        endThreshold,
      ],
      scope: rootRef,
    }
  );

  return (
    <section className={classes.root} ref={rootRef}>
      {chapters.map((chapter, index) => (
        <article
          className={classes.chapter}
          data-chapter={chapter.id}
          key={chapter.id}
          ref={(el) => {
            chapterRefs.current[index] = el;
          }}
          style={containerQuery ? { height: "100cqh" } : undefined}
        >
          {chapter.content}
        </article>
      ))}

      <div className={classes.nav} ref={navRef}>
        <div className={classes.progressCard} ref={progressCardRef}>
          <div className={classes.track} ref={trackRef}>
            {chapters.map((chapter, index) => (
              <div
                aria-hidden="true"
                className={cn(
                  classes.tick,
                  "border-l",
                  index === chapters.length - 1 && "border-r"
                )}
                key={chapter.id}
                ref={(el) => {
                  tickRefs.current[index] = el;
                }}
              />
            ))}
            <div className={classes.cursor} ref={cursorRef} />
            <div
              aria-hidden="true"
              className={cn(classes.cursor, classes.cursorGhost)}
              ref={ghostRef}
            />
          </div>
        </div>

        <div
          className={classes.panel}
          data-card={displayedChapter?.id}
          ref={panelRef}
        >
          {displayedChapter?.preview}
        </div>
      </div>
    </section>
  );
}
