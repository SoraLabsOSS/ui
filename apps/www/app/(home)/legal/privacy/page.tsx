import type { Metadata } from "next";
import { LegalArticle } from "@/components/legal/legal-article";
import { LegalShell } from "@/components/legal/legal-shell";
import { PrivacyPolicyArticle } from "@/components/legal/privacy-policy-article";
import { getPageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Sora UI collects, uses, and stores account data, bookmarks, analytics, and error diagnostics.",
  alternates: getPageAlternates("/legal/privacy"),
};

export default function LegalPrivacyPage() {
  return (
    <LegalShell>
      <LegalArticle>
        <PrivacyPolicyArticle />
      </LegalArticle>
    </LegalShell>
  );
}
