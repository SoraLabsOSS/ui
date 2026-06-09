"use client";

import { getProviderName } from "@better-auth-ui/core";
import {
  providerIcons,
  useAccountInfo,
  useAuth,
  useLinkSocial,
  useUnlinkAccount,
} from "@better-auth-ui/react";
import { Button } from "@workspace/ui/components/ui/button";
import { Card, CardContent } from "@workspace/ui/components/ui/card";
import { Skeleton } from "@workspace/ui/components/ui/skeleton";
import { toast } from "@workspace/ui/components/ui/sonner";
import { Spinner } from "@workspace/ui/components/ui/spinner";
import { cn } from "@workspace/ui/lib/utils";
import type { Account, SocialProvider } from "better-auth";
import { Link2, Link2Off, Plug } from "lucide-react";

export type LinkedAccountProps = {
  account?: Account;
  provider: SocialProvider;
};

/**
 * Render a single linked social account row with provider info and link/unlink control.
 *
 * Fetches additional account information from the provider using the accountInfo API
 * and displays the provider name, account details, and a link/unlink button.
 *
 * @param account - The account object containing id, accountId, and providerId
 * @param provider - The provider id
 * @returns A JSX element containing the linked account row
 */
export function LinkedAccount({ account, provider }: LinkedAccountProps) {
  const { authClient, baseURL, localization } = useAuth();

  const { data: accountInfo, isPending: isLoadingInfo } = useAccountInfo(
    authClient,
    { query: { accountId: account?.accountId } }
  );

  const { mutate: linkSocial, isPending: isLinking } =
    useLinkSocial(authClient);

  const { mutate: unlinkAccount, isPending: isUnlinking } = useUnlinkAccount(
    authClient,
    {
      onSuccess: () => toast.success(localization.settings.accountUnlinked),
    }
  );

  const ProviderIcon = providerIcons[provider];
  const providerName = getProviderName(provider);

  const displayName =
    accountInfo?.data?.login ||
    accountInfo?.data?.username ||
    accountInfo?.user?.email ||
    accountInfo?.user?.name ||
    account?.accountId;

  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          {ProviderIcon ? (
            <ProviderIcon
              className={cn("size-4.5", !account && "opacity-50")}
            />
          ) : (
            <Plug className={cn("size-4.5", !account && "opacity-50")} />
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="font-medium text-sm leading-tight">
            {providerName}
          </span>

          {account && isLoadingInfo ? (
            <Skeleton className="my-0.5 h-3 w-24" />
          ) : (
            <span className="truncate text-muted-foreground text-xs">
              {account
                ? displayName
                : localization.settings.linkProvider.replace(
                    "{{provider}}",
                    providerName
                  )}
            </span>
          )}
        </div>

        {account ? (
          <Button
            aria-label={localization.settings.unlinkProvider.replace(
              "{{provider}}",
              providerName
            )}
            className="ml-auto shrink-0"
            disabled={isUnlinking}
            onClick={() => unlinkAccount({ providerId: account.providerId })}
            size="sm"
            variant="outline"
          >
            {isUnlinking ? <Spinner /> : <Link2Off />}
            {localization.settings.unlinkProvider
              .replace("{{provider}}", "")
              .trim()}
          </Button>
        ) : (
          <Button
            aria-label={localization.settings.linkProvider.replace(
              "{{provider}}",
              providerName
            )}
            className="ml-auto shrink-0"
            disabled={isLinking}
            onClick={() =>
              linkSocial({
                provider,
                callbackURL: `${baseURL}${window.location.pathname}`,
              })
            }
            size="sm"
            variant="outline"
          >
            {isLinking ? <Spinner /> : <Link2 />}
            {localization.settings.link}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
