import { type ReactNode, Suspense } from "react";
import { AISearchRoot } from "@/components/ai/shell";
import { AuthSessionProviders } from "@/components/auth-session-providers";
import { Providers } from "@/components/providers";

export default function DocLayout({ children }: { children: ReactNode }) {
  const content = (
    <>
      {children}
      <AISearchRoot />
    </>
  );

  return (
    <Suspense fallback={<Providers>{content}</Providers>}>
      <AuthSessionProviders>{content}</AuthSessionProviders>
    </Suspense>
  );
}
