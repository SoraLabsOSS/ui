"use client";

import { ExamplePreviewClient } from "../../example-preview-client";

interface CatalogExampleClientProps {
  slug: string;
}

export function CatalogExampleClient({ slug }: CatalogExampleClientProps) {
  return (
    <ExamplePreviewClient
      passDemoProps={false}
      reducedMotion="never"
      slug={slug}
    />
  );
}
