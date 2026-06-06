import { Skeleton } from "@workspace/ui/components/ui/skeleton";
import { cn } from "@workspace/ui/lib/utils";

export const AUTH_MENU_LINKS = [
  { title: "Settings", url: "/settings/account", skeletonWidth: "w-14" },
  { title: "Bookmark", url: "/bookmark", skeletonWidth: "w-[4.25rem]" },
] as const;

export function AuthNavMenuSkeleton({ width }: { width: string }) {
  return (
    <span aria-hidden className="flex h-8 items-center px-3">
      <Skeleton className={cn("h-4", width)} />
    </span>
  );
}

export function AuthSidebarMenuSkeleton({ width }: { width: string }) {
  return (
    <div aria-hidden className="relative ml-2 flex items-center py-1.5 pl-4">
      <Skeleton className={cn("h-4", width)} />
    </div>
  );
}
