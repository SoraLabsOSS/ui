import { getBlogPostJsonLd } from "@/lib/blog/post-json-ld";
import type { BlogPage } from "@/lib/blog/source";

export function BlogPostJsonLd({ page }: { page: BlogPage }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getBlogPostJsonLd(page)),
      }}
      type="application/ld+json"
    />
  );
}
