import { Button } from "@workspace/ui/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import {
  Highlight,
  HighlightItem,
} from "@/registry/primitives/effects/highlight";

interface Suggestion {
  description: string;
  route: string;
}

const SUGGESTIONS: readonly Suggestion[] = [
  { description: "Browse every shipped layout showcase", route: "/blocks" },
  {
    description: "Get up and running in a minute",
    route: "/docs/installation",
  },
  { description: "Read the docs from the start", route: "/docs" },
];

export default function NotFound() {
  return (
    <section className="bg-background flex min-h-screen items-center justify-center py-20">
      <div className="mx-auto w-full max-w-2xl px-6 md:px-10">
        <div className="flex flex-col items-start gap-6">
          {/* <span className="inline-flex flex-col items-center font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
            <Bunny size={28} sleeping />
          </span> */}
          <h1 className="text-6xl leading-none font-medium tracking-tight sm:text-7xl">
            Page not found.
          </h1>
          <p className="text-muted-foreground max-w-md text-base sm:text-lg">
            The route you tried doesn&apos;t resolve to anything we ship. It may
            have moved, or it may have never existed.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="default">
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">Browse docs</Link>
            </Button>
          </div>

          <div className="border-border mt-6 w-full border-t pt-6">
            <span className="text-muted-foreground font-mono text-[10px] tracking-[0.12em] uppercase">
              Try one of these
            </span>
            <Highlight className="bg-foreground/8 rounded-md" trigger="hover">
              <div className="divide-border mt-3 flex flex-col divide-y">
                {SUGGESTIONS.map((s) => (
                  <HighlightItem key={s.route} value={s.route}>
                    <Link
                      className="group focus-visible:ring-ring flex items-center justify-between gap-4 p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      href={s.route}
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                        <span className="text-foreground font-mono text-sm">
                          {s.route}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {s.description}
                        </span>
                      </div>
                      <ArrowRight className="text-muted-foreground size-4 opacity-0 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                    </Link>
                  </HighlightItem>
                ))}
              </div>
            </Highlight>
          </div>
        </div>
      </div>
    </section>
  );
}
