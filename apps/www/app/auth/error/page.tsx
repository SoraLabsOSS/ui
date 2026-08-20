import {
  isSafeRedirectPath,
  resolveAuthRedirectTo,
} from "@workspace/auth-ui/lib/auth/redirect-to";
import { Button } from "@workspace/ui/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthLoading from "@/app/auth/[path]/loading";
import { SignInSplitShell } from "@/components/auth/sign-in-split-shell";
import {
  getAuthErrorContent,
  parseAuthErrorContext,
  readAuthErrorParam,
} from "@/lib/auth-errors";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "Sign-in error",
};

function buildSignInRetryHref(redirectTo: string): string {
  const params = new URLSearchParams({
    redirectTo,
  });

  return `/auth/sign-in?${params.toString()}`;
}

async function AuthErrorContent({
  searchParams,
}: {
  searchParams: Promise<{
    context?: string | string[];
    error?: string | string[];
    redirectTo?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const context = parseAuthErrorContext(params.context);
  const errorCode = readAuthErrorParam(params.error);
  const redirectFromQuery = readAuthErrorParam(params.redirectTo);

  const resolvedRedirect = resolveAuthRedirectTo(
    redirectFromQuery && isSafeRedirectPath(redirectFromQuery)
      ? redirectFromQuery
      : undefined
  );

  const content = getAuthErrorContent(errorCode, context);
  const signInRetryHref = buildSignInRetryHref(resolvedRedirect);

  const retryHref =
    context === "link" &&
    redirectFromQuery &&
    isSafeRedirectPath(redirectFromQuery)
      ? redirectFromQuery
      : signInRetryHref;

  const retryLabel =
    context === "link" ? "Back to Security settings" : "Try again";

  return (
    <SignInSplitShell>
      <div className="w-full">
        <h1 className="font-medium text-3xl text-foreground tracking-tight sm:text-4xl">
          {content.title}
        </h1>

        <p className="mt-3 text-muted-foreground">{content.description}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11">
            <Link href={retryHref}>{retryLabel}</Link>
          </Button>

          {context === "link" ? (
            <Button asChild className="h-11" variant="outline">
              <Link href={signInRetryHref}>Sign in again</Link>
            </Button>
          ) : (
            <Button asChild className="h-11" variant="outline">
              <Link href="/docs">Back to docs</Link>
            </Button>
          )}
        </div>
      </div>
    </SignInSplitShell>
  );
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{
    context?: string | string[];
    error?: string | string[];
    redirectTo?: string | string[];
  }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthErrorContent searchParams={searchParams} />
    </Suspense>
  );
}
