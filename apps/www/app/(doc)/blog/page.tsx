import path from "node:path";

import type { Metadata } from "next";
import Link from "next/link";

import { HomeShell } from "@/components/home-shell";
import { getBlogIndexOgContent } from "@/lib/blog/get-blog-index-og-content";
import { createBlogMetadata } from "@/lib/blog/metadata";
import { blog } from "@/lib/blog/source";
import { getPageAlternates, SITE_URL } from "@/lib/site";

import { BlogPostsList } from "./blog-posts-list";
import type { SerializedBlogPost } from "./blog-posts-list";
import { BlogSearchTrigger } from "./blog-search-trigger";

export const metadata: Metadata = createBlogMetadata({
  title: "Blog",
  description: getBlogIndexOgContent().quote,
  alternates: getPageAlternates("/blog"),
});

const HASH_REGEX = /^#/;

const FEATURED_TOPIC_CARDS = [
  {
    title: "Motion Primitives",
    tag: "Motion",
    description:
      "Animation building blocks, gesture physics, and spring-driven transitions for React and Next.js.",
    href: "/motion",
  },
  {
    title: "Base & Radix UI",
    tag: "UI Kit",
    description:
      "Accessible component foundation infused with Sora Motion and Tailwind CSS v4.",
    href: "/ui",
  },
  {
    title: "Catalog Showcases",
    tag: "Catalog",
    description:
      "Ready-to-use animated showcases, interactive heroes, and full-page layout sections.",
    href: "/catalog",
  },
];

const ALL_TOPICS = [
  {
    title: "Motion Primitives",
    description: "Gesture, spring physics, and entrance transitions.",
    href: "/motion",
  },
  {
    title: "Animated Icons",
    description: "Micro-interactions and trigger-based animated Lucide icons.",
    href: "/icons",
  },
  {
    title: "Base UI Foundation",
    description: "Unstyled, accessible Base UI primitives with Motion.",
    href: "/ui",
  },
  {
    title: "Radix UI Primitives",
    description: "Production-ready Radix UI components with smooth animations.",
    href: "/ui",
  },
  {
    title: "Catalog Showcases",
    description: "Full-page animated sections and landing page templates.",
    href: "/catalog",
  },
  {
    title: "Sora MCP & AI",
    description:
      "Model Context Protocol tools and prompts for AI coding agents.",
    href: "/docs",
  },
  {
    title: "GSAP & WebGL Shaders",
    description: "Advanced scroll-driven animations and shader backgrounds.",
    href: "/docs",
  },
];

