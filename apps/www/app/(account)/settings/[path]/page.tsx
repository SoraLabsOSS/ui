import { viewPaths } from "@better-auth-ui/core";
import { ensureSession } from "@better-auth-ui/react/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Settings } from "@workspace/auth-ui/components/auth/settings/settings";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getQueryClient } from "@/lib/query-client";

export function generateStaticParams() {
  return Object.values(viewPaths.settings).map((path) => ({ path }));
}

function SettingsPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-24 pb-6 md:px-6 md:pt-28 md:pb-8">
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

async function ProtectedSettingsContent({ path }: { path: string }) {
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
      <div className="mx-auto w-full max-w-3xl px-4 pt-24 pb-6 md:px-6 md:pt-28 md:pb-8">
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
    <Suspense fallback={<SettingsPageSkeleton />}>
      <ProtectedSettingsContent path={path} />
    </Suspense>
  );
}
