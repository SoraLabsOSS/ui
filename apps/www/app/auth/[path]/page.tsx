import { viewPaths } from "@better-auth-ui/core";
import { Auth } from "@workspace/ui/components/auth/auth";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export function generateStaticParams() {
  return Object.values(viewPaths.auth).map((path) => ({ path }));
}

function AuthPageSkeleton() {
  return (
    <div className="my-auto flex justify-center p-4 md:p-6">
      <div className="h-96 w-full max-w-md animate-pulse rounded-xl bg-muted" />
    </div>
  );
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

  return (
    <div className="my-auto flex justify-center p-4 md:p-6">
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
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthPageContent params={params} />
    </Suspense>
  );
}
