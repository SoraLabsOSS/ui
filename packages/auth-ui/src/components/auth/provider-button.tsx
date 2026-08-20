"use client";

import { useIsMutating } from "@tanstack/react-query";
import { useGoogleOneTapPending } from "@workspace/auth-ui/context/google-one-tap-pending";
import { useAuthRedirectTo } from "@workspace/auth-ui/hooks/use-auth-redirect-to";
import {
  authMutationKeys,
  getProviderName,
} from "@workspace/auth-ui/lib/auth-core";
import {
  providerIcons,
  useAuth,
  useSignInSocial,
} from "@workspace/auth-ui/lib/auth-react";
import { Badge } from "@workspace/ui/components/ui/badge";
import { Button } from "@workspace/ui/components/ui/button";
import { Spinner } from "@workspace/ui/components/ui/spinner";
import { cn } from "@workspace/ui/lib/utils";
import type { SocialProvider } from "better-auth/social-providers";
import Image from "next/image";
import { type ComponentProps, useEffect, useState } from "react";

const PROVIDER_LOGO: Partial<Record<SocialProvider, string>> = {
  google: "https://www.google.com/favicon.ico",
};

/**
 * Structural type for the optional `last-login-method` client plugin.
 * Not every consuming app installs it, so the check is feature-detected
 * at runtime rather than assumed on the generic `AuthClient` type.
 */
interface LastLoginMethodClient {
  isLastUsedLoginMethod?: (method: string) => boolean;
}

export type ProviderButtonProps = {
  provider: SocialProvider;
  display?: "full" | "name" | "icon";
  showLastUsedBadge?: boolean;
  showProviderLogo?: boolean;
} & Omit<ComponentProps<typeof Button>, "onClick" | "children" | "disabled">;

/**
 * Social provider sign-in button.
 *
 * @param provider - Provider to sign in with.
 * @param display - `"full"` (e.g. "Continue with Google"), `"name"` (just the provider name), or `"icon"` (icon only).
 */
export function ProviderButton({
  provider,
  display = "full",
  showLastUsedBadge = false,
  showProviderLogo = false,
  variant = "outline",
  ...props
}: ProviderButtonProps) {
  const { authClient, baseURL, localization } = useAuth();
  const redirectTo = useAuthRedirectTo();
  const isOneTapPending = useGoogleOneTapPending();

  const callbackURL = `${baseURL}${redirectTo}`;

  const { mutate: signInSocial, isPending: signInSocialPending } =
    useSignInSocial(authClient);

  const ProviderIcon = providerIcons[provider];
  const providerLogo = PROVIDER_LOGO[provider];

  // Deferred to an effect (rather than read during render) so the server-
  // rendered markup — which has no cookie access — matches the client's
  // first paint; the badge then appears once hydration settles.
  const [isLastUsed, setIsLastUsed] = useState(false);

  useEffect(() => {
    if (!showLastUsedBadge) {
      return;
    }

    const isLastUsedLoginMethod = (authClient as LastLoginMethodClient)
      .isLastUsedLoginMethod;

    setIsLastUsed(isLastUsedLoginMethod?.(provider) ?? false);
  }, [authClient, provider, showLastUsedBadge]);

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all,
  });
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all,
  });
  const isPending = signInMutating + signUpMutating > 0 || isOneTapPending;

  const renderIcon = () => {
    if (signInSocialPending || isOneTapPending) {
      return <Spinner />;
    }

    if (showProviderLogo && providerLogo) {
      return (
        <Image
          alt={`${getProviderName(provider)} logo`}
          className="size-4 shrink-0"
          height={20}
          src={providerLogo}
          unoptimized
          width={20}
        />
      );
    }

    return <ProviderIcon />;
  };

  let label: string | null = null;

  if (display === "full") {
    label = localization.auth.continueWith.replace(
      "{{provider}}",
      getProviderName(provider)
    );
  } else if (display === "name") {
    label = getProviderName(provider);
  }

  // aria-label overrides all descendant text for the accessible name, so the
  // "last used" hint has to be folded into it — otherwise assistive tech
  // never hears it even though the Badge renders it visually.
  const accessibleLabel = isLastUsed
    ? `${getProviderName(provider)} (last used)`
    : getProviderName(provider);

  return (
    <Button
      disabled={isPending}
      onClick={() => signInSocial({ provider, callbackURL })}
      type="button"
      variant={variant}
      {...props}
      aria-label={accessibleLabel}
      className={cn("relative", props.className)}
    >
      {renderIcon()}

      {label}

      {isLastUsed ? (
        <Badge
          className="absolute -top-2 -right-2 border-black/10 bg-white text-black/70 shadow-sm dark:border-white/10 dark:bg-neutral-800 dark:text-white/70"
          variant="outline"
        >
          Last used
        </Badge>
      ) : null}
    </Button>
  );
}
