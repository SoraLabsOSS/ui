"use client";

import { useAuth, useSession } from "@workspace/auth-ui/lib/auth-react";
import { Button } from "@workspace/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/ui/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/ui/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import type { User } from "better-auth";
import { ChevronsUpDown, LogIn, LogOut, Settings, User2 } from "lucide-react";
import {
  type ComponentType,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useClientMounted } from "../../../hooks/use-client-mounted";
import { UserAvatar } from "./user-avatar";
import { UserView } from "./user-view";

/** Auth states a `UserButton` link can be visible in. */
export type UserButtonLinkVisibility =
  | "authenticated"
  | "unauthenticated"
  | "always";

/** A simple link entry rendered as a `DropdownMenuItem` in the `UserButton` menu. */
export interface UserButtonLink {
  /** Destination URL. */
  href: string;
  /** Optional leading icon. Sized/coloured to match built-in items. */
  icon?: ReactNode;
  /** Visible label. */
  label: ReactNode;
  /** Forwarded to the underlying `DropdownMenuItem`. */
  variant?: "default" | "destructive";
  /**
   * When this link is visible based on auth state.
   * @default "always"
   */
  visibility?: UserButtonLinkVisibility;
}

export interface UserButtonProps {
  align?: "center" | "end" | "start" | undefined;
  className?: string;
  /** Hide the built-in "Settings" link. Useful when replacing it via `links`. */
  hideSettings?: boolean;
  /** Additional menu entries rendered above the built-in items. */
  links?: (UserButtonLink | ReactElement)[];
  sideOffset?: number;
  size?: "default" | "icon";
  /** Icon trigger footprint. `icon-xs` is 32px with a 20px avatar; `icon-sm` is 36px with a 24px avatar. */
  triggerSize?: "icon-xs" | "icon-sm";
  variant?:
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | "secondary";
}

function renderUserLink(
  link: UserButtonLink | ReactElement,
  Link: ComponentType<{ href: string; children?: ReactNode }>,
  fallbackKey: string
): ReactNode {
  if (isValidElement(link)) {
    return link;
  }

  const { label, href, icon, variant } = link;
  return (
    <DropdownMenuItem asChild key={fallbackKey} variant={variant}>
      <Link href={href}>
        {icon}
        {label}
      </Link>
    </DropdownMenuItem>
  );
}

function renderIconTriggerContent({
  iconClass,
  sessionUser,
  showAuthenticated,
  showLoading,
}: {
  iconClass: string;
  sessionUser: User | undefined;
  showAuthenticated: boolean;
  showLoading: boolean;
}) {
  if (showLoading) {
    return <Skeleton className={cn(iconClass, "rounded-full")} />;
  }

  if (showAuthenticated && sessionUser) {
    return <UserAvatar className={iconClass} user={sessionUser} />;
  }

  return <User2 className={iconClass} />;
}

function renderDefaultTriggerContent({
  accountLabel,
  showAuthenticated,
  showLoading,
}: {
  accountLabel: ReactNode;
  showAuthenticated: boolean;
  showLoading: boolean;
}) {
  if (showLoading) {
    return <UserView isPending />;
  }

  if (showAuthenticated) {
    return <UserView />;
  }

  return (
    <>
      <UserAvatar />

      <div className="grid flex-1 text-left text-sm leading-tight">
        {accountLabel}
      </div>
    </>
  );
}

/**
 * Render a user dropdown button that shows user info, settings, theme controls, and authentication actions.
 *
 * Includes user profile, settings link, and sign-in/sign-out actions.
 *
 * @param className - Additional CSS classes applied to the button trigger
 * @param align - Alignment of the dropdown menu relative to the trigger
 * @param sideOffset - Offset between the trigger and the dropdown menu
 * @param size - "icon" renders only the avatar; "default" renders a full button with label and chevron
 * @param variant - Visual variant of the trigger button
 * @param links - Additional menu entries rendered above the built-in items
 * @param hideSettings - Hide the built-in "Settings" link
 * @returns The dropdown menu component with user actions
 */
