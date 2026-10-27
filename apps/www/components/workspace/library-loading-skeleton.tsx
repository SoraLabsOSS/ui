import { Skeleton } from "@/registry/primitives/effects/skeleton";

interface LibraryLoadingSkeletonProps {
  tab?: "lists" | "saves" | "opened";
}

const SKELETON_GRID_SLOTS = [
  "grid-slot-1",
  "grid-slot-2",
  "grid-slot-3",
  "grid-slot-4",
  "grid-slot-5",
  "grid-slot-6",
  "grid-slot-7",
  "grid-slot-8",
] as const;

const SKELETON_SAVE_SLOTS = [
  "save-slot-1",
  "save-slot-2",
  "save-slot-3",
  "save-slot-4",
  "save-slot-5",
] as const;

export function LibraryLoadingSkeleton({
  tab = "lists",
}: LibraryLoadingSkeletonProps) {
  return (
    <div
      className="relative min-h-full bg-background"
      data-slot="library-skeleton"
    >
      <main className="space-y-8 px-5 pt-[18px] pb-5 max-md:px-3">
        {/* Header skeleton */}
        <div className="flex flex-wrap items-center gap-3 px-2 pt-1">
          <div className="min-w-[180px] flex-1 space-y-2">
            <Skeleton className="h-9 w-48 sm:h-10 sm:w-56" rounded="lg" />
            <Skeleton className="h-4 w-36" rounded="sm" />
          </div>

          <Skeleton className="hidden h-8 w-[190px] md:block" rounded="md" />

          <Skeleton className="h-8 w-24 shrink-0" rounded="md" />
        </div>

        {/* Tab view pill skeleton */}
        <Skeleton className="mx-2 h-10 w-64" rounded="full" />

        {/* Content area skeleton */}
        <div className="mx-2">
          {tab === "saves" ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-7 w-28" rounded="md" />
                <Skeleton className="h-10 w-28" rounded="lg" />
              </div>
              <div className="flex flex-col gap-4">
                {SKELETON_SAVE_SLOTS.map((slotId) => (
                  <div
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-3.5"
                    key={slotId}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-40" rounded="sm" />
                        <Skeleton className="h-5 w-16" rounded="full" />
                      </div>
                      <Skeleton className="h-3.5 w-64" rounded="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-16" rounded="md" />
                      <Skeleton className="h-8 w-8" rounded="md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 2xl:grid-cols-4">
              {SKELETON_GRID_SLOTS.map((slotId) => (
                <li key={slotId}>
                  <div className="flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-2xl border border-border/40 bg-card p-3 shadow-xs">
                    <Skeleton className="h-full w-full" rounded="lg" />
                    <div className="flex items-center px-1 pt-2.5">
                      <Skeleton className="h-4 w-3/5" rounded="sm" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
