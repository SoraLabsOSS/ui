import { Skeleton } from "@workspace/ui/components/ui/skeleton";

export const IconsFallback = () => (
  <div className="-mt-4.5 space-y-4 text-black dark:text-white">
    <Skeleton className="h-4 w-38" />

    <Skeleton className="h-10 w-full" />

    <div className="flex items-center gap-2">
      <Skeleton className="h-7 w-10 rounded-full" />
      <Skeleton className="h-7 w-12 rounded-full" />
    </div>

    <div className="mt-6 grid w-full grid-cols-5 xs:grid-cols-7 gap-4 sm:grid-cols-9 lg:grid-cols-11 2xl:grid-cols-14">
      {new Array(99).fill(0).map((_, index) => (
        <Skeleton className="aspect-square size-full" key={index} />
      ))}
    </div>
  </div>
);
