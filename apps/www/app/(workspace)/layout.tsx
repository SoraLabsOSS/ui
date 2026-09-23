import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { AuthSessionProviders } from "@/components/auth-session-providers";
import { Providers } from "@/components/providers";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const fallback = <WorkspaceShell defaultOpen>{children}</WorkspaceShell>;

  return (
    <Suspense fallback={<Providers>{fallback}</Providers>}>
      <AuthSessionProviders>
        <WorkspaceShell defaultOpen>{children}</WorkspaceShell>
      </AuthSessionProviders>
    </Suspense>
  );
}
