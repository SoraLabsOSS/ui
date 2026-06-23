import type { Metadata } from "next";
import { Header } from "@/components/header";
import { LegalArticle } from "@/components/legal/legal-article";
import { LegalShell } from "@/components/legal/legal-shell";
import { PrivacyPolicyArticle } from "@/components/legal/privacy-policy-article";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Sora UI collects, uses, and stores account data, bookmarks, analytics, and error diagnostics.",
  alternates: {
    canonical: "/legal/privacy",
  },
};

export default function LegalPrivacyPage() {
  return (
    <>
      <Header />
      <LegalShell>
        <LegalArticle>
          <PrivacyPolicyArticle />
        </LegalArticle>
      </LegalShell>
    </>
  );
}
