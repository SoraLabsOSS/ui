"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  type Dispatch,
  type Ref,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type GsapScrollbarDemoChapter,
  gsapScrollbarDemoChapters,
} from "@/lib/demo/gsap-scrollbar-demo-chapters";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

import "./gsap-scrollbar-demo.css";

gsap.registerPlugin(Draggable, ScrollTrigger);

const GHOST_OPACITY = 0.45;

interface ContentProps {
  chapters: GsapScrollbarDemoChapter[];
  onActiveSectionChange: Dispatch<SetStateAction<number>>;
  onShowScrollCardChange: Dispatch<SetStateAction<boolean>>;
  prefersReducedMotion: boolean;
  ref: Ref<HTMLDivElement>;
}

/** Renders the scrollable chapters and reports which one is active. */
function Content({
  chapters,
  onActiveSectionChange,
  onShowScrollCardChange,
  prefersReducedMotion,
  ref,
}: ContentProps) {
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        return;
      }

      const chapterEls = chapterRefs.current.filter(
        (el): el is HTMLElement => el !== null
      );

      // Tracked locally (not read back from React state) so leaveChapter
      // can tell "am I still the active one?" synchronously, regardless
      // of which order GSAP fires the outgoing/incoming triggers in at a
      // shared boundary.
      let localActiveIndex = -1;

      const enterChapter = (i: number) => () => {
        localActiveIndex = i;
        onActiveSectionChange(i);
        onShowScrollCardChange(Boolean(chapters[i].preview));
      };
      const leaveChapter = (i: number) => () => {
        if (localActiveIndex === i) {
          onShowScrollCardChange(false);
        }
      };

      // Chapters are equal-height (100svh), so "top center" -> "bottom
      // center" gives every chapter an identical, non-overlapping active
      // window with a clean handoff at the boundary (chapter i's end ===
      // chapter i+1's start), unlike a literal "top top" -> "top bottom"
      // pair, which fires out of order for anything shorter than 2
      // viewports.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const triggers = chapterEls.map((chapterEl, i) =>
          ScrollTrigger.create({
            end: "bottom center",
            onEnter: enterChapter(i),
            onEnterBack: enterChapter(i),
            onLeave: leaveChapter(i),
            onLeaveBack: leaveChapter(i),
            start: "top center",
            trigger: chapterEl,
          })
        );

        return () => {
          for (const trigger of triggers) {
            trigger.kill();
          }
        };
      });

      return () => {
        mm.revert();
      };
    },
    { dependencies: [chapters, prefersReducedMotion] }
  );

  return (
    <div ref={ref}>
      {chapters.map((chapter, index) => (
        <article
          className="gsap-scrollbar-demo__chapter"
          data-chapter={chapter.id}
          key={chapter.id}
          ref={(el) => {
            chapterRefs.current[index] = el;
          }}
        >
          <span className="gsap-scrollbar-demo__chapter-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3>{chapter.heading}</h3>
          <p>{chapter.body}</p>
        </article>
      ))}
    </div>
  );
}

interface ScrollBarProps {
  activeSection: number;
  chapters: GsapScrollbarDemoChapter[];
  contentRef: RefObject<HTMLDivElement | null>;
  prefersReducedMotion: boolean;
  showScrollCard: boolean;
}

