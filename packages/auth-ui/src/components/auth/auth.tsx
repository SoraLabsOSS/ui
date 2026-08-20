"use client";

import type { AuthView } from "@workspace/auth-ui/lib/auth-core";
import { useAuth } from "@workspace/auth-ui/lib/auth-react";
import { type ComponentType, type ReactNode, useEffect } from "react";

import type { SocialLayout } from "./provider-buttons";
import { SignIn, type SignInVariant } from "./sign-in";
import { SignOut } from "./sign-out";

export interface AuthProps {
  className?: string;
  description?: ReactNode;
  path?: string;
  socialLayout?: SocialLayout;
  socialPosition?: "top" | "bottom";
  title?: ReactNode;
  variant?: SignInVariant;
  /** @remarks `AuthView` */
  view?: AuthView;
}

const AUTH_VIEWS: Record<AuthView, ComponentType<AuthProps>> = {
  signIn: SignIn,
  signOut: SignOut,
};

/**
 * Render sign-in or sign-out based on `view` or `path`.
 */
export function Auth({
  className,
  description,
  path,
  socialLayout,
  socialPosition,
  title,
  variant,
  view,
}: AuthProps) {
  const { basePaths, plugins, viewPaths, navigate } = useAuth();

  if (!(view || path)) {
    throw new Error(
      "[Better Auth UI] Either `view` or `path` must be provided"
    );
  }

  const authView =
    view ||
    (Object.keys(viewPaths.auth) as AuthView[]).find(
      (key) => viewPaths.auth[key] === path
    );

  const shouldRedirectToSignIn =
    authView && authView !== "signIn" && authView !== "signOut";

  useEffect(() => {
    if (shouldRedirectToSignIn) {
      navigate({
        to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
        replace: true,
      });
    }
  }, [shouldRedirectToSignIn, navigate, basePaths.auth, viewPaths.auth.signIn]);

  if (shouldRedirectToSignIn) {
    return null;
  }

  for (const plugin of plugins) {
    const pluginAuthPaths = plugin.viewPaths?.auth;

    const pluginView =
      view ??
      authView ??
      (pluginAuthPaths &&
        Object.keys(pluginAuthPaths).find(
          (key) => pluginAuthPaths[key] === path
        ));
    if (!pluginView) {
      continue;
    }

    const PluginView = plugin.views?.auth?.[pluginView];
    if (!PluginView) {
      continue;
    }

    return (
      <PluginView
        className={className}
        socialLayout={socialLayout}
        socialPosition={socialPosition}
      />
    );
  }

  const AuthViewComponent = authView ? AUTH_VIEWS[authView] : undefined;

  if (!AuthViewComponent) {
    throw new Error(
      `[Better Auth UI] Unknown view "${authView}". Valid views are: ${Object.keys(AUTH_VIEWS).join(", ")}`
    );
  }

  return (
    <AuthViewComponent
      className={className}
      description={description}
      socialLayout={socialLayout}
      socialPosition={socialPosition}
      title={title}
      variant={variant}
    />
  );
}