export function UserButton({
  className,
  align,
  sideOffset,
  size = "default",
  triggerSize = "icon-sm",
  variant = "ghost",
  links,
  hideSettings = false,
}: UserButtonProps) {
  const { authClient, basePaths, viewPaths, localization, plugins, Link } =
    useAuth();

  const { data: session, isPending: sessionPending } = useSession(authClient);

  const userLinks = links?.flatMap((link, index) => {
    if (!isValidElement(link)) {
      const visibility = link.visibility ?? "always";
      if (visibility === "authenticated" && !session) {
        return [];
      }
      if (visibility === "unauthenticated" && session) {
        return [];
      }
    }
    return [renderUserLink(link, Link, `user-button-link-${index.toString()}`)];
  });

  const mounted = useClientMounted();
  const showIconTriggerLoading = !mounted || sessionPending;
  const showAuthenticatedTrigger = mounted && Boolean(session);
  const triggerIconSizes =
    triggerSize === "icon-xs"
      ? { avatar: "size-5", guest: "size-5", fillTrigger: false }
      : { avatar: "size-6", guest: "size-6", fillTrigger: false };
  const triggerIconClass =
    showIconTriggerLoading || showAuthenticatedTrigger
      ? triggerIconSizes.avatar
      : triggerIconSizes.guest;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {size === "icon" ? (
          <Button
            aria-label={
              showAuthenticatedTrigger
                ? localization.auth.account
                : localization.auth.signIn
            }
            className={cn(
              className,
              showAuthenticatedTrigger && "rounded-full",
              showAuthenticatedTrigger && triggerIconSizes.fillTrigger && "p-0"
            )}
            size={triggerSize}
            variant={variant}
          >
            {renderIconTriggerContent({
              iconClass: triggerIconClass,
              sessionUser: session?.user,
              showAuthenticated: showAuthenticatedTrigger,
              showLoading: showIconTriggerLoading,
            })}
          </Button>
        ) : (
          <Button
            className={cn("h-auto py-2.5 font-normal", className)}
            size="lg"
            variant={variant}
          >
            {renderDefaultTriggerContent({
              accountLabel: localization.auth.account,
              showAuthenticated: showAuthenticatedTrigger,
              showLoading: showIconTriggerLoading,
            })}

            <ChevronsUpDown className="ml-auto size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className="w-[--radix-dropdown-menu-trigger-width] min-w-40 max-w-[48svw] md:min-w-56"
        onCloseAutoFocus={(e) => e.preventDefault()}
        sideOffset={sideOffset}
      >
        {session && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal text-sm">
                <UserView />
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
          </>
        )}

        {session ? (
          <>
            {userLinks}

            {!hideSettings && (
              <DropdownMenuItem asChild>
                <Link
                  href={`${basePaths.settings}/${viewPaths.settings.account}`}
                >
                  <Settings className="text-muted-foreground" />

                  {localization.settings.settings}
                </Link>
              </DropdownMenuItem>
            )}

            {plugins.flatMap((plugin) =>
              plugin.userMenuItems?.map((Item, index) => (
                <Item key={`${plugin.id}-${index.toString()}`} />
              ))
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={`${basePaths.auth}/${viewPaths.auth.signOut}`}>
                <LogOut className="text-muted-foreground" />

                {localization.auth.signOut}
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {userLinks}

            <DropdownMenuItem asChild>
              <Link href={`${basePaths.auth}/${viewPaths.auth.signIn}`}>
                <LogIn className="text-muted-foreground" />

                {localization.auth.signIn}
              </Link>
            </DropdownMenuItem>

            {plugins.flatMap((plugin) =>
              plugin.userMenuItems?.map((Item, index) => (
                <Item key={`${plugin.id}-${index.toString()}`} />
              ))
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
