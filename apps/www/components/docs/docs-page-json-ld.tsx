import { getDocsPageJsonLd } from "@/lib/docs/docs-page-json-ld";
import type { Page } from "@/lib/docs/source";

export function DocsPageJsonLd({ page }: { page: Page }) {
  return (
    <>
      {getDocsPageJsonLd(page).map((schema) => (
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script injection
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={schema["@type"]}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
