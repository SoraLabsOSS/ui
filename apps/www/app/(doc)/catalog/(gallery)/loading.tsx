import { cn } from "@workspace/ui/lib/utils";
import { CatalogScrollArea } from "@/components/catalog/catalog-scroll-area";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-accent motion-safe:animate-pulse",
        className
      )}
    />
  );
}

function GalleryCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-3">
      <Skeleton className="aspect-video w-full rounded-xl bg-muted" />
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  );
}

const SECTION_ONE_ITEMS = ["c-1", "c-2", "c-3", "c-4", "c-5", "c-6"] as const;
const SECTION_TWO_ITEMS = ["c-7", "c-8", "c-9"] as const;

export default function CatalogLoading() {
  return (
    <CatalogScrollArea className="h-full min-h-0 flex-1">
      <div
        aria-hidden
        className="relative flex flex-col items-center overflow-visible px-6 lg:px-10"
      >
        <div className="relative z-10 flex w-full flex-col items-center justify-center pt-24 md:pt-32 lg:pt-40">
          <div className="flex w-full flex-col items-center">
            <Skeleton className="mb-6 h-8 w-72 rounded-full bg-muted/70" />
            <Skeleton className="h-12 w-full max-w-xl rounded-xl sm:h-14 sm:max-w-2xl md:h-16 md:max-w-3xl" />
            <Skeleton className="mt-3 h-5 w-full max-w-md sm:h-6 sm:max-w-lg md:max-w-xl" />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 py-10">
          <div className="flex flex-col gap-12">
            <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row">
              <Skeleton className="h-10 w-full rounded-xl bg-muted" />
              <div className="flex w-full shrink-0 items-center justify-center sm:w-auto sm:justify-end">
                <Skeleton className="h-10 w-44 rounded-xl bg-muted" />
              </div>
            </div>

            <div className="flex flex-col gap-24">
              <section className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="inline-flex items-start gap-2">
                      <Skeleton className="h-10 w-48 rounded-lg" />
                      <Skeleton className="mt-1 h-5 w-6 rounded-full bg-muted" />
                    </div>
                    <Skeleton className="h-5 w-64" />
                  </div>
                  <Skeleton className="h-10 w-32 shrink-0 rounded-xl bg-muted" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {SECTION_ONE_ITEMS.map((id) => (
                    <GalleryCardSkeleton key={id} />
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="inline-flex items-start gap-2">
                      <Skeleton className="h-10 w-36 rounded-lg" />
                      <Skeleton className="mt-1 h-5 w-6 rounded-full bg-muted" />
                    </div>
                    <Skeleton className="h-5 w-48" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {SECTION_TWO_ITEMS.map((id) => (
                    <GalleryCardSkeleton key={id} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </CatalogScrollArea>
  );
}
