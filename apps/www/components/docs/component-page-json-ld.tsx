import { getComponentPageJsonLd } from "@/lib/docs/component-page-json-ld";
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
