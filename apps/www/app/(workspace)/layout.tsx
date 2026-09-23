import type { Metadata } from "next";
import { cookies } from "next/headers";
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
        <WorkspaceShellWithSidebarState>
          {children}
        </WorkspaceShellWithSidebarState>
      </AuthSessionProviders>
    </Suspense>
  );
}

async function WorkspaceShellWithSidebarState({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return <WorkspaceShell defaultOpen={defaultOpen}>{children}</WorkspaceShell>;
}
