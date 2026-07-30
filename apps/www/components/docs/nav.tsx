"use client";

import { useSession } from "@better-auth-ui/react";
import { UserButton } from "@workspace/auth-ui/components/auth/user/user-button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@workspace/ui/components/ui/navigation-menu";
import { ProgressiveBlur } from "@workspace/ui/components/ui/progressive-blur";
import { cn } from "@workspace/ui/lib/utils";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { Navbar } from "fumadocs-ui/layouts/docs-client";
import { useSidebar } from "fumadocs-ui/provider";
import { ArrowUpRight, Bookmark, Menu } from "lucide-react";
import Link from "next/link";
import {
  AUTH_MENU_LINKS,
  AuthNavMenuSkeleton,
} from "@/components/auth/auth-menu-skeletons";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import { useAuthNavPending } from "@/hooks/use-auth-nav-pending";
import { useBookmarkLoginDialog } from "@/hooks/use-bookmark-login-dialog";
import { authClient } from "@/lib/auth-client";
import { SkeletonTransition } from "@/registry/primitives/effects/skeleton";
import { ThemeSwitcher } from "../animate/theme-switcher";
import { IconLogo } from "../icon-logo";

const DOCS_GUIDE_URL = "/docs";
export interface NavProps {
  /** First primitive doc from Fumadocs root folders (meta.json root flag). */
  primitivesUrl: string;
}

interface NavItem {
  title: string;
  url: string;
}

const BASE_NAV_ITEMS: NavItem[] = [{ title: "Docs", url: DOCS_GUIDE_URL }];

const RESOURCE_NAV_ITEMS: NavItem[] = [{ title: "Blog", url: "/blog" }];

interface LibraryNavItem extends NavItem {
  description: string;
}

const LIBRARY_NAV_ITEMS = (primitivesUrl: string): LibraryNavItem[] => [
  {
    title: "Primitives",
    url: primitivesUrl,
    description: "Unstyled, animated building blocks powered by Motion.",
  },
  {
    title: "Components",
    url: "/components",
    description: "Fully-assembled examples built from primitives.",
  },
  {
    title: "Icons",
    url: "/docs/icons",
    description: "Animated icons with hover, tap, and view triggers.",
  },
];

const NAV_LINK_CLASS = cn(
  "h-8 justify-center rounded-md bg-transparent px-3 py-0 font-normal text-neutral-700 text-sm transition-colors duration-200 ease-in-out hover:bg-accent hover:text-black focus:bg-accent dark:text-neutral-200 dark:hover:text-white",
  "data-[active=true]:text-black dark:data-[active=true]:text-white"
);

const HEADER_AUTH_NAV_ITEMS = AUTH_MENU_LINKS.filter(
  (item) => item.title !== "Settings"
);

function LibraryMenuContent({
  libraryItems,
}: {
  libraryItems: LibraryNavItem[];
}) {
  return (
    <div className="flex w-[480px] gap-2">
      <NavigationMenuLink
        asChild
        className="w-[180px] shrink-0 bg-muted/60 p-3 hover:bg-muted focus:bg-muted"
      >
        <Link href={DOCS_GUIDE_URL}>
          <span className="flex size-9 items-center justify-center rounded-md border bg-background">
            <IconLogo size="sm" />
          </span>
          <span className="mt-8 font-medium text-sm">Sora UI</span>
          <span className="mt-1 text-muted-foreground text-xs leading-relaxed">
            Fully animated, open-source component distribution.
          </span>
        </Link>
      </NavigationMenuLink>
      <div className="grid flex-1 grid-cols-2 content-start gap-1">
        {libraryItems.map((item) => (
          <NavigationMenuLink asChild className="gap-1 p-3" key={item.title}>
            <Link href={item.url}>
              <span className="flex items-center justify-between font-medium text-sm">
                {item.title}
                <ArrowUpRight className="size-3.5 text-muted-foreground" />
              </span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                {item.description}
              </span>
            </Link>
          </NavigationMenuLink>
        ))}
      </div>
    </div>
  );
}