export default function BlogPage() {
  const rawPosts = blog
    .getPages()
    .filter((post) => !(post.data.subpage || post.data.hidden))
    .toSorted(
      (a, b) =>
        new Date(b.data.date ?? getName(b.path)).getTime() -
        new Date(a.data.date ?? getName(a.path)).getTime()
    );

  const serializedPosts: SerializedBlogPost[] = rawPosts.map((post) => {
    const rawDate = new Date(post.data.date ?? getName(post.path));
    return {
      url: post.url,
      title: post.data.title,
      description: post.data.description,
      dateIso: rawDate.toISOString(),
      dateFormatted: rawDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      hashtags: post.data.hashtags ?? [],
      author: post.data.author,
    };
  });

  const featuredPosts = serializedPosts.slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Sora UI Blog",
    description:
      "Notes on motion, UI craft, and shipping React experiences with Sora UI.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "Sora UI",
      url: SITE_URL,
    },
  };

  return (
    <main className="@container overflow-x-clip">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <HomeShell as="div">
        {/* Hero Section */}
        <section className="relative flex flex-col gap-16 pt-16 pb-12 @md:gap-20 @md:pt-20 @md:pb-16 @lg:gap-24 @lg:pt-24 @lg:pb-16">
          <div className="flex flex-col gap-8">
            <div className="flex max-w-3xl flex-col gap-3">
              <h1 className="text-foreground text-[40px] leading-[1.1] font-[450] tracking-[-0.03em] text-balance @md:text-[56px] @md:leading-[1.05] @lg:text-[64px] @lg:leading-[1.05] @lg:tracking-[-0.04em]">
                Sora Blog
              </h1>
              <div className="text-muted-foreground text-[18px] leading-[28px] font-normal text-balance">
                Notes on motion, UI craft, and shipping React experiences that
                feel intentional.
              </div>
              <div className="pt-1">
                <Link
                  className="text-muted-foreground hover:text-foreground font-mono text-xs transition-colors"
                  href="/blog/rss.xml"
                >
                  [/rss.xml]
                </Link>
              </div>
            </div>
            <BlogSearchTrigger />
          </div>
        </section>

        {/* Featured Topics Section (Clean Text Cards) */}
        <section className="relative flex flex-col pb-16 @md:pb-20 @lg:pb-24">
          <h2 className="sr-only">Featured Topics</h2>
          <ul className="m-0 grid list-none grid-cols-12 gap-x-6 gap-y-6 p-0">
            {FEATURED_TOPIC_CARDS.map((card) => (
              <li className="col-span-full @lg:col-span-4" key={card.title}>
                <Link
                  className="group border-border/80 bg-card/40 hover:border-foreground/40 hover:bg-accent/40 relative isolate m-0 flex h-full min-h-[160px] w-full cursor-pointer flex-col justify-between rounded-lg border p-6 no-underline transition-colors duration-200 outline-none focus-visible:outline-2"
                  href={card.href}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[12px] font-medium tracking-wide uppercase">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-foreground text-[20px] leading-[28px] font-medium tracking-[-0.015em] text-pretty">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground line-clamp-3 text-[15px] leading-[22px] text-pretty">
                    {card.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <section className="border-border/40 relative flex flex-col gap-6 border-t pt-16 pb-16 @md:gap-8 @md:pt-20 @md:pb-20 @lg:gap-10 @lg:pt-24 @lg:pb-24">
            <h2 className="text-foreground text-[32px] leading-[1.15] font-[450] tracking-[-0.025em] text-balance @md:text-[44px] @lg:text-[56px] @lg:leading-[1.05] @lg:tracking-[-0.035em]">
              Featured Posts
            </h2>
            <ul className="m-0 grid list-none grid-cols-12 gap-x-6 gap-y-6 p-0">
              {featuredPosts.map((post) => (
                <li className="col-span-full @lg:col-span-4" key={post.url}>
                  <article
                    aria-label={post.title}
                    className="flex min-h-0 w-full flex-col @lg:flex-1"
                  >
                    <Link
                      className="border-border/70 hover:border-foreground/40 hover:bg-accent/40 mb-6 flex h-full w-full cursor-pointer flex-col gap-4 rounded-lg border p-6 outline-offset-4 transition-colors duration-200 ease-in-out focus-visible:outline-2 @lg:mb-0 @lg:min-h-0 @lg:flex-1"
                      href={post.url}
                    >
                      <div className="flex flex-row flex-wrap items-center justify-start gap-2 @max-lg:mb-5">
                        <h4 className="sr-only">Tags</h4>
                        <span className="text-foreground flex items-center gap-3 font-sans text-sm font-medium">
                          <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
                            {post.hashtags.map((tag) => (
                              <li
                                className="text-muted-foreground text-xs font-medium"
                                key={tag}
                              >
                                {tag.replace(HASH_REGEX, "")}
                              </li>
                            ))}
                          </ul>
                        </span>
                      </div>
                      <h3 className="text-foreground line-clamp-3 min-h-[96px] text-[24px] leading-[32px] font-[450] tracking-[-0.02em] text-balance @max-lg:text-pretty @lg:@max-xl:pr-6">
                        {post.title}
                      </h3>
                      <div className="mt-auto flex shrink-0 flex-col gap-5 @max-lg:pt-5">
                        <p className="text-muted-foreground line-clamp-3 max-h-[60px] text-[14px] leading-[20px] text-wrap">
                          {post.description}
                        </p>
                        <div className="text-muted-foreground flex items-center justify-between text-xs">
                          {post.author && <span>By {post.author}</span>}
                          <time dateTime={post.dateIso}>
                            {post.dateFormatted}
                          </time>
                        </div>
                      </div>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All Posts Section */}
        <section className="border-border/40 relative flex flex-col gap-6 border-t pt-16 pb-16 @md:gap-8 @md:pt-20 @md:pb-20 @lg:gap-10 @lg:pt-24 @lg:pb-24">
          <BlogPostsList posts={serializedPosts} />
        </section>

        {/* All Topics Section */}
        <section className="border-border/40 relative flex flex-col gap-6 border-t pt-12 pb-16 @md:gap-8 @md:pt-16 @md:pb-20 @lg:gap-10 @lg:pt-18 @lg:pb-24">
          <div className="grid grid-cols-12 gap-x-6 gap-y-6">
            <h2 className="text-foreground col-span-full text-[32px] leading-[1.15] font-[450] tracking-[-0.025em] text-balance @md:text-[44px] @lg:col-span-5 @lg:text-[56px] @lg:leading-[1.05] @lg:tracking-[-0.035em]">
              Browse by Topic
            </h2>
            <p className="text-muted-foreground col-span-full text-[16px] leading-[24px] text-balance @lg:col-span-6 @lg:col-start-7 @lg:text-[18px] @lg:leading-[28px]">
              Explore components, animation physics, and guides across the Sora
              UI distribution.
            </p>
          </div>
          <ul className="m-0 grid list-none grid-cols-12 gap-x-6 gap-y-6 p-0">
            {ALL_TOPICS.map((topic) => (
              <li className="col-span-full @lg:col-span-4" key={topic.title}>
                <Link
                  className="border-border/70 hover:border-foreground/40 hover:bg-accent/30 flex h-full cursor-pointer flex-col gap-6 rounded-lg border p-6 no-underline transition-colors outline-none sm:p-8"
                  href={topic.href}
                >
                  <div className="flex h-full flex-col justify-start gap-2 @lg:gap-3">
                    <span className="text-foreground flex items-center gap-2 text-[16px] leading-[24px] font-medium">
                      {topic.title}
                    </span>
                    <span className="text-muted-foreground max-w-[32ch] max-w-full text-[16px] leading-[24px] text-balance">
                      {topic.description}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Pre-footer Call to Action */}
        <div className="border-border/40 border-t pt-8 pb-16 md:pb-20 @lg:pt-12">
          <div className="grid grid-cols-12 items-center gap-x-6 gap-y-8">
            <h2 className="text-foreground col-span-full text-[32px] leading-[1.15] font-[450] tracking-[-0.025em] text-balance sm:text-[40px] sm:leading-[1.1] @lg:col-start-1 @lg:col-end-9 @lg:text-[48px] @lg:leading-[1.05] @lg:tracking-[-0.03em]">
              Ready to build with Sora UI?
            </h2>
            <div className="col-span-full flex flex-wrap items-center gap-4 @lg:col-start-9 @lg:col-end-13 @lg:justify-end">
              <Link
                className="bg-foreground text-background hover:bg-foreground/90 flex h-9 items-center justify-center rounded-full px-4 text-[14px] font-medium transition-colors"
                href="/catalog"
              >
                <span className="inline-block truncate px-1.5">
                  Explore Catalog
                </span>
              </Link>
              <Link
                className="border-border/80 bg-background text-foreground hover:bg-accent flex h-9 items-center justify-center rounded-full border px-4 text-[14px] font-medium transition-colors"
                href="/docs"
              >
                <span className="inline-block truncate px-1.5">
                  Documentation
                </span>
              </Link>
            </div>
          </div>
        </div>
      </HomeShell>
    </main>
  );
}

function getName(filePath: string) {
  return path.basename(filePath, path.extname(filePath));
}
