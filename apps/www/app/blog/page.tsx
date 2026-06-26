import path from "node:path";
import { Separator } from "@workspace/ui/components/ui/separator";
import { cn } from "@workspace/ui/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PlusSeparator } from "@/components/blog/plus-separator";
import { getBlogIndexOgContent } from "@/lib/blog/get-blog-index-og-content";
import { createBlogMetadata, getBlogPageImage } from "@/lib/blog/metadata";
import { blog } from "@/lib/blog/source";
import { BlogHeaderBanner } from "./banner.client";

export const metadata: Metadata = createBlogMetadata({
  title: "Blog",
  description: getBlogIndexOgContent().quote,
  alternates: {
    canonical: "/blog",
  },
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
      <section className="w-full border-foreground/10 border-b">
        <div className="blog-inner relative flex h-24 gap-2 border-foreground/10 border-x" />
      </section>
      <BlogHeaderBanner />
      <section className="w-full border-foreground/10 border-b">
        <div className="blog-inner relative grid grid-cols-1 gap-5 border-foreground/10 border-x px-3 pt-12 pb-12 sm:px-4 md:grid-cols-2 md:gap-6 md:px-5 md:pt-20 md:pb-16 lg:grid-cols-3 lg:px-6">
          {posts.map((post, index) => {
            const isOgPreview = !post.data.image;
            const isLcpCandidate = index === 0;

            return (
              <Link
                className="group relative flex flex-col overflow-hidden bg-secondary/70 shadow-sm ring-1 ring-foreground/4 transition-[box-shadow,background-color] duration-200 hover:bg-secondary hover:shadow-md dark:bg-card dark:ring-foreground/10 dark:hover:bg-muted/40"
                href={post.url}
                key={post.url}
              >
                <span
                  className={cn(
                    "relative block w-full overflow-hidden bg-muted",
                    isOgPreview ? "aspect-1200/630" : "h-48 md:h-64"
                  )}
                >
                  <Image
                    alt={post.data.title}
                    className="object-cover"
                    draggable={false}
                    fill
                    loading={isLcpCandidate ? "eager" : undefined}
                    priority={isLcpCandidate}
                    src={post.data.image ?? getBlogPageImage(post).url}
                    unoptimized
                  />
                </span>
                <div className="flex flex-1 flex-col border-foreground/6 border-t px-4 py-4 md:px-5 md:py-5">
                  <p className="font-semibold text-base text-foreground leading-snug tracking-tight transition-colors group-hover:text-foreground md:text-lg">
                    {post.data.title}
                  </p>
                  <p className="mt-1.5 text-fd-muted-foreground text-sm leading-relaxed">
                    {post.data.description}
                  </p>

                  <span className="mt-4 flex items-center justify-between">
                    <span className="inline-flex text-foreground/70 text-xs">
                      {(post.data.hashtags ?? []).map((tag, idx) => (
                        <span
                          className="inline-flex h-4 items-center"
                          key={tag}
                        >
                          <p>{tag}</p>
                          {idx ===
                          (post.data.hashtags?.length ?? 0) - 1 ? null : (
                            <Separator
                              className="mx-2"
                              orientation="vertical"
                            />
                          )}
                        </span>
                      ))}
                    </span>
                    <p className="mt-auto text-foreground/70 text-xs">
                      {new Date(
                        post.data.date ?? getName(post.path)
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </span>
                </div>
              </Link>
            );
          })}
          <PlusSeparator
            main={{ className: "z-20" }}
            position={["bottom-left", "bottom-right"]}
          />
        </div>
      </section>
    </main>
  );
}

function getName(filePath: string) {
  return path.basename(filePath, path.extname(filePath));
}
