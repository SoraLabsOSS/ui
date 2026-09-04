import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { HomeShell } from "@/components/home-shell";
import { getBlogIndexOgContent } from "@/lib/blog/get-blog-index-og-content";
import { createBlogMetadata } from "@/lib/blog/metadata";
import { blog } from "@/lib/blog/source";
import { getPageAlternates, SITE_URL } from "@/lib/site";
import { BlogPostsList, type SerializedBlogPost } from "./blog-posts-list";
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
    href: "/docs/motion",
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
    href: "/docs/motion",
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
  const rawPosts = [...blog.getPages()]
    .filter((post) => !(post.data.subpage || post.data.hidden))
    .sort(
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
        <section className="relative flex flex-col @lg:gap-24 @md:gap-20 gap-16 @lg:pt-24 @md:pt-20 pt-16 @lg:pb-16 @md:pb-16 pb-12">
          <div className="flex flex-col gap-8">
            <div className="flex max-w-3xl flex-col gap-3">
              <h1 className="text-balance font-[450] @lg:text-[64px] @md:text-[56px] text-[40px] text-foreground @lg:leading-[1.05] @md:leading-[1.05] leading-[1.1] @lg:tracking-[-0.04em] tracking-[-0.03em]">
                Sora Blog
              </h1>
              <div className="text-balance font-normal text-[18px] text-muted-foreground leading-[28px]">
                Notes on motion, UI craft, and shipping React experiences that
                feel intentional.
              </div>
              <div className="pt-1">
                <Link
                  className="font-mono text-muted-foreground text-xs transition-colors hover:text-foreground"
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
        <section className="relative flex flex-col @lg:pb-24 @md:pb-20 pb-16">
          <h2 className="sr-only">Featured Topics</h2>
          <ul className="m-0 grid list-none grid-cols-12 gap-x-6 gap-y-6 p-0">
            {FEATURED_TOPIC_CARDS.map((card) => (
              <li className="@lg:col-span-4 col-span-full" key={card.title}>
                <Link
                  className="group relative isolate m-0 flex h-full min-h-[160px] w-full cursor-pointer flex-col justify-between rounded-lg border border-border/80 bg-card/40 p-6 no-underline outline-none transition-colors duration-200 hover:border-foreground/40 hover:bg-accent/40 focus-visible:outline-2"
                  href={card.href}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[12px] text-muted-foreground uppercase tracking-wide">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-pretty font-medium text-[20px] text-foreground leading-[28px] tracking-[-0.015em]">
                      {card.title}
                    </h3>
                  </div>
                  <p className="line-clamp-3 text-pretty text-[15px] text-muted-foreground leading-[22px]">
                    {card.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <section className="relative flex flex-col @lg:gap-10 @md:gap-8 gap-6 border-border/40 border-t @lg:pt-24 @md:pt-20 pt-16 @lg:pb-24 @md:pb-20 pb-16">
            <h2 className="text-balance font-[450] @lg:text-[56px] @md:text-[44px] text-[32px] text-foreground @lg:leading-[1.05] leading-[1.15] @lg:tracking-[-0.035em] tracking-[-0.025em]">
              Featured Posts
            </h2>
            <ul className="m-0 grid list-none grid-cols-12 gap-x-6 gap-y-6 p-0">
              {featuredPosts.map((post) => (
                <li className="@lg:col-span-4 col-span-full" key={post.url}>
                  <article
                    aria-label={post.title}
                    className="flex min-h-0 w-full @lg:flex-1 flex-col @max-lg:border-b @max-lg:pb-10"
                  >
                    <Link
                      className="@lg:mb-0 mb-6 flex h-full @lg:min-h-0 w-full @lg:flex-1 cursor-pointer flex-col @lg:gap-4 gap-0 @lg:rounded-lg @lg:p-6 pr-0 outline-offset-4 transition-colors duration-200 ease-in-out @lg:hover:bg-accent/40 focus-visible:outline-2"
                      href={post.url}
                    >
                      <div className="@max-lg:mb-5 flex flex-row flex-wrap items-center justify-start gap-2">
                        <h4 className="sr-only">Tags</h4>
                        <span className="flex items-center gap-3 font-medium font-sans text-foreground text-sm">
                          <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
                            {post.hashtags.map((tag) => (
                              <li
                                className="font-medium text-muted-foreground text-xs"
                                key={tag}
                              >
                                {tag.replace(HASH_REGEX, "")}
                              </li>
                            ))}
                          </ul>
                        </span>
                      </div>
                      <h3 className="line-clamp-3 min-h-[96px] text-balance @max-lg:text-pretty @lg:@max-xl:pr-6 font-[450] text-[24px] text-foreground leading-[32px] tracking-[-0.02em]">
                        {post.title}
                      </h3>
                      <div className="mt-auto flex shrink-0 flex-col gap-5 @max-lg:pt-5">
                        <p className="line-clamp-3 max-h-[60px] text-wrap text-[14px] text-muted-foreground leading-[20px]">
                          {post.description}
                        </p>
                        <div className="flex items-center justify-between text-muted-foreground text-xs">
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
        <section className="relative flex flex-col @lg:gap-10 @md:gap-8 gap-6 border-border/40 border-t @lg:pt-24 @md:pt-20 pt-16 @lg:pb-24 @md:pb-20 pb-16">
          <BlogPostsList posts={serializedPosts} />
        </section>

        {/* All Topics Section */}
        <section className="relative flex flex-col @lg:gap-10 @md:gap-8 gap-6 border-border/40 border-t @lg:pt-18 @md:pt-16 pt-12 @lg:pb-24 @md:pb-20 pb-16">
          <div className="grid grid-cols-12 gap-x-6 gap-y-6">
            <h2 className="@lg:col-span-5 col-span-full text-balance font-[450] @lg:text-[56px] @md:text-[44px] text-[32px] text-foreground @lg:leading-[1.05] leading-[1.15] @lg:tracking-[-0.035em] tracking-[-0.025em]">
              Browse by Topic
            </h2>
            <p className="@lg:col-span-6 col-span-full @lg:col-start-7 text-balance @lg:text-[18px] text-[16px] text-muted-foreground @lg:leading-[28px] leading-[24px]">
              Explore components, animation physics, and guides across the Sora
              UI distribution.
            </p>
          </div>
          <ul className="m-0 grid list-none grid-cols-12 gap-x-6 gap-y-6 p-0">
            {ALL_TOPICS.map((topic) => (
              <li className="@lg:col-span-4 col-span-full" key={topic.title}>
                <Link
                  className="flex h-full cursor-pointer flex-col gap-6 rounded-lg border border-border/70 p-6 no-underline outline-none transition-colors hover:border-foreground/40 hover:bg-accent/30 sm:p-8"
                  href={topic.href}
                >
                  <div className="flex h-full flex-col justify-start @lg:gap-3 gap-2">
                    <span className="flex items-center gap-2 font-medium text-[16px] text-foreground leading-[24px]">
                      {topic.title}
                    </span>
                    <span className="max-w-[32ch] max-w-full text-balance text-[16px] text-muted-foreground leading-[24px]">
                      {topic.description}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Pre-footer Call to Action */}
        <div className="border-border/40 border-t @lg:pt-12 pt-8 pb-16 md:pb-20">
          <div className="grid grid-cols-12 items-center gap-x-6 gap-y-8">
            <h2 className="col-span-full @lg:col-start-1 @lg:col-end-9 text-balance font-[450] @lg:text-[48px] text-[32px] text-foreground @lg:leading-[1.05] leading-[1.15] @lg:tracking-[-0.03em] tracking-[-0.025em] sm:text-[40px] sm:leading-[1.1]">
              Ready to build with Sora UI?
            </h2>
            <div className="col-span-full @lg:col-start-9 @lg:col-end-13 flex flex-wrap items-center @lg:justify-end gap-4">
              <Link
                className="flex h-9 items-center justify-center rounded-full bg-foreground px-4 font-medium text-[14px] text-background transition-colors hover:bg-foreground/90"
                href="/catalog"
              >
                <span className="inline-block truncate px-1.5">
                  Explore Catalog
                </span>
              </Link>
              <Link
                className="flex h-9 items-center justify-center rounded-full border border-border/80 bg-background px-4 font-medium text-[14px] text-foreground transition-colors hover:bg-accent"
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
