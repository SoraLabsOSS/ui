import { viewPaths } from "@better-auth-ui/core";
import { Auth } from "@workspace/auth-ui/components/auth/auth";
import { resolveAuthRedirectTo } from "@workspace/auth-ui/lib/auth/redirect-to";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import { SignInSplitShell } from "@/components/auth/sign-in-split-shell";
import { isDatabaseConfigured } from "@/env";
import { auth } from "@/lib/auth";
import AuthLoading from "./loading";

export function generateStaticParams() {
  return Object.values(viewPaths.auth).map((path) => ({ path }));
}

function readRedirectToQuery(
  redirectTo: string | string[] | undefined
): string | undefined {
  if (typeof redirectTo === "string") {
    return redirectTo;
  }

  return redirectTo?.[0];
}

async function AuthPageContent({
  params,
  searchParams,
}: {
  params: Promise<{
    path: string;
  }>;
  searchParams: Promise<{
    redirectTo?: string | string[];
  }>;
}) {
  const { path } = await params;
  const { redirectTo: redirectToParam } = await searchParams;

  if (!Object.values(viewPaths.auth).includes(path)) {
    notFound();
  }

  if (path === "sign-in" && isDatabaseConfigured()) {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (session?.user) {
      redirect(resolveAuthRedirectTo(readRedirectToQuery(redirectToParam)));
    }
  }

  const isSignIn = path === "sign-in";

  if (isSignIn) {
    return (
      <SignInSplitShell>
        <GoogleOneTap />
        <Auth
          description="Sign in below to access your account and saved components."
          path={path}
          socialPosition="top"
          title="Welcome to Sora UI"
          variant="page"
        />
      </SignInSplitShell>
    );
  }

  return (
    <AuthPageShell>
      <Auth path={path} variant="card" />
    </AuthPageShell>
  );
}

export default function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{
    path: string;
  }>;
  searchParams: Promise<{
    redirectTo?: string | string[];
  }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
