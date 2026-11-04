import {
  getComponentPageJsonLd,
  getDocsPageJsonLd,
} from "@/lib/docs/docs-json-ld";
import type { Page } from "@/lib/docs/source";
import type { ComponentDocPage } from "@/lib/registry/component-source";

interface ComponentPageJsonLdProps {
  componentUrl: string;
  page: ComponentDocPage;
}

export function ComponentPageJsonLd({
  page,
  componentUrl,
}: ComponentPageJsonLdProps) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is emitted as a script and escapes '<' before injection.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          getComponentPageJsonLd(page, componentUrl)
        ).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}

export function DocsPageJsonLd({ page }: { page: Page }) {
  return (
    <>
      {getDocsPageJsonLd(page).map((schema) => (
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script injection
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
          key={schema["@type"]}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
