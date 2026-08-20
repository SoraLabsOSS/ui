"use client";

import type { SettingsView } from "@workspace/auth-ui/lib/auth-core";
import { useAuth, useAuthenticate } from "@workspace/auth-ui/lib/auth-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/ui/tabs";
import { cn } from "@workspace/ui/lib/utils";
import { Shield, User2 } from "lucide-react";
import { useMemo } from "react";
import { AccountSettings } from "./account/account-settings";
import { SecuritySettings } from "./security/security-settings";

export interface SettingsProps {
  className?: string;
  hideNav?: boolean;
  path?: string;
  /** @remarks `SettingsView` */
  view?: SettingsView;
}

/**
 * Renders the settings UI and activates the appropriate settings view based on `view` or `path`.
 *
 * @param className - Additional CSS class names applied to the root container
 * @param path - Route path used to resolve which settings view to activate when `view` is not provided
 * @param view - Explicit settings view to activate (for example, `"account"` or `"security"`)
 * @param hideNav - When `true`, hides the settings navigation tabs
 * @returns A JSX element rendering the settings layout and the selected settings panel
 */
export function Settings({ className, view, path, hideNav }: SettingsProps) {
  const { authClient, basePaths, localization, viewPaths, plugins, Link } =
    useAuth();
  useAuthenticate(authClient);

  if (!(view || path)) {
    throw new Error(
      "[Better Auth UI] Either `view` or `path` must be provided"
    );
  }

  const currentView = useMemo(() => {
    if (view) {
      return view;
    }
    if (!path) {
      return;
    }

    const match = [
      viewPaths.settings,
      ...plugins.map((plugin) => plugin.viewPaths?.settings),
    ]
      .flatMap((source) => Object.entries(source ?? {}))
      .find(([, segment]) => segment === path);

    return match?.[0] as SettingsView | undefined;
  }, [view, path, viewPaths.settings, plugins]);

  if (!currentView) {
    const validPaths = [
      viewPaths.settings,
      ...plugins.map((plugin) => plugin.viewPaths?.settings),
    ]
      .flatMap((source) => Object.values(source ?? {}))
      .join(", ");
    throw new Error(
      `[Better Auth UI] Unknown settings path "${path}". Valid paths are: ${validPaths}`
    );
  }

  return (
    <Tabs
      className={cn("w-full gap-4 md:gap-6", className)}
      value={currentView}
    >
      <div className={cn(hideNav && "hidden")}>
        <TabsList aria-label={localization.settings.settings}>
          <TabsTrigger asChild value="account">
            <Link
              className="gap-1"
              href={`${basePaths.settings}/${viewPaths.settings.account}`}
            >
              <User2 className="text-muted-foreground" />

              {localization.settings.account}
            </Link>
          </TabsTrigger>

          <TabsTrigger asChild value="security">
            <Link
              className="gap-1"
              href={`${basePaths.settings}/${viewPaths.settings.security}`}
            >
              <Shield className="text-muted-foreground" />

              {localization.settings.security}
            </Link>
          </TabsTrigger>

          {plugins.flatMap(
            (plugin) =>
              plugin.settingsTabs?.map((settingsTab, index) => (
                <TabsTrigger
                  asChild
                  key={`${plugin.id}-${index.toString()}`}
                  value={settingsTab.view}
                >
                  <Link
                    className="gap-1"
                    href={`${basePaths.settings}/${plugin.viewPaths?.settings?.[settingsTab.view]}`}
                  >
                    {settingsTab.label}
                  </Link>
                </TabsTrigger>
              )) ?? []
          )}
        </TabsList>
      </div>

      <TabsContent tabIndex={-1} value="account">
        <AccountSettings />
      </TabsContent>

      <TabsContent tabIndex={-1} value="security">
        <SecuritySettings />
      </TabsContent>

      {plugins.flatMap((plugin) =>
        plugin.settingsTabs?.map((settingsTab, index) => (
          <TabsContent
            key={`${plugin.id}-${index.toString()}`}
            tabIndex={-1}
            value={settingsTab.view}
          >
            <settingsTab.component />
          </TabsContent>
        ))
      )}
    </Tabs>
  );
}
