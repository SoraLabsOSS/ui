import { getDocsPageJsonLd } from "@/lib/docs/docs-page-json-ld";
import type { Page } from "@/lib/docs/source";

export function DocsPageJsonLd({ page }: { page: Page }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getDocsPageJsonLd(page)),
      }}
      type="application/ld+json"
    />
  );
}
