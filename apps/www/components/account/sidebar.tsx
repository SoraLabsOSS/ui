"use client";

import { useSession } from "@workspace/auth-ui/lib/auth-react";
import {
  Sidebar001,
  Sidebar001Content,
  Sidebar001Footer,
  Sidebar001Header,
  Sidebar001Item,
  Sidebar001Section,
  useSidebar001Hover,
} from "@workspace/ui/components/unlumen-ui/sidebar-001";
import { cn } from "@workspace/ui/lib/utils";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import type { LinkItemType, MainItemType } from "fumadocs-ui/layouts/links";
import { BaseLinkItem } from "fumadocs-ui/layouts/links";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { getLinks } from "fumadocs-ui/layouts/shared";
import { useSidebar } from "fumadocs-ui/provider";
import { isActive } from "fumadocs-ui/utils/is-active";
import { SquareMenu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { ThemeSwitcher } from "@/components/animate/theme-switcher";
import {
  AUTH_MENU_LINKS,
  AuthSidebarMenuSkeleton,
} from "@/components/auth/auth-menu-skeletons";
import { DocsMobileDrawer } from "@/components/docs-sidebar/mobile-drawer";
import {
  DocsReleaseDatesProvider,
  useDocsPageNew,
} from "@/components/docs-sidebar/release-dates-context";
import { closeMobileSidebar } from "@/components/docs-sidebar/sidebar-close-lock";
import { useDismissMobileSidebarOnOutside } from "@/components/docs-sidebar/use-dismiss-mobile-sidebar";
import { IconLogo } from "@/components/icon-logo";
import { useAuthNavPending } from "@/hooks/use-auth-nav-pending";
import { useBookmarkLoginDialog } from "@/hooks/use-bookmark-login-dialog";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/lib/docs/attach-separator";
import { isIconsNavItemActive } from "@/lib/docs/icons-nav-active";
import {
  isPrimitivesNavItemActive,
  MENU_PRIMITIVES_ITEM_KEY,
} from "@/lib/docs/primitive-nav-active";
import { isUiNavItemActive } from "@/lib/ui/ui-nav-active";
import { SkeletonTransition } from "@/registry/primitives/effects/skeleton";

type GuideLinkItem = MainItemType;

function isGuideLink(item: LinkItemType): item is GuideLinkItem {
  return (
    (item.type === undefined || item.type === "main") &&
    "url" in item &&
    typeof item.url === "string" &&
    "text" in item
  );
}

interface GuideSeparatorItem {
  icon?: ReactNode;
  name: string;
  type: "separator";
}

function isGuideSeparator(item: LinkItemType): boolean {
  return (item as { type?: string }).type === "separator";
}

function AccountGuideLink({
  item,
  onNavigate,
}: {
  item: GuideLinkItem;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const isNew = useDocsPageNew(item.url);

  return (
    <Sidebar001Item
      href={item.url}
      isActive={isActive(item.url, pathname, false)}
      isNew={isNew || Boolean((item as { new?: boolean }).new)}
      label={item.text}
      onClick={onNavigate}
    />
  );
}

const ACCOUNT_MENU_ITEMS = [
  {
    getHref: (primitivesUrl: string) => primitivesUrl,
    getIsActive: (pathname: string, href: string) =>
      isPrimitivesNavItemActive(pathname, href),
    label: "Motion",
    requiresAuth: false,
  },
  {
    getHref: () => "/docs/icons",
    getIsActive: (pathname: string, href: string) =>
      isIconsNavItemActive(pathname, href),
    label: "Icons",
    requiresAuth: false,
  },
  {
    getHref: () => "/ui",
    getIsActive: (pathname: string, href: string) =>
      isUiNavItemActive(pathname, href),
    label: "UI",
    requiresAuth: false,
  },
  {
    getHref: () => "/catalog",
    getIsActive: (pathname: string, href: string) =>
      pathname === href || pathname.startsWith(`${href}/`),
    label: "Catalog",
    requiresAuth: false,
  },
  {
    getHref: () => "/blog",
    getIsActive: (pathname: string, href: string) =>
      pathname === href || pathname.startsWith(`${href}/`),
    label: "Blog",
    requiresAuth: false,
  },
  ...AUTH_MENU_LINKS.map((link) => ({
    getHref: (_primitivesUrl: string) => link.url,
    getIsActive: (pathname: string, href: string) =>
      link.title === "Settings"
        ? pathname.startsWith("/settings")
        : pathname === href || pathname.startsWith(`${href}/`),
    label: link.title,
    requiresAuth: true as const,
    skeletonWidth: link.skeletonWidth,
  })),
] as const;

function AccountMenuSection({
  onNavigate,
  primitivesUrl,
}: {
  onNavigate: () => void;
  primitivesUrl: string;
}) {
  const pathname = usePathname();
  const { data: session } = useSession(authClient);
  const authNavPending = useAuthNavPending();
  const { loginDialog, openLoginDialog } = useBookmarkLoginDialog();
  const { setHovered } = useSidebar001Hover();
  const publicItems = ACCOUNT_MENU_ITEMS.filter((item) => !item.requiresAuth);
  const authItems = ACCOUNT_MENU_ITEMS.filter((item) => item.requiresAuth);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset hover on auth state change
  useEffect(() => {
    setHovered(null);
  }, [authNavPending, setHovered]);

  return (
    <Sidebar001Section
      className="mt-4"
      label={<Separator icon={<SquareMenu strokeWidth={2} />} name="Menu" />}
    >
      {publicItems.map((item) => {
        const href = item.getHref(primitivesUrl);
        return (
          <Sidebar001Item
            href={href}
            isActive={item.getIsActive(pathname, href)}
            itemKey={
              item.label === "Motion" ? MENU_PRIMITIVES_ITEM_KEY : undefined
            }
            key={item.label}
            label={item.label}
            onClick={onNavigate}
          />
        );
      })}
      {authItems.map((item) => {
        const href = item.getHref(primitivesUrl);

        return (
          <SkeletonTransition
            key={item.label}
            loading={authNavPending}
            skeleton={<AuthSidebarMenuSkeleton width={item.skeletonWidth} />}
          >
            <Sidebar001Item
              href={href}
              isActive={item.getIsActive(pathname, href)}
              label={item.label}
              onClick={(event) => {
                if (!session) {
                  event.preventDefault();
                  openLoginDialog(href);
                  return;
                }
                onNavigate();
              }}
            />
          </SkeletonTransition>
        );
      })}
      {loginDialog}
    </Sidebar001Section>
  );
}

export interface AccountSidebarProps extends BaseLayoutProps {
  componentsUrl: string;
  releaseDatesByUrl?: Record<string, string>;
}

export function AccountSidebar({
  links = [],
  githubUrl,
  componentsUrl,
  releaseDatesByUrl = {},
}: AccountSidebarProps) {
  const { setOpen } = useSidebar();
  const resolvedLinks = getLinks(links, githubUrl);
  const iconLinks = resolvedLinks.filter((link) => link.type === "icon");
  const navLinks = resolvedLinks.filter((link) => link.type !== "icon");
  const guideSeparator = navLinks.find(isGuideSeparator) as
    | GuideSeparatorItem
    | undefined;
  const guideItems = navLinks.filter(isGuideLink);

  useDismissMobileSidebarOnOutside();

  const closeMobile = () => {
    closeMobileSidebar(setOpen);
  };

  return (
    <DocsReleaseDatesProvider releaseDatesByUrl={releaseDatesByUrl}>
      <DocsMobileDrawer label="Account Navigation">
        <Sidebar001
          className="min-h-0 w-full max-md:max-w-full"
          defaultWidth={380}
          maxWidth={380}
          minWidth={180}
        >
          <Sidebar001Header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
            <Link
              aria-label="Sora UI home"
              className="flex items-center gap-2 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
              href="/"
            >
              <IconLogo size="sm" />
              <span className="font-semibold text-sm">Sora UI</span>
            </Link>
            <button
              aria-label="Close menu"
              className={cn(
                buttonVariants({
                  color: "ghost",
                  size: "icon-sm",
                  className: "!size-8 [&_svg]:!size-5 text-fd-muted-foreground",
                })
              )}
              onClick={closeMobile}
              type="button"
            >
              <X />
            </button>
          </Sidebar001Header>

          <Sidebar001Content className="min-h-0 px-3 max-md:pt-2 md:pb-4">
            <Sidebar001Section
              label={
                guideSeparator ? (
                  <Separator
                    icon={guideSeparator.icon}
                    name={guideSeparator.name}
                  />
                ) : (
                  "Guide"
                )
              }
            >
              {guideItems.map((link) => (
                <AccountGuideLink
                  item={link}
                  key={link.url}
                  onNavigate={closeMobile}
                />
              ))}
            </Sidebar001Section>
            <AccountMenuSection
              onNavigate={closeMobile}
              primitivesUrl={componentsUrl}
            />
          </Sidebar001Content>

          <Sidebar001Footer>
            <div className="flex items-center justify-end gap-1">
              {iconLinks.map((link) => (
                <BaseLinkItem
                  aria-label={link.label}
                  className={cn(
                    buttonVariants({ size: "icon", color: "ghost" }),
                    "text-fd-muted-foreground md:[&_svg]:size-4.5"
                  )}
                  item={link}
                  key={link.url}
                >
                  {link.icon}
                </BaseLinkItem>
              ))}
              <ThemeSwitcher />
            </div>
          </Sidebar001Footer>
        </Sidebar001>
      </DocsMobileDrawer>
    </DocsReleaseDatesProvider>
  );
}
