import path from "node:path";
import { cn } from "@workspace/ui/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { BlogOgImage } from "@/components/blog/blog-og-image";
import { getBlogIndexOgContent } from "@/lib/blog/get-blog-index-og-content";
import { createBlogMetadata, getBlogPageImage } from "@/lib/blog/metadata";
import { blog } from "@/lib/blog/source";
import { getPageAlternates } from "@/lib/site";
import { BlogHeaderBanner } from "./banner.client";

export const metadata: Metadata = createBlogMetadata({
  title: "Blog",
  description: getBlogIndexOgContent().quote,
  alternates: getPageAlternates("/blog"),
});

export default function BlogPage() {
  const posts = [...blog.getPages()]
    .filter((post) => !(post.data.subpage || post.data.hidden))
    .sort(
      (a, b) =>
        new Date(b.data.date ?? getName(b.path)).getTime() -
        new Date(a.data.date ?? getName(a.path)).getTime()
    );

  return (
    <main>
      <div aria-hidden className="blog-inner h-16 md:h-24" />
      <BlogHeaderBanner />
      <section className="w-full">
        <div className="blog-inner grid grid-cols-1 gap-6 px-3 pt-12 pb-16 sm:px-4 md:grid-cols-2 md:gap-7 md:px-0 md:pt-16 md:pb-20 lg:grid-cols-3 lg:gap-8">
          {posts.map((post, index) => {
            const isOgPreview = !post.data.image;
            // First row is above the fold up to the widest grid (lg:grid-cols-3).
            const isLcpCandidate = index < 3;

            return (
              <Link
                className="flex flex-col overflow-hidden rounded-xl border border-border/45 bg-card/40 shadow-sm transition-[background-color,box-shadow,border-color] duration-200 hover:border-border/70 hover:bg-card/70 hover:shadow-md"
                href={post.url}
                key={post.url}
              >
                <BlogOgImage
                  className={cn(
                    "block w-full bg-muted/50 ring-1 ring-border/30 ring-inset",
                    isOgPreview ? "aspect-1200/630" : "h-48 md:h-56"
                  )}
                  image={{
                    alt: post.data.title,
                    className: "object-cover",
                    draggable: false,
                    fill: true,
                    loading: isLcpCandidate ? "eager" : undefined,
                    priority: isLcpCandidate,
                    src: post.data.image ?? getBlogPageImage(post).url,
                    unoptimized: true,
                  }}
                />
                <div className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-5 md:py-5">
                  <div className="space-y-1.5">
                    <p className="font-medium text-base text-foreground leading-snug tracking-tight md:text-lg">
                      {post.data.title}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {post.data.description}
                    </p>
                  </div>

                  <span className="mt-auto flex items-center justify-between gap-3 pt-1">
                    {(post.data.hashtags?.length ?? 0) > 0 ? (
                      <span className="inline-flex flex-wrap items-center gap-x-2 text-muted-foreground text-xs">
                        {(post.data.hashtags ?? []).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </span>
                    ) : (
                      <span />
                    )}
                    <time
                      className="shrink-0 text-muted-foreground text-xs tabular-nums"
                      dateTime={new Date(
                        post.data.date ?? getName(post.path)
                      ).toISOString()}
                    >
                      {new Date(
                        post.data.date ?? getName(post.path)
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function getName(filePath: string) {
  return path.basename(filePath, path.extname(filePath));
}
