"use client";

import { Typer, type TyperProps } from "@/registry/primitives/texts/typer";

export default function TyperExample({
  fps = 20,
  cycles = 3,
  stagger = 0.15,
  startOnView = true,
  accent = "#12a150",
}: Partial<TyperProps>) {
  return (
    <div className="flex w-full items-center justify-center px-6 py-16">
      <Typer
        accent={accent}
        className="font-semibold text-xl leading-[1.15] tracking-tight sm:text-2xl"
        cycles={cycles}
        fps={fps}
        stagger={stagger}
        startOnView={startOnView}
        text={"Type that assembles itself, one glyph at a time."}
      />
    </div>
  );
}
