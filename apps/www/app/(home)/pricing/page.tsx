import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing/pricing-page";
import { getLatestShippedRegistryItem } from "@/lib/registry/get-latest-shipped-registry-item";
import { getPageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Sora UI is free forever. No Pro plan, no locked components, no paywall. Optional GitHub Sponsors support keeps the registry maintained.",
  alternates: getPageAlternates("/pricing"),
  openGraph: {
    title: "Pricing — Sora UI",
    description:
      "Sora UI is free forever. No Pro plan, no locked components, no paywall.",
  },
};

export default function Page() {
  const latestShipped = getLatestShippedRegistryItem();

  return <PricingPage latestShipped={latestShipped} />;
}
