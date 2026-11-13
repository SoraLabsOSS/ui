import { cn } from "@workspace/ui/lib/utils";

import { Skeleton } from "@/registry/primitives/effects/skeleton";

export const AUTH_MENU_LINKS = [
  { title: "Settings", url: "/settings/account", skeletonWidth: "w-14" },
  { title: "My Library", url: "/library", skeletonWidth: "w-20" },
] as const;

export function AuthNavMenuSkeleton({ width }: { width: string }) {
  return (
    <span
      aria-hidden
      className="fade-in animate-in flex h-8 items-center px-3 duration-200 motion-reduce:animate-none"
    >
      <Skeleton className={cn("h-4", width)} />
    </span>
  );
}

function SidebarMenuTreeConnectors() {
  return (
    <>
      <span
        aria-hidden
        className="bg-foreground/50 pointer-events-none absolute top-1/2 left-0 z-0 h-px w-[18px] -translate-y-1/2"
      />
      <span
        aria-hidden
        className="bg-foreground/30 pointer-events-none absolute top-1/4 left-0 z-0 h-px w-[13px]"
      />
      <span
        aria-hidden
        className="bg-foreground/30 pointer-events-none absolute top-0 left-0 z-0 h-px w-[16px]"
      />
      <span
        aria-hidden
        className="bg-foreground/30 pointer-events-none absolute top-3/4 left-0 z-0 h-px w-[13px]"
      />
    </>
  );
}

export function AuthSidebarMenuSkeleton({ width }: { width: string }) {
  return (
    <div className="fade-in animate-in relative duration-200 motion-reduce:animate-none">
      <SidebarMenuTreeConnectors />
      <div aria-hidden className="relative ml-2 flex items-center py-1.5 pl-4">
        <Skeleton className={cn("h-5", width)} />
      </div>
    </div>
  );
}
