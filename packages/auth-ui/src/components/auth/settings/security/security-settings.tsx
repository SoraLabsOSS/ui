"use client";

import { useAuth } from "@workspace/auth-ui/lib/auth-react";
import { cn } from "@workspace/ui/lib/utils";
import { ActiveSessions } from "./active-sessions";
import { LinkedAccounts } from "./linked-accounts";

export interface SecuritySettingsProps {
  className?: string;
}

/**
 * Security settings: linked OAuth accounts, active sessions, and plugin cards.
 */
export function SecuritySettings({ className }: SecuritySettingsProps) {
  const { plugins, socialProviders } = useAuth();

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className)}>
      {!!socialProviders?.length && <LinkedAccounts />}
      <ActiveSessions />
      {plugins.flatMap(
        (plugin) =>
          plugin.securityCards?.map((Card, index) => (
            <Card key={`${plugin.id}-${index.toString()}`} />
          )) ?? []
      )}
    </div>
  );
}
