"use client";

import { VideoPlayer } from "@/registry/primitives/effects/video-player";

const DEMO_VIDEO_SRC =
  "https://cdn.soralabs.io.vn/media/demo/testimonials.webm";

const CHAPTERS = [
  { start: 0, title: "Intro" },
  { start: 15, title: "The orchard" },
  { start: 60, title: "Trouble arrives" },
  { start: 120, title: "The chase" },
  { start: 240, title: "Showdown" },
  { start: 480, title: "Credits" },
];

export default function VideoPlayerDemo() {
  return (
    <div className="flex items-center justify-center">
      <VideoPlayer chapters={CHAPTERS} defaultSpeed={1} src={DEMO_VIDEO_SRC} />
    </div>
  );
}
