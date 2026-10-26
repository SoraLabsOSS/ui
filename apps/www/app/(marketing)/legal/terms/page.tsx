import type { Metadata } from "next";
import { LegalScrollView } from "@/components/legal/legal-scroll-view";
import { TERMS_OF_SERVICE_ITEMS } from "@/components/legal/terms-data";
import { getPageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of the Sora UI website, registry, documentation, and account features.",
  alternates: getPageAlternates("/legal/terms"),
};

export default function LegalTermsPage() {
  return (
    <LegalScrollView
      lastUpdated="June 24, 2026"
      terms={TERMS_OF_SERVICE_ITEMS}
      title="Terms of Service"
    />
  );
}
