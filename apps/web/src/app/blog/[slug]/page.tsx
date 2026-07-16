import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPost } from "@/components/blog-post";
import type { BlogPostData } from "@/lib/blog";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { getOgImagePath } from "@/lib/og/get-og-image-path";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";
import { getMetadataBaseUrl, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const { title, description } = post.metadata;
  const pathSegments = ["blog", slug];

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: getOgMetadataImages(pathSegments, title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: getTwitterMetadataImages(pathSegments),
    },
  };
}

function getBlogPostingJsonLd(post: BlogPostData, slug: string) {
  const { title, description, author, date } = post.metadata;
  const url = `${SITE_URL}/blog/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}/#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: title,
    description,
    url,
    datePublished: date,
    dateModified: date,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: author ?? "Axyl",
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    image: `${getMetadataBaseUrl()}${getOgImagePath("blog", slug)}`,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    ...(post.metadata.tags?.length
      ? { keywords: post.metadata.tags.join(", ") }
      : {}),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBlogPostingJsonLd(post, slug)),
        }}
        type="application/ld+json"
      />
      <BlogPost
        Content={post.default}
        metadata={post.metadata}
        slug={slug}
        toc={post.toc}
      />
    </>
  );
}
