"use client";

import { useAuth } from "@better-auth-ui/react";
import type { Button } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { ProviderButton } from "./provider-button";

export interface ProviderButtonsProps {
  buttonClassName?: string;
  buttonVariant?: ComponentProps<typeof Button>["variant"];
  showProviderLogo?: boolean;
  socialLayout?: SocialLayout;
}

export type SocialLayout = "auto" | "horizontal" | "vertical" | "grid";

/**
 * Render sign-in buttons for configured social providers. Each button owns its own sign-in mutation
 * and reads the shared sign-in pending state from React Query.
 *
 * @param socialLayout - Preferred layout for the provider buttons; `"auto"` chooses based on the number of providers.
 */
export function ProviderButtons({
  socialLayout = "auto",
  buttonVariant,
  buttonClassName,
  showProviderLogo = false,
}: ProviderButtonsProps) {
  const { socialProviders } = useAuth();

  const resolvedSocialLayout = useMemo(() => {
    if (socialLayout === "auto") {
      if (socialProviders?.length && socialProviders.length >= 4) {
        return "horizontal";
      }

      return "vertical";
    }

    return socialLayout;
  }, [socialLayout, socialProviders?.length]);

  return (
    <div
      className={cn(
        "gap-3",
        resolvedSocialLayout === "grid" && "grid grid-cols-2",
        resolvedSocialLayout === "vertical" && "flex flex-col",
        resolvedSocialLayout === "horizontal" && "flex flex-row flex-wrap"
      )}
    >
      {socialProviders?.map((provider) => (
        <ProviderButton
          className={cn(
            resolvedSocialLayout === "horizontal" && "flex-1",
            buttonClassName
          )}
          display={
            resolvedSocialLayout === "vertical"
              ? "full"
              : resolvedSocialLayout === "grid"
                ? "name"
                : "icon"
          }
          key={provider}
          provider={provider}
          showProviderLogo={showProviderLogo}
          variant={buttonVariant}
        />
      ))}
    </div>
  );
}
