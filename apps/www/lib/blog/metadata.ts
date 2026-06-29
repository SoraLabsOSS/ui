import type { Metadata } from "next";
import type { BlogPage } from "@/lib/blog/source";
import {
  BLOG_INDEX_OG_IMAGE_PATH,
  getBlogPostOgImagePath,
} from "@/lib/og/get-blog-og-image-path";
import { getMetadataBaseUrl, SITE_URL } from "@/lib/site";

const OG_SIZE = { width: 1200, height: 630 } as const;

function absoluteBlogOgImage(path: string, alt: string) {
  return {
    url: `${getMetadataBaseUrl()}${path}`,
    ...OG_SIZE,
    alt,
  };
}

export function createBlogMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: `${SITE_URL}/blog`,
      siteName: "Sora UI",
      images: [absoluteBlogOgImage(BLOG_INDEX_OG_IMAGE_PATH, "Sora UI Blog")],
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      site: "@soralabs_io",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: [`${getMetadataBaseUrl()}${BLOG_INDEX_OG_IMAGE_PATH}`],
      ...override.twitter,
    },
    alternates: {
      types: {
        "application/rss+xml": [
          {
            title: "Sora UI Blog",
            url: `${SITE_URL}/blog/rss.xml`,
          },
        ],
      },
      ...override.alternates,
    },
  };
}

export function getBlogPageImage(page: BlogPage) {
  const slug = page.slugs[0] ?? "post";

  return {
    slug,
    url: getBlogPostOgImagePath(slug),
  };
}

export function getBlogPostOgMetadataImage(page: BlogPage) {
  const image = getBlogPageImage(page);

  return absoluteBlogOgImage(image.url, page.data.title);
}
