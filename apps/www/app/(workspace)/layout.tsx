import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { AuthSessionProviders } from "@/components/auth-session-providers";
import { Providers } from "@/components/providers";
import { LibraryLoadingSkeleton } from "@/components/workspace/library-loading-skeleton";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Providers>
          <WorkspaceShell defaultOpen>
            <LibraryLoadingSkeleton />
          </WorkspaceShell>
        </Providers>
      }
    >
      <AuthSessionProviders>
        <WorkspaceShell defaultOpen>{children}</WorkspaceShell>
      </AuthSessionProviders>
    </Suspense>
  );
}
