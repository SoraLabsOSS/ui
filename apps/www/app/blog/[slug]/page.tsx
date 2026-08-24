import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogOgImage } from "@/components/blog/blog-og-image";
import { BlogPostJsonLd } from "@/components/blog/blog-post-json-ld";
import { KbToc } from "@/components/blog/kb-toc";
import {
  createBlogMetadata,
  getBlogPageImage,
  getBlogPostOgMetadataImage,
} from "@/lib/blog/metadata";
import { getReadingTimeMinutes } from "@/lib/blog/reading-time";
import { blog } from "@/lib/blog/source";
import { getPageAlternates } from "@/lib/site";
import { getMDXComponents } from "@/mdx-components";
import { BlogPostAside } from "./post-aside";
import { BlogPostHeader } from "./post-header";

const HASHTAG_PREFIX = /^#/;

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  if (!blog.getPage([params.slug])) {
    notFound();
  }

  return <BlogPostBody slug={params.slug} />;
}

async function BlogPostBody({ slug }: { slug: string }) {
  const page = blog.getPage([slug]);
  if (!page) {
    return null;
  }

  const MDXContent = page.data.body;

  const image = {
    url: page.data.image ?? getBlogPageImage(page).url,
    width: 1200,
    height: 630,
  };

  const publishedAt = new Date(
    page.data.date ?? path.basename(page.path, path.extname(page.path))
  );
  const primaryTag = page.data.hashtags?.[0]?.replace(HASHTAG_PREFIX, "");
  const readingMinutes = getReadingTimeMinutes(page.data);

  return (
    <div
      className="@container mx-auto w-full max-w-[1400px] px-4 pt-20 pb-16 sm:pt-24 md:px-6 md:pt-28 md:pb-24"
      id="page-content"
    >
      <BlogPostJsonLd page={page} />
      <KbToc contentId="kb-main-content" />

      {/* Row 1: Header Grid */}
      <div className="grid grid-cols-12 gap-x-6 gap-y-6">
        <BlogPostHeader
          author={page.data.author}
          date={publishedAt}
          description={page.data.description}
          primaryTag={primaryTag}
          readingMinutes={readingMinutes}
          title={page.data.title}
          url={page.url}
        />
      </div>

      {/* Row 2: Main Content & Aside Grid */}
      <div className="grid grid-cols-12 gap-x-6 gap-y-6">
        <BlogPostAside
          author={page.data.author}
          date={publishedAt}
          description={page.data.description}
          readingMinutes={readingMinutes}
          title={page.data.title}
          url={page.url}
        />

        <div className="@lg:col-span-7 @xl:col-span-6 col-span-12 @lg:col-start-2 @xl:col-start-4 [--grid-divider-gap:72px]">
          <article
            className="@lg:col-span-8 col-span-12 flex flex-initial flex-col items-center justify-start gap-6 text-base lg:text-lg [&>*:not([data-kb-media-breakout])]:w-full [&>*]:min-w-0 [&_[class*='container']_p]:m-0 hover:[&_[data-slot=note]_a]:no-underline [&_[data-slot=note]_p]:my-0 [&_code_p]:my-0 [&_code_p]:contents [&_ol]:ml-0 [&_ol]:list-decimal [&_ol]:p-0 [&_ol]:pl-4 md:[&_ol]:ml-1 [&_ul]:list-disc [&_ul]:p-0 [&_ul]:pl-4 md:[&_ul]:ml-1"
            id="kb-main-content"
          >
            <figure className="mb-6 w-full">
              <div className="overflow-hidden rounded-md border border-border/60 bg-background shadow-xs">
                <BlogOgImage
                  className="w-full"
                  image={{
                    alt: page.data.title,
                    className: "h-auto w-full",
                    draggable: false,
                    height: image.height,
                    loading: "eager",
                    priority: true,
                    src: image.url,
                    unoptimized: true,
                    width: image.width,
                  }}
                />
              </div>
            </figure>

            {page.data.flags?.includes("personal-opinion") ? (
              <p className="mt-8 rounded-md border-yellow-500 border-l-4 bg-yellow-300/50 p-4 text-xs md:text-sm">
                <strong>Personal opinion:</strong> The views in this post are
                the author&apos;s own and do not represent Sora UI or any
                affiliated organization.
              </p>
            ) : null}

            <div className="prose dark:prose-invert w-full max-w-none">
              <MDXContent components={getMDXComponents()} />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = blog.getPage([params.slug]);

  if (!page) {
    return {};
  }

  const image = getBlogPostOgMetadataImage(page);
  const canonicalPath = page.url;
  const publishedTime = new Date(page.data.date).toISOString();

  return createBlogMetadata({
    title: page.data.title,
    description: page.data.description ?? "A post from the Sora UI blog.",
    authors: [{ name: page.data.author }],
    alternates: getPageAlternates(canonicalPath),
    openGraph: {
      type: "article",
      url: canonicalPath,
      publishedTime,
      modifiedTime: page.data.lastModified
        ? new Date(page.data.lastModified).toISOString()
        : publishedTime,
      images: [image],
    },
    twitter: {
      images: [image.url],
    },
  });
}

export function generateStaticParams(): { slug: string }[] {
  return blog.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}
