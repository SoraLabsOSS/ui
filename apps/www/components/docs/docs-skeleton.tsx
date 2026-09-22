import { cn } from "@workspace/ui/lib/utils";

function LoadingBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-accent motion-safe:animate-pulse",
        className
      )}
    />
  );
}

export function DocsSkeleton() {
  return (
    <div
      aria-hidden
      className="mx-auto flex w-full flex-1"
      id="nd-page"
      style={{
        maxWidth:
          "min(var(--fd-page-width), calc(var(--fd-layout-width) - var(--fd-sidebar-width)))",
        paddingTop: "calc(var(--fd-nav-height) + var(--fd-tocnav-height))",
      }}
    >
      <article className="flex w-full min-w-0 flex-col gap-4 px-4 pt-8 md:mx-auto md:px-6 xl:px-12 xl:pt-12">
        <LoadingBlock className="h-4 w-40" />

        <div className="flex w-full flex-row items-start justify-between gap-2">
          <LoadingBlock className="h-9 w-3/5" />
          <div className="flex gap-1.5">
            <LoadingBlock className="size-8" />
            <LoadingBlock className="size-8" />
          </div>
        </div>

        <LoadingBlock className="h-6 w-4/5" />

        <div className="flex items-center gap-2">
          <LoadingBlock className="size-6 rounded-full" />
          <LoadingBlock className="h-4 w-28" />
        </div>

        <div className="flex gap-2 pt-2">
          <LoadingBlock className="h-8 w-24" />
          <LoadingBlock className="h-8 w-24" />
        </div>

        <div className="prose w-full pt-4 pb-10">
          <LoadingBlock className="mb-6 h-8 w-2/5" />
          <div className="space-y-3">
            <LoadingBlock className="h-5 w-full" />
            <LoadingBlock className="h-5 w-11/12" />
            <LoadingBlock className="h-5 w-4/5" />
          </div>
          <LoadingBlock className="mt-10 h-48 w-full rounded-lg" />
          <LoadingBlock className="mt-10 h-7 w-1/2" />
          <div className="mt-4 space-y-3">
            <LoadingBlock className="h-5 w-full" />
            <LoadingBlock className="h-5 w-10/12" />
            <LoadingBlock className="h-5 w-3/4" />
          </div>
        </div>
      </article>

      <aside
        className="sticky pt-12 pb-2 max-xl:hidden"
        id="nd-toc"
        style={{
          height:
            "calc(100dvh - var(--fd-banner-height) - var(--fd-nav-height))",
          top: "calc(var(--fd-banner-height) + var(--fd-nav-height))",
        }}
      >
        <div className="flex h-full w-(--fd-toc-width) max-w-full flex-col gap-4 pe-4">
          <LoadingBlock className="h-5 w-24" />
          <div className="space-y-3 border-border border-l pl-4">
            {["toc-a", "toc-b", "toc-c", "toc-d", "toc-e"].map((key) => (
              <LoadingBlock className="h-4 w-full" key={key} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
