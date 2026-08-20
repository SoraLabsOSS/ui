import { HomePageClient } from "@/app/(home)/home-page-client";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { getBlockCount } from "@/lib/registry/get-component-page-data";
import { getLatestShippedRegistryItem } from "@/lib/registry/get-latest-shipped-registry-item";

export default function HomePage() {
  const latestShipped = getLatestShippedRegistryItem();
  const primitivesUrl = getFirstPrimitiveDocUrl();
  const blocksCount = getBlockCount();

  return (
    <HomePageClient
      blocksCount={blocksCount}
      blocksUrl="/catalog"
      latestShipped={latestShipped}
      primitivesUrl={primitivesUrl}
    />
  );
}
