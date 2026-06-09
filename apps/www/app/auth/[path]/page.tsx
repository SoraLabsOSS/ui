import { viewPaths } from "@better-auth-ui/core";
import { Auth } from "@workspace/auth-ui/components/auth/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import { auth } from "@/lib/auth";
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

  if (path === "sign-in") {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (session?.user) {
      await auth.api.signOut({ headers: requestHeaders });
    }
  }

  return (
    <div className="my-auto flex justify-center p-4 md:p-6">
      {path === "sign-in" ? <GoogleOneTap /> : null}
      <Auth path={path} />
    </div>
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
