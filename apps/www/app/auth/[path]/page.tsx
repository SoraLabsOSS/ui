import { Auth } from "@workspace/auth-ui/components/auth/auth";
import { viewPaths } from "@workspace/auth-ui/lib/auth-core";
import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlreadySignedIn } from "@/components/auth/already-signed-in";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import { SignInSplitShell } from "@/components/auth/sign-in-split-shell";
import { isDatabaseConfigured } from "@/env";
import AuthLoading from "./loading";

export function generateStaticParams() {
  return Object.values(viewPaths.auth).map((path) => ({ path }));
}

async function AuthPageContent({
  params,
}: {
  params: Promise<{
    path: string;
  }>;
}) {
  const { path } = await params;

  if (!Object.values(viewPaths.auth).includes(path)) {
    notFound();
  }

  if (path === "sign-in" && isDatabaseConfigured()) {
    const requestHeaders = await headers();

    if (getSessionCookie(requestHeaders)) {
      const { auth } = await import("@/lib/auth");
      const session = await auth.api.getSession({ headers: requestHeaders });

      if (session?.user) {
        return <AlreadySignedIn />;
      }
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
}: {
  params: Promise<{
    path: string;
  }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthPageContent params={params} />
    </Suspense>
  );
}
