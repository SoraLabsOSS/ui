import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Settings } from "@workspace/auth-ui/components/auth/settings/settings";
import { viewPaths } from "@workspace/auth-ui/lib/auth-core";
import { ensureSession } from "@workspace/auth-ui/lib/auth-react/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SettingsLoadingSkeleton } from "@/components/workspace/settings-loading-skeleton";
import { isDatabaseConfigured } from "@/env";
import { auth } from "@/lib/auth";
import { getQueryClient } from "@/lib/query-client";

export function generateStaticParams() {
  return Object.values(viewPaths.settings).map((path) => ({ path }));
}

async function ProtectedSettingsContent({ path }: { path: string }) {
  // Request-time only: Cache Components still prerenders generateStaticParams
  // shells; without this, the auth guard runs with no cookies and caches a
  // redirect to /auth/sign-in.
  await connection();

  if (!isDatabaseConfigured()) {
    redirect(
      `/auth/sign-in?redirectTo=${encodeURIComponent(`/settings/${path}`)}`
    );
  }

  const requestHeaders = await headers();
  const queryClient = getQueryClient();

  const session = await ensureSession(queryClient, auth, {
    headers: requestHeaders,
  });

  if (!session) {
    redirect(
      `/auth/sign-in?redirectTo=${encodeURIComponent(`/settings/${path}`)}`
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-6 md:px-6 md:pt-8 md:pb-8">
        <Settings path={path} />
      </div>
    </HydrationBoundary>
  );
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{
    path: string;
  }>;
}) {
  const { path } = await params;

  if (!Object.values(viewPaths.settings).includes(path)) {
    notFound();
  }

  return (
    <Suspense fallback={<SettingsLoadingSkeleton />}>
      <ProtectedSettingsContent path={path} />
    </Suspense>
  );
}
