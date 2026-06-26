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
        <div className="blog-inner relative grid grid-cols-1 gap-3 border-foreground/10 border-x px-0 pt-12 pb-12 md:grid-cols-2 md:gap-2 md:px-2 md:pt-20 md:pb-16 lg:grid-cols-3">
          {posts.map((post, index) => {
            const isOgPreview = !post.data.image;
            const isLcpCandidate = index === 0;

            return (
              <Link
                className="group relative flex flex-col overflow-hidden rounded-xs border border-foreground/10 bg-background transition hover:border-foreground/20"
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
                <div className="flex flex-1 flex-col px-4 py-4 md:px-6 md:py-6">
                  <p className="font-medium text-lg leading-5">
                    {post.data.title}
                  </p>
                  <p className="mt-px text-fd-muted-foreground text-sm leading-4.5">
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
