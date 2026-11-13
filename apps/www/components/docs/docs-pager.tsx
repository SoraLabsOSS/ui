import { cn } from "@workspace/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface DocsPagerItem {
  description?: string;
  name: string;
  url: string;
}

export interface DocsPagerProps {
  next?: DocsPagerItem;
  previous?: DocsPagerItem;
}

export const DocsPager = ({ previous, next }: DocsPagerProps) => {
  if (!(previous || next)) {
    return null;
  }

  return (
    <div
      className={cn(
        "@container grid gap-4 pb-6",
        previous && next ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {previous && (
        <Link
          className="hover:bg-fd-accent/80 hover:text-fd-accent-foreground flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors duration-150 ease-out @max-lg:col-span-full"
          href={previous.url}
        >
          <div className="inline-flex items-center gap-1.5 font-medium">
            <ChevronLeft
              aria-hidden="true"
              className="-mx-1 size-4 shrink-0 rtl:rotate-180"
            />
            <p>{previous.name}</p>
          </div>
          {previous.description && (
            <p className="text-fd-muted-foreground truncate">
              {previous.description}
            </p>
          )}
        </Link>
      )}
      {next && (
        <Link
          className="hover:bg-fd-accent/80 hover:text-fd-accent-foreground flex flex-col gap-2 rounded-lg border p-4 text-end text-sm transition-colors duration-150 ease-out @max-lg:col-span-full"
          href={next.url}
        >
          <div className="inline-flex flex-row-reverse items-center gap-1.5 font-medium">
            <ChevronRight
              aria-hidden="true"
              className="-mx-1 size-4 shrink-0 rtl:rotate-180"
            />
            <p>{next.name}</p>
          </div>
          {next.description && (
            <p className="text-fd-muted-foreground truncate">
              {next.description}
            </p>
          )}
        </Link>
      )}
    </div>
  );
};
