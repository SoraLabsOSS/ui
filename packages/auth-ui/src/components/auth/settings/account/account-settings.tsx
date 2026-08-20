"use client";

import { useAuth } from "@workspace/auth-ui/lib/auth-react";
import { cn } from "@workspace/ui/lib/utils";
import type { ComponentProps } from "react";
import { UserProfile } from "./user-profile";

export interface AccountSettingsProps {
  className?: string;
}

/**
 * Account settings: display name and plugin-contributed cards.
 */
export function AccountSettings({
  className,
  ...props
}: AccountSettingsProps & ComponentProps<"div">) {
  const { plugins } = useAuth();

  return (
    <div
      className={cn("flex w-full flex-col gap-4 md:gap-6", className)}
      {...props}
    >
      <UserProfile />
      {plugins.flatMap(
        (plugin) =>
          plugin.accountCards?.map((Card, index) => (
            <Card key={`${plugin.id}-${index.toString()}`} />
          )) ?? []
      )}
    </div>
  );
}
