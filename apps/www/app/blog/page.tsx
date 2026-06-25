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
      <section className="w-full border-border/40 border-b">
        <div className="blog-inner relative flex h-24 gap-2 border-border/40 border-x" />
      </section>
      <BlogHeaderBanner />
      <section className="w-full border-border/40 border-b">
        <div className="blog-inner relative grid grid-cols-1 gap-2 border-border/40 border-x px-2 pt-20 pb-16 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const isOgPreview = !post.data.image;

            return (
              <Link
                className="group relative flex flex-col overflow-hidden rounded-xs border border-border/60 bg-background px-6 pt-6 pb-6 transition hover:border-foreground/20"
                href={post.url}
                key={post.url}
              >
                <span
                  className={cn(
                    "relative mb-4 block w-full overflow-hidden rounded-xs bg-background",
                    isOgPreview ? "aspect-1200/630" : "h-64"
                  )}
                >
                  <Image
                    alt={post.data.title}
                    className={isOgPreview ? "object-contain" : "object-cover"}
                    fill
                    src={post.data.image ?? getBlogPageImage(post).url}
                    unoptimized
                  />
                </span>
                <p className="mt-5 font-medium text-lg leading-5">
                  {post.data.title}
                </p>
                <p className="mt-px text-fd-muted-foreground text-sm leading-4.5">
                  {post.data.description}
                </p>

                <span className="mt-4 flex items-center justify-between">
                  <span className="inline-flex text-foreground/70 text-xs">
                    {(post.data.hashtags ?? []).map((tag, idx) => (
                      <span className="inline-flex h-4 items-center" key={tag}>
                        <p>{tag}</p>
                        {idx ===
                        (post.data.hashtags?.length ?? 0) - 1 ? null : (
                          <Separator className="mx-2" orientation="vertical" />
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
