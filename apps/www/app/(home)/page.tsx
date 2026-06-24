import { HomePageClient } from "@/app/(home)/home-page-client";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { getLatestShippedRegistryItem } from "@/lib/registry/get-latest-shipped-registry-item";

export default function HomePage() {
  const latestShipped = getLatestShippedRegistryItem();
  const primitivesUrl = getFirstPrimitiveDocUrl();

  return (
    <HomePageClient
      latestShipped={latestShipped}
      primitivesUrl={primitivesUrl}
    />
  );
}
