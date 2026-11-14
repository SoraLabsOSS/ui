"use client";

import { ExamplePreviewClient } from "../../example-preview-client";

interface BlocksExampleClientProps {
  slug: string;
}

export function BlocksExampleClient({ slug }: BlocksExampleClientProps) {
  return (
    <ExamplePreviewClient
      passDemoProps={false}
      reducedMotion="never"
      showRefreshButton={false}
      slug={slug}
      smoothScroll
    />
  );
}
