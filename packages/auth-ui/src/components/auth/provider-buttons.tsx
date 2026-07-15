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
  containerClassName?: string;
  display?: "full" | "name" | "icon";
  showLastUsedBadge?: boolean;
  showProviderLogo?: boolean;
  socialLayout?: SocialLayout;
}

export type SocialLayout = "auto" | "horizontal" | "vertical" | "grid";

function displayForLayout(
  socialLayout: Exclude<SocialLayout, "auto">
): "full" | "name" | "icon" {
  if (socialLayout === "vertical") {
    return "full";
  }

  if (socialLayout === "grid") {
    return "name";
  }

  return "icon";
}

/**
 * Render sign-in buttons for configured social providers. Each button owns its own sign-in mutation
 * and reads the shared sign-in pending state from React Query.
 *
 * @param socialLayout - Preferred layout for the provider buttons; `"auto"` chooses based on the number of providers.
 * @param display - Overrides the label style that would otherwise be inferred from `socialLayout`.
 */
export function ProviderButtons({
  socialLayout = "auto",
  buttonVariant,
  buttonClassName,
  containerClassName,
  display,
  showLastUsedBadge = false,
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

  const resolvedDisplay = display ?? displayForLayout(resolvedSocialLayout);

  return (
    <div
      className={cn(
        "gap-3",
        resolvedSocialLayout === "grid" && "grid grid-cols-2",
        resolvedSocialLayout === "vertical" && "flex flex-col",
        resolvedSocialLayout === "horizontal" && "flex flex-row flex-wrap",
        containerClassName
      )}
    >
      {socialProviders?.map((provider) => (
        <ProviderButton
          className={cn(
            resolvedSocialLayout === "horizontal" && "flex-1",
            buttonClassName
          )}
          display={resolvedDisplay}
          key={provider}
          provider={provider}
          showLastUsedBadge={showLastUsedBadge}
          showProviderLogo={showProviderLogo}
          variant={buttonVariant}
        />
      ))}
    </div>
  );
}
