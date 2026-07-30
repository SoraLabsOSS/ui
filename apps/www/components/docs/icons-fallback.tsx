import { Skeleton } from "@workspace/ui/components/ui/skeleton";

const SKELETON_COUNT = 99;

export function IconsFallback() {
  return (
    <div className="text-black dark:text-white">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-3 h-9 w-full" />
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-7 w-14 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-5 xs:grid-cols-7 gap-4 sm:grid-cols-9 lg:grid-cols-11 2xl:grid-cols-14">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => i).map((i) => (
          <Skeleton className="aspect-square size-full rounded-lg" key={i} />
        ))}
      </div>
    </div>
  );
}
