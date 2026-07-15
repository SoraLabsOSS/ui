import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignInMarketingPanel } from "@/components/auth/sign-in-marketing-panel";

/**
 * Split-screen shell for the sign-in page: a form panel on the left and an
 * animated marketing panel on the right — mirrors the Sora Studio sign-up layout.
 */
export function SignInSplitShell({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-[calc(100dvh-var(--fd-banner-height))] bg-background p-3 text-foreground antialiased [font-synthesis:none]">
      <div className="grid min-h-[calc(100dvh-var(--fd-banner-height)-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="flex min-h-[760px] flex-col rounded-md border bg-background px-6 py-8 lg:min-h-0 lg:px-14 xl:px-20">
          <Link
            className="inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-muted-foreground text-sm hover:bg-muted hover:text-foreground"
            href="/docs"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back to docs
          </Link>

          <div className="flex flex-1 items-center justify-center py-4">
            <div className="mx-auto w-full max-w-[460px]">{children}</div>
          </div>

          <p className="text-center text-muted-foreground text-xs">
            By continuing, you agree to our{" "}
            <Link
              className="text-foreground hover:underline"
              href="/legal/terms"
            >
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
        </div>

        <SignInMarketingPanel />
      </div>
    </section>
  );
}
