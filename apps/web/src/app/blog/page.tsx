import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog-index";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return <BlogIndex />;
}
