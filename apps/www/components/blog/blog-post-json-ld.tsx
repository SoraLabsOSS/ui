import { getBlogPostJsonLd } from "@/lib/blog/post-json-ld";
import type { BlogPage } from "@/lib/blog/source";

export function BlogPostJsonLd({ page }: { page: BlogPage }) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is emitted as a script and escapes '<' before injection.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getBlogPostJsonLd(page)).replace(
          /</g,
          "\\u003c"
        ),
      }}
      type="application/ld+json"
    />
  );
}
