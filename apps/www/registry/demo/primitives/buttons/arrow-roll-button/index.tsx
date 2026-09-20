"use client";

import { ArrowRollButton } from "@/registry/primitives/buttons/arrow-roll-button";

export default function ArrowRollButtonExample() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <ArrowRollButton variant="light">Start a project</ArrowRollButton>
        <ArrowRollButton variant="dark">Start a project</ArrowRollButton>
        <ArrowRollButton variant="white">Start a project</ArrowRollButton>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <ArrowRollButton size="large" variant="light">
          Start a project
        </ArrowRollButton>
        <ArrowRollButton size="large" variant="dark">
          Start a project
        </ArrowRollButton>
      </div>
    </div>
  );
}
