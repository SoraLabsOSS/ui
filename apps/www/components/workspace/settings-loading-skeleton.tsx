import { Skeleton } from "@/registry/primitives/effects/skeleton";

export function SettingsLoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-6 md:px-6 md:pt-8 md:pb-8">
      <Skeleton className="h-64" rounded="lg" />
    </div>
  );
}
