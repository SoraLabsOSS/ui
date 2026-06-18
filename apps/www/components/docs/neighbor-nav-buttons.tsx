import { Button } from "@workspace/ui/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export interface NeighborNavItem {
  name: string;
  url: string;
}

interface NeighborNavButtonsProps {
  fallbackUrl: string;
  next?: NeighborNavItem;
  previous?: NeighborNavItem;
}

export function NeighborNavButtons({
  previous,
  next,
  fallbackUrl,
}: NeighborNavButtonsProps) {
  return (
    <div className="flex shrink-0 flex-row items-center gap-1.5 pt-0.5">
      <Link
        aria-disabled={!previous}
        aria-label={previous ? `Go to ${previous.name}` : "No previous page"}
        className={previous ? undefined : "pointer-events-none opacity-50"}
        href={previous?.url ?? fallbackUrl}
      >
        <Button size="icon-sm" variant="accent">
          <ArrowLeft />
        </Button>
      </Link>
      <Link
        aria-disabled={!next}
        aria-label={next ? `Go to ${next.name}` : "No next page"}
        className={next ? undefined : "pointer-events-none opacity-50"}
        href={next?.url ?? fallbackUrl}
      >
        <Button size="icon-sm" variant="accent">
          <ArrowRight />
        </Button>
      </Link>
    </div>
  );
}
