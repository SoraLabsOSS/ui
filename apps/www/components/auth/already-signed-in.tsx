"use client";

import { useAuth } from "@workspace/auth-ui/lib/auth-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Button } from "@workspace/ui/components/ui/button";
import { UserCheck } from "lucide-react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export function AlreadySignedIn() {
  const { basePaths, viewPaths, Link: AuthLink } = useAuth();

  return (
    <AuthPageShell>
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserCheck />
          </EmptyMedia>
          <EmptyTitle>You're already signed in</EmptyTitle>
          <EmptyDescription>
            You're currently signed in to your SoraLabs account. What would you
            like to do?
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild>
            <Link href="/docs">Docs</Link>
          </Button>
          <Button asChild variant="outline">
            <AuthLink href={`${basePaths.auth}/${viewPaths.auth.signOut}`}>
              Sign Out
            </AuthLink>
          </Button>
        </EmptyContent>
      </Empty>
    </AuthPageShell>
  );
}
