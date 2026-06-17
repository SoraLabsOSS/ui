import { HomePageClient } from "@/app/(home)/home-page-client";
import { getLatestShippedRegistryItem } from "@/lib/registry/get-latest-shipped-registry-item";

export default function HomePage() {
  const latestShipped = getLatestShippedRegistryItem();

  return <HomePageClient latestShipped={latestShipped} />;
}
