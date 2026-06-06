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

function SidebarMenuTreeConnectors() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-0 z-0 h-px w-[18px] -translate-y-1/2 bg-foreground/50"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-0 z-0 h-px w-[13px] bg-foreground/30"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-0 h-px w-[16px] bg-foreground/30"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-3/4 left-0 z-0 h-px w-[13px] bg-foreground/30"
      />
    </>
  );
}

export function AuthSidebarMenuSkeleton({ width }: { width: string }) {
  return (
    <div className="relative">
      <SidebarMenuTreeConnectors />
      <div aria-hidden className="relative ml-2 flex items-center py-1.5 pl-4">
        <Skeleton className={cn("h-4", width)} />
      </div>
    </div>
  );
}
