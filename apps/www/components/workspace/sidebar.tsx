"use client";

import { useSession } from "@better-auth-ui/react";
import {
  Sidebar001,
  Sidebar001Content,
  Sidebar001Footer,
  Sidebar001Header,
  Sidebar001Item,
  Sidebar001Section,
} from "@workspace/ui/components/unlumen-ui/sidebar-001";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";
import { Sidebar } from "fumadocs-ui/components/layout/sidebar";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import type { LinkItemType, MainItemType } from "fumadocs-ui/layouts/links";
import { BaseLinkItem } from "fumadocs-ui/layouts/links";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { getLinks } from "fumadocs-ui/layouts/shared";
import { useSidebar } from "fumadocs-ui/provider";
import { isActive } from "fumadocs-ui/utils/is-active";
import { SquareMenu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeSwitcher } from "@/components/animate/theme-switcher";
import {
  DocsReleaseDatesProvider,
  useDocsPageNew,
} from "@/components/docs-sidebar/release-dates-context";
import { useDismissMobileSidebarOnOutside } from "@/components/docs-sidebar/use-dismiss-mobile-sidebar";
import { IconLogo } from "@/components/icon-logo";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/lib/docs/attach-separator";

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

function WorkspaceGuideLink({
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

const WORKSPACE_MENU_ITEMS = [
  {
    getHref: (componentsUrl: string) => componentsUrl,
    getIsActive: (pathname: string, href: string) =>
      pathname === href || pathname.startsWith(`${href}/`),
    label: "Components",
    requiresAuth: false,
  },
  {
    getHref: () => "/settings/account",
    getIsActive: (pathname: string) => pathname.startsWith("/settings"),
    label: "Settings",
    requiresAuth: true,
  },
  {
    getHref: () => "/bookmark",
    getIsActive: (pathname: string, href: string) =>
      pathname === href || pathname.startsWith(`${href}/`),
    label: "Bookmark",
    requiresAuth: true,
  },
] as const;

function WorkspaceMenuSection({
  componentsUrl,
  onNavigate,
}: {
  componentsUrl: string;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession(authClient);
  const menuItems = WORKSPACE_MENU_ITEMS.filter(
    (item) => !item.requiresAuth || Boolean(session)
  );

  return (
    <Sidebar001Section
      className="mt-4"
      label={<Separator icon={<SquareMenu strokeWidth={2} />} name="Menu" />}
    >
      {menuItems.map((item) => {
        const href = item.getHref(componentsUrl);
        return (
          <Sidebar001Item
            href={href}
            isActive={item.getIsActive(pathname, href)}
            key={item.label}
            label={item.label}
            onClick={onNavigate}
          />
        );
      })}
    </Sidebar001Section>
  );
}

export interface WorkspaceSidebarProps extends BaseLayoutProps {
  componentsUrl: string;
  releaseDatesByUrl?: Record<string, string>;
}

export function WorkspaceSidebar({
  links = [],
  githubUrl,
  componentsUrl,
  releaseDatesByUrl = {},
}: WorkspaceSidebarProps) {
  const isMobile = useIsMobile();
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
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <DocsReleaseDatesProvider releaseDatesByUrl={releaseDatesByUrl}>
      <Sidebar
        className={cn(
          "md:!hidden min-h-0 overflow-hidden",
          "max-md:!w-[min(300px,calc(100vw-1.5rem))] max-md:!max-w-[min(300px,calc(100vw-1.5rem))]"
        )}
        collapsible={false}
      >
        <Sidebar001
          className="min-h-0 w-full max-md:max-w-full"
          defaultWidth={380}
          maxWidth={380}
          minWidth={180}
        >
          <Sidebar001Header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
              <IconLogo size="sm" />
              <span className="font-semibold text-sm">Sora UI</span>
            </div>
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
                <WorkspaceGuideLink
                  item={link}
                  key={link.url}
                  onNavigate={closeMobile}
                />
              ))}
            </Sidebar001Section>
            <WorkspaceMenuSection
              componentsUrl={componentsUrl}
              onNavigate={closeMobile}
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
      </Sidebar>
    </DocsReleaseDatesProvider>
  );
}
