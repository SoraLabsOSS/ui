import { cn } from "@workspace/ui/lib/utils";
import { HomeShell } from "@/components/home-shell";

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

function BlogIndexSkeleton() {
  return (
    <main aria-hidden className="@container overflow-x-clip">
      <HomeShell as="div">
        <div>
          <section className="relative flex flex-col gap-16 pt-16 pb-12 md:gap-20 md:pt-20 md:pb-16 lg:gap-24 lg:pt-24 lg:pb-16">
            <div className="flex flex-col gap-8">
              <div className="flex max-w-3xl flex-col gap-3">
                <LoadingBlock className="h-11 w-2/3 md:h-14 lg:h-16" />
                <LoadingBlock className="h-7 w-full max-w-2xl" />
                <LoadingBlock className="mt-1 h-4 w-20" />
              </div>
              <LoadingBlock className="h-10 w-full max-w-md" />
            </div>
          </section>

          <section className="relative pb-16 md:pb-20 lg:pb-24">
            <div className="grid grid-cols-12 gap-6">
              {["topic-a", "topic-b", "topic-c"].map((key) => (
                <div
                  className="col-span-full min-h-[160px] rounded-lg border border-border/70 p-6 lg:col-span-4"
                  key={key}
                >
                  <div className="flex h-full flex-col justify-between gap-8">
                    <div className="flex flex-col gap-3">
                      <LoadingBlock className="h-4 w-20" />
                      <LoadingBlock className="h-7 w-3/4" />
                    </div>
                    <LoadingBlock className="h-5 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative border-border/40 border-t pt-16 pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
            <LoadingBlock className="mb-10 h-12 w-64 md:h-14 lg:h-16" />
            <div className="grid grid-cols-12 gap-6">
              {["post-a", "post-b", "post-c"].map((key) => (
                <div
                  className="col-span-full min-h-[240px] rounded-lg border border-border/70 p-6 lg:col-span-4"
                  key={key}
                >
                  <div className="flex h-full flex-col justify-between gap-8">
                    <div className="flex flex-col gap-4">
                      <LoadingBlock className="h-4 w-24" />
                      <LoadingBlock className="h-8 w-full" />
                      <LoadingBlock className="h-8 w-4/5" />
                    </div>
                    <div className="flex flex-col gap-5">
                      <LoadingBlock className="h-5 w-full" />
                      <LoadingBlock className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </HomeShell>
    </main>
  );
}

function BlogPostSkeleton() {
  return (
    <div
      aria-hidden
      className="@container mx-auto w-full max-w-[1400px] px-4 pt-20 pb-16 sm:pt-24 md:px-6 md:pt-28 md:pb-24"
    >
      <div className="grid grid-cols-12 gap-x-6 gap-y-6">
        <header className="col-span-12 mb-12 flex w-full flex-col gap-5 max-xl:mx-auto max-xl:max-w-3xl xl:col-span-6 xl:col-start-4 xl:mb-16">
          <LoadingBlock className="h-5 w-24" />
          <LoadingBlock className="h-11 w-full sm:h-12 xl:h-14" />
          <LoadingBlock className="h-6 w-11/12" />
          <LoadingBlock className="h-6 w-4/5" />
          <div className="flex flex-col gap-5 pt-3">
            <div className="flex items-center gap-2">
              <LoadingBlock className="size-5 rounded-full" />
              <LoadingBlock className="h-4 w-32" />
            </div>
            <LoadingBlock className="h-9 w-36" />
          </div>
        </header>
      </div>

      <div className="grid grid-cols-12 gap-x-6 gap-y-6">
        <aside className="order-first col-span-12 flex h-fit w-full gap-3 max-xl:mx-auto max-xl:max-w-3xl xl:order-last xl:col-span-2 xl:col-start-11 xl:flex-col">
          <LoadingBlock className="h-4 w-24" />
          <LoadingBlock className="h-4 w-20" />
          <LoadingBlock className="h-4 w-24" />
        </aside>

        <article className="col-span-12 flex w-full flex-col gap-6 max-xl:mx-auto max-xl:max-w-3xl xl:col-span-6 xl:col-start-4">
          <LoadingBlock className="aspect-[1200/630] w-full rounded-md" />
          <LoadingBlock className="h-5 w-full" />
          <LoadingBlock className="h-5 w-11/12" />
          <LoadingBlock className="h-5 w-4/5" />
          <LoadingBlock className="mt-4 h-40 w-full" />
        </article>
      </div>
    </div>
  );
}

export function BlogSkeleton({ variant }: { variant: "index" | "post" }) {
  return variant === "index" ? <BlogIndexSkeleton /> : <BlogPostSkeleton />;
}
