"use client";

import { useIsMutating } from "@tanstack/react-query";
import { authMutationKeys } from "@workspace/auth-ui/lib/auth-core";
import { useAuth } from "@workspace/auth-ui/lib/auth-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";
import { ProviderButtons, type SocialLayout } from "./provider-buttons";

export type SignInVariant = "card" | "page";

export interface SignInProps {
  className?: string;
  description?: ReactNode;
  socialLayout?: SocialLayout;
  socialPosition?: "top" | "bottom";
  title?: ReactNode;
  variant?: SignInVariant;
}

const PAGE_PROVIDER_BUTTON_CLASS =
  "relative h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-4 font-medium text-black text-sm shadow-none transition-colors hover:bg-black/[0.02] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";
const PAGE_PROVIDER_CONTAINER_CLASS =
  "grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4";

function resolveSocialLayout(
  socialLayout: SocialLayout | undefined,
  isPageVariant: boolean
): SocialLayout | undefined {
  return socialLayout ?? (isPageVariant ? "grid" : undefined);
}

function SignInPageLayout({
  children,
  className,
  description,
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div>
        <h1 className="font-medium text-3xl text-foreground tracking-tight sm:text-4xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-3 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}

function SignInCardLayout({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title: ReactNode;
}) {
  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="font-semibold text-xl">{title}</CardTitle>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * Social-only sign-in surface for configured OAuth providers.
 */
export function SignIn({
  className,
  description,
  socialLayout,
  socialPosition = "top",
  title,
  variant = "card",
}: SignInProps) {
  const { localization, socialProviders } = useAuth();

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all,
  });
  const isPending = signInMutating > 0;

  const resolvedTitle = title ?? localization.auth.signIn;
  const isPageVariant = variant === "page";

  const providerButtons =
    socialProviders && socialProviders.length > 0 ? (
      <ProviderButtons
        buttonClassName={isPageVariant ? PAGE_PROVIDER_BUTTON_CLASS : undefined}
        buttonVariant={isPageVariant ? "secondary" : undefined}
        containerClassName={
          isPageVariant ? PAGE_PROVIDER_CONTAINER_CLASS : undefined
        }
        display={isPageVariant ? "full" : undefined}
        showLastUsedBadge={isPageVariant}
        showProviderLogo={isPageVariant}
        socialLayout={resolveSocialLayout(socialLayout, isPageVariant)}
      />
    ) : null;

  const formBody = (
    <div
      className={cn(
        "flex flex-col",
        isPageVariant ? "gap-0" : "gap-6",
        isPending && "pointer-events-none opacity-70"
      )}
    >
      {socialPosition === "bottom" ? null : providerButtons}
      {socialPosition === "bottom" ? providerButtons : null}
    </div>
  );

  if (isPageVariant) {
    return (
      <SignInPageLayout
        className={className}
        description={description}
        title={resolvedTitle}
      >
        {formBody}
      </SignInPageLayout>
    );
  }

  return (
    <SignInCardLayout className={className} title={resolvedTitle}>
      {formBody}
    </SignInCardLayout>
  );
}
