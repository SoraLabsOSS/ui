import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100dvh-var(--fd-banner-height))] w-full flex-col bg-background">
      <header className="p-4">
        <Link
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-foreground hover:bg-muted"
          href="/docs"
        >
          <ArrowLeft aria-hidden className="size-5" />
          <span className="ml-2 text-sm">Back to docs</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        {children}
      </main>

      <footer className="px-4 py-6 text-center text-muted-foreground text-sm">
        <p>
          By continuing, you agree to our{" "}
          <Link className="text-foreground hover:underline" href="/legal/terms">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            className="text-foreground hover:underline"
            href="/legal/privacy"
          >
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
