import { getBlogPostJsonLd } from "@/lib/blog/post-json-ld";
import type { BlogPage } from "@/lib/blog/source";

export function BlogPostJsonLd({ page }: { page: BlogPage }) {
  return (
    <script
      // oxlint-disable-next-line react/no-danger -- JSON-LD is emitted as a script and escapes '<' before injection.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getBlogPostJsonLd(page)).replaceAll(
          "<",
          "\\u003c"
        ),
      }}
      type="application/ld+json"
    />
  );
}
