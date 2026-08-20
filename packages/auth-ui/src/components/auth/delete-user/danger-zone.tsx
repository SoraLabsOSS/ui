"use client";

import { useAuth } from "@workspace/auth-ui/lib/auth-react";
import { cn } from "@workspace/ui/lib/utils";
import type { ComponentProps } from "react";
import { DeleteAccount } from "./delete-account";

export interface DangerZoneProps {
  className?: string;
}

/**
 * Renders the danger zone heading and {@link DeleteAccount}.
 * Registered as a `securityCard` by `deleteUserPlugin()`; gate by registering the plugin.
 */
export function DangerZone({
  className,
  ...props
}: DangerZoneProps & Omit<ComponentProps<"div">, "children" | "className">) {
  const { localization } = useAuth();

  return (
    <div className={cn("flex w-full flex-col", className)} {...props}>
      <h2 className="mb-3 font-semibold text-destructive text-sm">
        {localization.settings.dangerZone}
      </h2>

      <DeleteAccount />
    </div>
  );
}
