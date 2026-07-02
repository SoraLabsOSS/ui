import path from "node:path";
import { cn } from "@workspace/ui/lib/utils";
import { DocsPage } from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReadTimeResults } from "reading-time";
import { BlogOgImage } from "@/components/blog/blog-og-image";
import { BlogPostJsonLd } from "@/components/blog/blog-post-json-ld";
import { InlineTOC } from "@/components/blog/inline-toc";
import {
  createBlogMetadata,
  getBlogPageImage,
  getBlogPostOgMetadataImage,
} from "@/lib/blog/metadata";
import { getReadingTimeMinutes } from "@/lib/blog/reading-time";
import { blog } from "@/lib/blog/source";
import { getPageAlternates } from "@/lib/site";
import { getMDXComponents } from "@/mdx-components";
import { BlogPostHeader } from "./post-header";

const HASHTAG_PREFIX = /^#/;
const blogPostGutterClassName = "px-0 md:px-4";

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);

  if (!page) {
    notFound();
  }

  const MDXContent = page.data.body;
  const toc = page.data.toc;

  const image = {
    url: page.data.image ?? getBlogPageImage(page).url,
    width: 1200,
    height: 630,
  };

  const publishedAt = new Date(
    page.data.date ?? path.basename(page.path, path.extname(page.path))
  );
  const primaryTag = page.data.hashtags?.[0]?.replace(HASHTAG_PREFIX, "");
  const readingMinutes = getReadingTimeMinutes(
    page.data as unknown as { readingTime: ReadTimeResults }
  );

  return (
    <DocsPage
      breadcrumb={{ enabled: false }}
      footer={{
        enabled: false,
      }}
      full={page.data.full}
      tableOfContent={{
        style: "clerk",
      }}
      tableOfContentPopover={{
        style: "clerk",
      }}
      toc={toc}
    >
      <BlogPostJsonLd page={page} />
      <article className="blog-article flex w-full flex-col pb-16">
        <div
          className={cn(
            "mx-auto flex w-full max-w-[800px] flex-col",
            blogPostGutterClassName
          )}
        >
          <BlogPostHeader
            author={page.data.author}
            date={publishedAt}
            primaryTag={primaryTag}
            readingMinutes={readingMinutes}
            title={page.data.title}
            url={page.url}
          />
        </div>

        <figure
          className={cn(
            "mx-auto mb-6 w-full max-w-[800px]",
            blogPostGutterClassName
          )}
        >
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

        <div
          className={cn(
            "prose dark:prose-invert mx-auto w-full min-w-0 max-w-[800px] flex-1",
            blogPostGutterClassName
          )}
        >
          {page.data.flags?.includes("personal-opinion") ? (
            <p className="mt-8 rounded-md border-yellow-500 border-l-4 bg-yellow-300/50 p-4 text-xs md:text-sm">
              <strong>Personal opinion:</strong> The views in this post are the
              author&apos;s own and do not represent Sora UI or any affiliated
              organization.
            </p>
          ) : null}
          <InlineTOC className="mt-2 mb-4" items={toc} />
          <MDXContent components={getMDXComponents()} />
        </div>
      </article>
    </DocsPage>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = blog.getPage([params.slug]);

  if (!page) {
    notFound();
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
