import type { ReactNode } from "react";
import { HomeShell } from "@/components/home-shell";
import { LegalPageHeader } from "./legal-page-header";

interface LegalShellProps {
  children: ReactNode;
}

export function LegalShell({ children }: LegalShellProps) {
  return (
    <div className="min-h-[calc(100dvh-4.625rem)] bg-background pt-20 text-foreground sm:pt-24">
      <HomeShell className="py-10 lg:py-16">
        <div className="mx-auto w-full max-w-3xl">
          <LegalPageHeader />
          {children}
        </div>
      </HomeShell>
    </div>
  );
}
