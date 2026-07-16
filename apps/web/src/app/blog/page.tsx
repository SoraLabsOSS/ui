import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog-index";
import { BLOG_INDEX_DESCRIPTION, BLOG_INDEX_TITLE } from "@/lib/blog";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";

export const metadata: Metadata = {
  title: BLOG_INDEX_TITLE,
  description: BLOG_INDEX_DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: BLOG_INDEX_TITLE,
    description: BLOG_INDEX_DESCRIPTION,
    type: "website",
    images: getOgMetadataImages(["blog"], BLOG_INDEX_TITLE),
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_INDEX_TITLE,
    description: BLOG_INDEX_DESCRIPTION,
    images: getTwitterMetadataImages(["blog"]),
  },
};

export default function BlogPage() {
  return <BlogIndex />;
}
