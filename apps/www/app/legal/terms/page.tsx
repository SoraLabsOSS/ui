import type { Metadata } from "next";
import { LegalArticle } from "@/components/legal/legal-article";
import { LegalShell } from "@/components/legal/legal-shell";
import { TermsOfServiceArticle } from "@/components/legal/terms-of-service-article";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of the Sora UI website, registry, documentation, and account features.",
  alternates: {
    canonical: "/legal/terms",
  },
};

export default function LegalTermsPage() {
  return (
    <LegalShell>
      <LegalArticle>
        <TermsOfServiceArticle />
      </LegalArticle>
    </LegalShell>
  );
}