/** The fixed progress-bar widget: track, draggable cursor, ghost, panel. */
function ScrollBar({
  activeSection,
  chapters,
  contentRef,
  prefersReducedMotion,
  showScrollCard,
}: ScrollBarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const progressCardRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Bridges the two things that gate the panel's visibility: whether the
  // nav widget itself is currently revealed (a scroll-position concern,
  // decided inside the GSAP effect below) and `showScrollCard` (a React
  // prop, decided per-section by `Content`). `syncPanelRef` lets the
  // GSAP effect call back into "did the prop change" logic without
  // re-running (and re-creating the Draggable/ScrollTrigger) every time
  // `showScrollCard`/`activeSection` changes; `showScrollCardRef` lets
  // that same effect read the *current* prop value without it being a
  // dependency.
  const syncPanelRef = useRef<
    (show?: boolean, chapter?: GsapScrollbarDemoChapter) => void
  >(() => {
    // Reassigned once the GSAP effect below runs.
  });
  const showScrollCardRef = useRef(showScrollCard);
  showScrollCardRef.current = showScrollCard;

  // The panel's *rendered* content deliberately lags the `activeSection`
  // prop: swapping a shorter/taller `<pre>` in immediately (in step with
  // React's render) changes the panel's natural height before the
  // opacity/y tween has hidden it, producing a visible jump. `syncPanel`
  // below only calls this once the panel is actually off-screen/invisible
  // (or, for a same-visibility chapter change, at the trough of the
  // flash), so the box never resizes while it's visibly on screen.
  const [displayedChapter, setDisplayedChapter] = useState<
    GsapScrollbarDemoChapter | undefined
  >();

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        return;
      }

      const content = contentRef.current;
      const nav = navRef.current;
      const progressCard = progressCardRef.current;
      const track = trackRef.current;
      const cursor = cursorRef.current;
      const ghost = ghostRef.current;
      const panel = panelRef.current;

      if (
        !(content && nav && progressCard && track && cursor && ghost && panel)
      ) {
        return;
      }

      const ticks = tickRefs.current.filter(
        (el): el is HTMLDivElement => el !== null
      );

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

      let draggable: Draggable;

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
      // (not `true`) matters here too: `true` kills *every* other tween on
      // this target, including the reveal scale-in below — since this runs
      // on every scroll tick, that permanently strands the cursor at
      // whatever scale it was mid-tween. "auto" only overwrites the `x`
      // tween it conflicts with.
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
      // separately from `shouldShow` so a same-visibility transition
      // (chapter A's panel -> chapter B's panel, both showing) can play
      // a quick refresh flash instead of silently reusing the reveal/hide
      // tween, which would be a no-op since opacity/y are already at
      // their "shown" target.
      let panelVisible = false;
      // `revealNav`/`hideNav` call `syncPanel()` with no chapter argument
      // — they're reacting to *scroll position* (nav visibility), not to
      // a chapter change, so they don't know which chapter is current.
      // Without this fallback, that call would default `chapter` to
      // `undefined` and wipe out whatever `Content` last reported,
      // leaving the panel blank until the next chapter-change event
      // happened to fire again.
      let lastChapter: GsapScrollbarDemoChapter | undefined;
      const syncPanel = (
        show = showScrollCardRef.current,
        chapter: GsapScrollbarDemoChapter | undefined = lastChapter
      ) => {
        lastChapter = chapter;
        const shouldShow = widgetVisible && show;
        if (shouldShow && panelVisible) {
          // Swap the rendered content at the trough of the flash, while
          // the panel is faded down to opacity 0 — never while it's
          // visibly on screen with its old height.
          //
          // `overwrite` only has an effect on individual tweens, not on
          // `gsap.timeline()`'s own vars (TypeScript won't catch that —
          // `AnimationVars` has a `[key: string]: any` index signature,
          // so a timeline-level `overwrite` silently does nothing). Put
          // it on each `.to()` instead, or a fast scroll that re-triggers
          // this while the previous flash is still running leaves two
          // timelines fighting over the same `opacity`/`y` — which can
          // cancel out into what looks like "no animation, content just
          // changed".
          gsap
            .timeline()
            .to(panel, {
              duration: 0.15,
              ease: "power2.in",
              onComplete: () => setDisplayedChapter(chapter),
              opacity: 0,
              overwrite: "auto",
              y: -6,
            })
            .to(panel, {
              duration: 0.25,
              ease: "power3.out",
              opacity: 1,
              overwrite: "auto",
              y: 0,
            });
        } else if (shouldShow) {
          // Coming from hidden: the panel has no height on screen yet
          // (opacity 0, translated off), so it's safe to set the new
          // content immediately, before the reveal tween runs.
          setDisplayedChapter(chapter);
          gsap.to(panel, {
            duration: 0.35,
            ease: "power3.inOut",
            opacity: 1,
            overwrite: "auto",
            y: 0,
          });
        } else {
          gsap.to(panel, {
            duration: 0.25,
            ease: "power3.inOut",
            onComplete: () => setDisplayedChapter(undefined),
            opacity: 0,
            overwrite: "auto",
            y: "120%",
          });
        }
        panelVisible = shouldShow;
      };
      syncPanelRef.current = syncPanel;

      let navHidden = true;
      const revealNav = () => {
        if (!navHidden) {
          return;
        }
        navHidden = false;
        widgetVisible = true;
        gsap.set(nav, { pointerEvents: "auto" });
        gsap
          .timeline({ id: "reveal-scrollbar-nav" })
          .to(progressCard, { duration: 0.25, opacity: 1, y: 0 })
          .to(ticks, { duration: 0.25, opacity: 0.5, stagger: 0.02 }, "<")
          .fromTo(
            cursor,
            { opacity: 0, scale: 0 },
            { duration: 0.25, ease: "back.out(2)", opacity: 1, scale: 1 },
            "<+=0.05"
          );
        syncPanel();
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
        syncPanel();
      };
      const toggleNav = (progress: number) => {
        if (progress < 0.02 || progress > 0.98) {
          hideNav();
        } else {
          revealNav();
        }
      };

      const st = ScrollTrigger.create({
        end: "bottom bottom",
        onUpdate: (self) => {
          if (!draggable.isDragging) {
            setCursorProgress(self.progress);
          }
          toggleNav(self.progress);
        },
        start: "top top",
        trigger: content,
      });

      draggable = Draggable.create(cursor, {
        activeCursor: "grabbing",
        bounds: track,
        cursor: "grab",
        onDrag() {
          const progress = clampProgress(this.x / cursorTravel());
          st.scroll(gsap.utils.interpolate(st.start, st.end, progress));
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
        if (draggable.isDragging || e.target === cursor) {
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

      return () => {
        track.removeEventListener("click", onTrackClick);
        track.removeEventListener("mousemove", onTrackMove);
        track.removeEventListener("mouseenter", showGhost);
        track.removeEventListener("mouseleave", hideGhost);
        cursor.removeEventListener("mouseenter", grabCursor);
        cursor.removeEventListener("mouseleave", releaseCursor);
        draggable?.kill();
        st.kill();
        syncPanelRef.current = () => {
          // The panel-sync closure above is gone along with `widgetVisible`.
        };
      };
    },
    { dependencies: [prefersReducedMotion], scope: navRef }
  );

  // `showScrollCard`/`activeSection` are React props, not something the
  // GSAP effect above depends on directly (that effect only runs once,
  // to set up the Draggable/ScrollTrigger) — so re-sync the panel here
  // whenever either one changes, via the ref the effect above populated.
  // `chapters[activeSection]` is passed through (not just the index) so
  // `syncPanel` can hand it to `setDisplayedChapter` once the tween
  // reaches the right moment, without needing its own `chapters` closure.
  useEffect(() => {
    syncPanelRef.current(showScrollCard, chapters[activeSection]);
  }, [showScrollCard, activeSection, chapters]);

  return (
    <div className="gsap-scrollbar-demo__nav" ref={navRef}>
      <div className="gsap-scrollbar-demo__progress-card" ref={progressCardRef}>
        <div className="gsap-scrollbar-demo__track" ref={trackRef}>
          {chapters.map((chapter, index) => (
            <div
              aria-hidden="true"
              className="gsap-scrollbar-demo__tick"
              key={chapter.id}
              ref={(el) => {
                tickRefs.current[index] = el;
              }}
            />
          ))}
          <div className="gsap-scrollbar-demo__cursor" ref={cursorRef} />
          <div
            aria-hidden="true"
            className="gsap-scrollbar-demo__cursor gsap-scrollbar-demo__cursor--ghost"
            ref={ghostRef}
          />
        </div>
      </div>

      <div
        className="gsap-scrollbar-demo__panel"
        data-card={displayedChapter?.id}
        ref={panelRef}
      >
        {displayedChapter?.preview}
      </div>
    </div>
  );
}

export function GsapScrollbarDemoPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [showScrollCard, setShowScrollCard] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="gsap-scrollbar-demo">
      <Content
        chapters={gsapScrollbarDemoChapters}
        onActiveSectionChange={setActiveSection}
        onShowScrollCardChange={setShowScrollCard}
        prefersReducedMotion={prefersReducedMotion}
        ref={contentRef}
      />
      <ScrollBar
        activeSection={activeSection}
        chapters={gsapScrollbarDemoChapters}
        contentRef={contentRef}
        prefersReducedMotion={prefersReducedMotion}
        showScrollCard={showScrollCard}
      />
    </section>
  );
}