function NavMenuItems({
  hasSession,
  libraryItems,
  onRequireLogin,
  sessionPending,
}: {
  hasSession: boolean;
  libraryItems: LibraryNavItem[];
  onRequireLogin: (redirectUrl: string) => void;
  sessionPending: boolean;
}) {
  return (
    <>
      {BASE_NAV_ITEMS.map((item) => (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuLink asChild className={NAV_LINK_CLASS}>
            <Link href={item.url}>{item.title}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
      <NavigationMenuItem>
        <NavigationMenuTrigger
          className={cn(
            NAV_LINK_CLASS,
            "data-[state=open]:bg-accent data-[state=open]:text-black dark:data-[state=open]:text-white"
          )}
        >
          Library
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <LibraryMenuContent libraryItems={libraryItems} />
        </NavigationMenuContent>
      </NavigationMenuItem>
      {RESOURCE_NAV_ITEMS.map((item) => (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuLink asChild className={NAV_LINK_CLASS}>
            <Link href={item.url}>{item.title}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
      {HEADER_AUTH_NAV_ITEMS.map((item) => (
        <NavigationMenuItem key={item.title}>
          <SkeletonTransition
            loading={sessionPending}
            skeleton={<AuthNavMenuSkeleton width={item.skeletonWidth} />}
          >
            <NavigationMenuLink asChild className={NAV_LINK_CLASS}>
              <Link
                href={item.url}
                onClick={(event) => {
                  if (!hasSession) {
                    event.preventDefault();
                    onRequireLogin(item.url);
                  }
                }}
              >
                {item.title}
              </Link>
            </NavigationMenuLink>
          </SkeletonTransition>
        </NavigationMenuItem>
      ))}
    </>
  );
}

export const Nav = ({ primitivesUrl }: NavProps) => {
  const { setOpen } = useSidebar();
  const { data: session } = useSession(authClient);
  const authNavPending = useAuthNavPending();
  const { loginDialog, openLoginDialog } = useBookmarkLoginDialog();
  const libraryItems = LIBRARY_NAV_ITEMS(primitivesUrl);

  return (
    <Navbar className="!bg-transparent !shadow-none !backdrop-blur-none z-30 h-14 overflow-visible border-b-0 px-(--fd-layout-offset) transition-none md:h-17">
      <ProgressiveBlur
        backgroundColor="var(--background)"
        blurAmount="12px"
        height="150%"
        // maskFadeStart="45%"
        position="top"
      />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-(--fd-layout-width) items-center gap-3 px-3 md:px-5">
        <Link
          className={buttonVariants({
            color: "ghost",
            size: "icon-sm",
            className:
              "size-8! p-0! transition-colors duration-200 ease-in-out [&_svg]:size-7!",
          })}
          href="/"
        >
          <IconLogo size="sm" />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2 md:justify-between">
          <div className="hidden items-center gap-1 md:flex">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="gap-0 bg-transparent">
                <NavMenuItems
                  hasSession={Boolean(session)}
                  libraryItems={libraryItems}
                  onRequireLogin={openLoginDialog}
                  sessionPending={authNavPending}
                />
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-2 md:gap-3">
            <CommandPaletteTrigger />

            <UserButton
              align="end"
              className={cn(
                "text-fd-muted-foreground",
                "max-md:!size-7 max-md:rounded-full max-md:p-0",
                "max-md:[&_[data-slot=avatar]]:!size-7",
                "max-md:[&_.rounded-full]:!size-7",
                "max-md:[&_svg]:!size-4"
              )}
              links={[
                {
                  label: "Bookmark",
                  href: "/bookmark",
                  icon: <Bookmark />,
                  visibility: "authenticated",
                },
              ]}
              size="icon"
              triggerSize="icon-xs"
            />

            <ThemeSwitcher className="max-md:hidden" />

            <button
              aria-label="Open menu"
              className={cn(
                buttonVariants({
                  color: "ghost",
                  size: "icon-sm",
                  className:
                    "relative z-10 size-8! shrink-0 text-fd-muted-foreground md:hidden [&_svg]:size-5!",
                })
              )}
              onClick={() => setOpen((prev) => !prev)}
              type="button"
            >
              <Menu />
            </button>
          </div>
        </div>
      </div>
      {loginDialog}
    </Navbar>
  );
};
