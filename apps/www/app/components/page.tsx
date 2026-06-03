"use client";

import { Button } from "@workspace/ui/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default function ComponentsPage() {
  return (
    <section className="h-full w-full flex-1 flex-col items-start justify-center px-5 pt-24 md:pt-28">
      <div className="w-full lg:w-1/2">
        <h1 className="mt-3 font-semibold text-2xl md:text-3xl">
          Page under construction
        </h1>
        <p className="mt-4">
          This page is currently under construction. Please come back later to
          explore more content.
        </p>

        <div className="mt-6 flex items-center gap-x-3">
          <Button>
            <MoveLeft className="h-5 w-5" />
            <span>Go back</span>
          </Button>

          <Button asChild variant={"outline"}>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
