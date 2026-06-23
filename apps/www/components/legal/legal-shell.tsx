import type { ReactNode } from "react";
import { HomeShell } from "@/components/home/home-shell";
import { LegalPageFooter } from "./legal-page-footer";
import { LegalPageHeader } from "./legal-page-header";

interface LegalShellProps {
  children: ReactNode;
}

export function LegalShell({ children }: LegalShellProps) {
  return (
    <div className="min-h-[calc(100dvh-var(--fd-banner-height))] bg-background pt-16 text-foreground">
      <HomeShell className="py-10 lg:py-16">
        <div className="mx-auto w-full max-w-3xl">
          <LegalPageHeader />
          {children}
          <LegalPageFooter />
        </div>
      </HomeShell>
    </div>
  );
}
