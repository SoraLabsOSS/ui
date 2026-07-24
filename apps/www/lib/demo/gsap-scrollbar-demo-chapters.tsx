import type { ReactNode } from "react";

// Code-snippet `preview`s are kept under ~34 chars/line: the panel is a
// fixed 336px width (ported 1:1 from the original), so longer lines wrap
// and break the compact, single-glance snippet look the original always
// has. `preview` isn't limited to code, though — like the original's
// `[data-card]` panels (some hold a `<pre><code>`, others a bundle-size
// chart or a sponsor widget), a chapter can hand back any ReactNode.
export interface GsapScrollbarDemoChapter {
  body: string;
  heading: string;
  id: string;
  label: string;
  /** Omit to opt this chapter out of showing a panel entirely. */
  preview?: ReactNode;
}

export const gsapScrollbarDemoChapters: GsapScrollbarDemoChapter[] = [
  {
    body: "The pill on the track in the corner is a real gsap.Draggable instance, bounded to the track element. Grab it and drag — the page scrolls with you. (No panel here — the scrollbar itself is still hidden this close to the top.)",
    heading: "Grab the cursor",
    id: "drag",
    label: "Draggable cursor",
  },
  {
    body: "Scrolling this section moves the cursor. Dragging the cursor scrolls this section. Both directions read from and write to the same ScrollTrigger instance.",
    heading: "Two-way sync",
    id: "sync",
    label: "Scroll sync",
    preview: (
      <pre>
        <code>
          {
            "const st = ScrollTrigger.create({\n  trigger: section,\n  onUpdate: sync,\n});\n\nst.scroll(interpolate(p));"
          }
        </code>
      </pre>
    ),
  },
  {
    body: "Clicking or dragging the track doesn't land on an arbitrary pixel — the position snaps to a fixed step, so seeking feels deliberate instead of jittery.",
    heading: "Snap to step",
    id: "snap",
    label: "Snap to step",
    preview: (
      <pre>
        <code>
          {
            "const snap = utils.snap(1 / 65);\nconst clamp = utils.clamp(0, 1);\n\nclamp(snap(rawProgress));"
          }
        </code>
      </pre>
    ),
  },
  {
    body: "Hover the track without pressing anything and a second, translucent cursor previews where a click would seek to — it disappears the moment you actually grab the real one.",
    heading: "Ghost preview",
    id: "ghost",
    label: "Ghost preview",
    preview: (
      <pre>
        <code>
          {
            'track.on("mousemove", (e) => {\n  const p = progressOf(e);\n  gsap.to(ghost, { x: p });\n});'
          }
        </code>
      </pre>
    ),
  },
  {
    body: "Each section independently decides whether to show a panel, reporting its own active state and panel visibility up to shared React state — nothing here reaches into another section's internals. (No panel on this last one either — same reason as the first: the scrollbar is already hidden this close to the bottom.)",
    heading: "Chapter panels",
    id: "panels",
    label: "Chapter panels",
  },
];
