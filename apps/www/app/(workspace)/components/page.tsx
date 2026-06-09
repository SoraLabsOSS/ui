import { ensureSession } from "@better-auth-ui/react/server";
import { UserButton } from "@workspace/auth-ui/components/auth/user/user-button";
import { Button } from "@workspace/ui/components/ui/button";
import { Loader, MoveLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getQueryClient } from "@/lib/query-client";

function ComponentsPageSkeleton() {
  return (
    <div className="flex text-muted-foreground text-sm">
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="mr-2 size-4 animate-spin" />
      </div>
    </div>
  );
}

async function ProtectedComponentsContent() {
  const queryClient = getQueryClient();
  const session = await ensureSession(queryClient, auth, {
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in?redirectTo=/components");
  }

  return (
    <section className="h-full w-full flex-1 flex-col items-start justify-center px-5 pt-24 md:pt-28">
      <div className="w-full lg:w-1/2">
        <h1 className="text-2xl">Hello, {session.user.email}</h1>
        <UserButton />
        <h1 className="mt-3 font-semibold text-2xl md:text-3xl">
          Page under construction
        </h1>
        <p className="mt-4">
          This page is currently under construction. Please come back later to
          explore more content.
        </p>

        <div className="mt-6 flex items-center gap-x-3">
          <Button className="cursor-not-allowed" disabled>
            <MoveLeft className="h-5 w-5" />
            <span>Go back</span>
          </Button>

          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function ComponentsPage() {
  return (
    <Suspense fallback={<ComponentsPageSkeleton />}>
      <ProtectedComponentsContent />
    </Suspense>
  );
}
