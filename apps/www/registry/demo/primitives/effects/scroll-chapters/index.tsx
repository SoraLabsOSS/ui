"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { resolveScrollRoot } from "@/lib/catalog/resolve-scroll-root";
import { waitForScrollerReady } from "@/lib/scroll/scroller-ready";
import {
  ScrollChapters,
  type ScrollChaptersChapter,
} from "@/registry/primitives/effects/scroll-chapters";

// Same copy, colors, and per-chapter panel opt-in/opt-out as the reference
// implementation at apps/www/app/demo/gsap-scrollbar-demo.tsx (kept
// untouched, hand-rolled) — this is that same design, wired through the
// generalized `ScrollChapters` primitive instead.

function ChapterBody({
  body,
  heading,
  index,
}: {
  body: string;
  heading: string;
  index: number;
}) {
  return (
    <div className="flex h-full flex-col justify-center gap-4 border-current/10 border-t px-6 py-16 first:border-t-0 md:px-16">
      <span className="font-mono text-[#ff4433] text-sm tracking-wide">
        {String(index + 1).padStart(2, "0")}
      </span>
      {/* No color class here — inherits from whatever `className` the
          consumer passes to `<ScrollChapters>` on the root section. */}
      <h3 className="m-0 font-semibold text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em]">
        {heading}
      </h3>
      <p className="m-0 max-w-[42rem] text-[1.05rem] leading-[1.6] opacity-75">
        {body}
      </p>
    </div>
  );
}

function CodePreview({ code }: { code: string }) {
  return (
    <pre className="m-0 overflow-x-auto whitespace-pre-wrap leading-[1.3]">
      {/* Inherits from the panel wrapper's own `text-[#f6f4f2]` (see
          `classNames.panel` below) — the panel's background is always
          dark regardless of the section's `className`, so its text
          color is pinned there instead of following the section. */}
      <code className="font-mono text-[0.75rem]">{code}</code>
    </pre>
  );
}

// Not every panel has to be a code snippet — same as the original
// anime.js reference, which mixes `<pre><code>` panels with a bundle-size
// bar chart and a sponsor badge. A row of ticks was tried here first, but
// sitting right above the track's own tick-marked ruler it just read as
// a second, redundant scrollbar — a plain stat badge (matching the
// original's sponsor/funding-level pill) reads cleaner.
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff4433]" />
      <span className="font-mono text-xs uppercase tracking-wide opacity-60">
        {label}
      </span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}

// Same taller shape as `GhostComparisonPreview` below — a raw-to-snapped
// value pair reads more concretely than a single "1 / 65" label, and
// keeps every panel from settling at the same one-line height.
function SnapStepComparisonPreview() {
  return (
    <div className="flex flex-col gap-2.5">
      <StatRow label="Raw progress" value="0.4523" />
      <StatRow label="Snapped to" value="0.4615 (30 / 65)" />
      <div className="h-px bg-current opacity-10" />
      <p className="m-0 text-xs leading-snug opacity-70">
        Every drag/click position rounds to the nearest 1/65th step before it
        ever reaches the scroll position.
      </p>
    </div>
  );
}

// A taller panel — a couple of stat rows plus a caption, instead of a
// single line, the same way the original's own panels vary in height
// (a five-line code block reads very differently from a one-line badge).
function GhostComparisonPreview() {
  return (
    <div className="flex flex-col gap-2.5">
      <StatRow label="Real cursor" value="pointer-events: auto" />
      <StatRow label="Ghost cursor" value="opacity: 0.45" />
      <div className="h-px bg-current opacity-10" />
      <p className="m-0 text-xs leading-snug opacity-70">
        Only the real cursor is ever draggable — the ghost just previews where a
        click on the track would seek to.
      </p>
    </div>
  );
}

const CHAPTERS: ScrollChaptersChapter[] = [
  {
    content: (
      <ChapterBody
        body="The pill on the track in the corner is a real gsap.Draggable instance, bounded to the track element. Grab it and drag — the page scrolls with you. (No panel here — the scrollbar itself is still hidden this close to the top.)"
        heading="Grab the cursor"
        index={0}
      />
    ),
    id: "drag",
  },
  {
    content: (
      <ChapterBody
        body="Scrolling this section moves the cursor. Dragging the cursor scrolls this section. Both directions read from and write to the same ScrollTrigger instance."
        heading="Two-way sync"
        index={1}
      />
    ),
    id: "sync",
    preview: (
      <CodePreview
        code={
          "const st = ScrollTrigger.create({\n  trigger: section,\n  onUpdate: sync,\n});\n\nst.scroll(interpolate(p));"
        }
      />
    ),
  },
  {
    content: (
      <ChapterBody
        body="Clicking or dragging the track doesn't land on an arbitrary pixel — the position snaps to a fixed step, so seeking feels deliberate instead of jittery."
        heading="Snap to step"
        index={2}
      />
    ),
    id: "snap",
    preview: <SnapStepComparisonPreview />,
  },
  {
    content: (
      <ChapterBody
        body="Hover the track without pressing anything and a second, translucent cursor previews where a click would seek to — it disappears the moment you actually grab the real one."
        heading="Ghost preview"
        index={3}
      />
    ),
    id: "ghost",
    preview: <GhostComparisonPreview />,
  },
  {
    content: (
      <ChapterBody
        body="Each section independently decides whether to show a panel, reporting its own active state and panel visibility up to shared React state — nothing here reaches into another section's internals. (No panel on this last one either — same reason as the first: the scrollbar is already hidden this close to the bottom.)"
        heading="Chapter panels"
        index={4}
      />
    ),
    id: "panels",
  },
];

const TRACK_STYLE_CLASS =
  "[background-image:linear-gradient(to_right,rgb(242_242_237/18%)_1px,transparent_1px)] [background-size:1.53846%_0.5rem]";

export default function ScrollChaptersExample() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<Element | Window | undefined>();

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const resolved = resolveScrollRoot(node);

    waitForScrollerReady(resolved)
      .then(() => {
        setScroller(resolved);
      })
      .catch(() => {
        /* preview unmounted */
      });
  }, []);

  return (
    <div className="w-full" ref={rootRef}>
      <CatalogScrollHint label="Scroll to drag the cursor and flip chapters" />

      {scroller ? (
        <ScrollChapters
          chapters={CHAPTERS}
          className="bg-secondary text-black!"
          classNames={{
            cursor: "bg-[#ff4433]",
            cursorGhost: "bg-[#ff4433]",
            panel: "rounded-xl bg-[#17171a] px-4 py-2.5 text-[#f6f4f2]",
            progressCard: "rounded-xl bg-[#17171a]",
            tick: "border-[#f6f4f2]",
            track: TRACK_STYLE_CLASS,
          }}
          containerQuery
          embedded
          scroller={scroller}
        />
      ) : null}
    </div>
  );
}
