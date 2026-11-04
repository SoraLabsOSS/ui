import type { Metadata } from "next";
import { PRIVACY_POLICY_ITEMS } from "@/components/legal/legal-data";
import { LegalScrollView } from "@/components/legal/legal-scroll-view";
import { getPageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Sora UI collects, uses, and stores account data, bookmarks, analytics, and error diagnostics.",
  alternates: getPageAlternates("/legal/privacy"),
};

export default function LegalPrivacyPage() {
  return (
    <LegalScrollView
      lastUpdated="June 24, 2026"
      terms={PRIVACY_POLICY_ITEMS}
      title="Privacy Policy"
    />
  );
}
