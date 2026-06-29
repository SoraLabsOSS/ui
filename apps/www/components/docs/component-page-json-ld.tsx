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
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getComponentPageJsonLd(page, componentUrl)),
      }}
      type="application/ld+json"
    />
  );
}
