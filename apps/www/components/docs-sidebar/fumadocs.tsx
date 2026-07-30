"use client";

import { useSession } from "@better-auth-ui/react";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";
import type { PageTree } from "fumadocs-core/server";
import type { SidebarComponents } from "fumadocs-ui/components/layout/sidebar";
import { Sidebar } from "fumadocs-ui/components/layout/sidebar";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { LinkItemType } from "fumadocs-ui/layouts/links";
import { BaseLinkItem } from "fumadocs-ui/layouts/links";
import { getLinks } from "fumadocs-ui/layouts/shared";
import { useSidebar, useTreeContext, useTreePath } from "fumadocs-ui/provider";
import { isActive } from "fumadocs-ui/utils/is-active";
import { SquareMenu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, type ReactNode, useEffect, useMemo } from "react";
import {
  AUTH_MENU_LINKS,
  AuthSidebarMenuSkeleton,
} from "@/components/auth/auth-menu-skeletons";
import { useAuthNavPending } from "@/hooks/use-auth-nav-pending";
import { useBookmarkLoginDialog } from "@/hooks/use-bookmark-login-dialog";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/lib/docs/attach-separator";
import {
  isPrimitivesNavItemActive,
  MENU_PRIMITIVES_ITEM_KEY,
} from "@/lib/docs/primitive-nav-active";
import { SkeletonTransition } from "@/registry/primitives/effects/skeleton";
import { ThemeSwitcher } from "../animate/theme-switcher";
import { IconLogo } from "../icon-logo";
import {
  DocsReleaseDatesProvider,
  useCheckDocsPageNew,
  useDocsPageNew,
} from "./release-dates-context";
import {
  DocsShell,
  DocsShellContent,
  DocsShellFooter,
  DocsShellHeader,
  DocsShellNavGroup,
  DocsShellNavItem,
  DocsShellSection,
  useDocsShellHover,
} from "./shell";
import { DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR } from "./shell/scroll-active-nearest";
import { useDismissMobileSidebarOnOutside } from "./use-dismiss-mobile-sidebar";

const getIsActive = (pathname: string, href: string) =>
  href !== undefined && isActive(href, pathname, false);
interface NavItemFlags {
  isNew?: boolean;
  new?: boolean;
}

function getNavItemLabel(item: PageTree.Item): string {
  return typeof item.name === "string" ? item.name : String(item.name ?? "");
}

function getNavItemIsNew(
  item: PageTree.Item,
  isPageNewByUrl: (url?: string) => boolean
): boolean {
  const href =
    (item as { index?: { url: string } }).index?.url ??
    (item as { url?: string }).url;
  return (
    Boolean(href && isPageNewByUrl(href)) ||
    Boolean((item as NavItemFlags).isNew ?? (item as NavItemFlags).new)
  );
}

function pageTreeNodeKey(
  item: PageTree.Node,
  index: number,
  parentKey: string
): string {
  if (item.type === "separator") {
    return `${parentKey}/sep/${encodeURIComponent(String(item.name))}/${index}`;
  }
  if (item.type === "folder") {
    return `${parentKey}/folder/${encodeURIComponent(String(item.name))}/${index}`;
  }
  const url = (item as { url?: string }).url;
  if (url) {
    return url;
  }
  return `${parentKey}/item/${index}`;
}

const DEFAULT_OPEN_LEVEL = 0;

function isRootFolder(
  item: PageTree.Node
): item is PageTree.Folder & { root: true } {
  return item.type === "folder" && Boolean((item as PageTree.Folder).root);
}

/** Fumadocs hoists `meta.json` `root: true` folders as context `root` on nested routes. */
function getPrimitiveRootFolders(treeRoot: PageTree.Root): PageTree.Folder[] {
  if (isRootFolder(treeRoot as PageTree.Node)) {
    return [treeRoot as PageTree.Folder];
  }

  return treeRoot.children.filter(isRootFolder);
}

/** Renders a bottom "Menu" section on guide pages with Primitives + Components links. */
function GuideBottomMenu({
  onNavigate,
  primitivesUrl: primitivesUrlProp,
}: {
  onNavigate?: () => void;
  primitivesUrl?: string;
}) {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const componentRoots = getPrimitiveRootFolders(root);

  // Derive the Primitives index URL from the first root folder in the tree.
  const derivedPrimitivesUrl = useMemo(() => {
    for (const folder of componentRoots) {
      const url =
        folder.index?.url ??
        (
          folder.children.find((c) => c.type === "page") as
            | PageTree.Item
            | undefined
        )?.url;
      if (url) {
        return url;
      }
    }
    return "/docs";
  }, [componentRoots]);

  const primitivesUrl = primitivesUrlProp ?? derivedPrimitivesUrl;

  const { data: session } = useSession(authClient);
  const authNavPending = useAuthNavPending();
  const { loginDialog, openLoginDialog } = useBookmarkLoginDialog();
  const { setHovered } = useDocsShellHover();

  useEffect(() => {
    void authNavPending;
    setHovered(null);
  }, [authNavPending, setHovered]);

  return (
    <DocsShellSection
      className="mt-4"
      label={<Separator icon={<SquareMenu strokeWidth={2} />} name="Menu" />}
    >
      <DocsShellNavItem
        href={primitivesUrl}
        isActive={isPrimitivesNavItemActive(pathname, primitivesUrl)}
        itemKey={MENU_PRIMITIVES_ITEM_KEY}
        label="Primitives"
        onClick={onNavigate}
      />
      <DocsShellNavItem
        href="/components"
        isActive={
          pathname === "/components" || pathname.startsWith("/components/")
        }
        label="Components"
        onClick={onNavigate}
      />
      <DocsShellNavItem
        href="/docs/icons"
        isActive={false}
        itemKey="menu-icons"
        label="Icons"
        onClick={onNavigate}
      />
      <DocsShellNavItem
        href="/blog"
        isActive={pathname === "/blog" || pathname.startsWith("/blog/")}
        label="Blog"
        onClick={onNavigate}
      />
      {AUTH_MENU_LINKS.map((item) => (
        <SkeletonTransition
          key={item.url}
          loading={authNavPending}
          skeleton={<AuthSidebarMenuSkeleton width={item.skeletonWidth} />}
        >
          <DocsShellNavItem
            href={item.url}
            isActive={
              item.title === "Settings"
                ? pathname.startsWith("/settings")
                : pathname === item.url || pathname.startsWith(`${item.url}/`)
            }
            label={item.title}
            onClick={(event) => {
              if (!session) {
                event.preventDefault();
                openLoginDialog(item.url);
                return;
              }
              onNavigate?.();
            }}
          />
        </SkeletonTransition>
      ))}
      {loginDialog}
    </DocsShellSection>
  );
}

export function SidebarPageTree(props: {
  components?: Partial<SidebarComponents>;
  onNavigate?: () => void;
  /** Always render primitive root folders (Texts, Disclosure, …) below Menu. */
  showPrimitiveSections?: boolean;
}) {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const treePath = useTreePath();
  const { onNavigate } = props;
  const checkPageNew = useCheckDocsPageNew();

  return useMemo(() => {
    const { Separator, Item, Folder } = props.components ?? {};
    const primitiveRoots = getPrimitiveRootFolders(root);

    function renderSeparator(
      item: PageTree.Separator,
      key: string,
      i: number,
      _level: number
    ) {
      if (Separator) {
        return <Separator item={item} key={key} />;
      }
      return (
        <DocsShellSection
          className={cn(i === 0 ? "mt-1" : "mt-4")}
          key={key}
          label={
            <span className="inline-flex items-center gap-2">
              {item.icon}
              {item.name}
            </span>
          }
        >
          {null}
        </DocsShellSection>
      );
    }

    function renderFolder(
      item: PageTree.Folder,
      key: string,
      level: number,
      parentKey: string
    ) {
      const indexUrl = item.index?.url;
      const folderChildren = indexUrl
        ? item.children.filter(
            (child) => child.type !== "page" || child.url !== indexUrl
          )
        : item.children;
      const children = renderSidebarList(
        folderChildren,
        level + 1,
        `${parentKey}/${key}`
      );
      if (Folder) {
        return (
          <Folder item={item} key={key} level={level}>
            {children}
          </Folder>
        );
      }
      const defaultOpen =
        (item.defaultOpen ?? DEFAULT_OPEN_LEVEL >= level) ||
        treePath.includes(item);
      const folderIndex = item.index;
      const showIndexLink =
        folderIndex != null &&
        !item.children.some(
          (child) => child.type === "page" && child.url === folderIndex.url
        );
      return (
        <DocsShellNavGroup
          defaultOpen={defaultOpen}
          icon={item.icon}
          key={key}
          label={item.name}
        >
          {showIndexLink ? (
            <DocsShellNavItem
              href={folderIndex.url}
              isActive={getIsActive(pathname, folderIndex.url)}
              label={folderIndex.name ?? item.name}
              onClick={onNavigate}
            />
          ) : null}
          {children}
        </DocsShellNavGroup>
      );
    }

    function renderPage(item: PageTree.Item, key: string) {
      if (Item) {
        return <Item item={item} key={key} />;
      }

      const url =
        (item as { index?: { url: string } }).index?.url ??
        (item as { url: string }).url;

      return (
        <DocsShellNavItem
          href={url}
          isActive={getIsActive(pathname, url)}
          isNew={getNavItemIsNew(item, checkPageNew)}
          key={key}
          label={getNavItemLabel(item)}
          onClick={onNavigate}
        />
      );
    }

    function renderSidebarList(
      items: PageTree.Node[],
      level: number,
      parentKey: string
    ): ReactNode[] {
      return items.flatMap((item, i) => {
        const key = pageTreeNodeKey(item, i, parentKey);
        if (item.type === "separator") {
          return renderSeparator(item, key, i, level);
        }
        if (item.type === "folder") {
          return renderFolder(item, key, level, parentKey);
        }
        return renderPage(item, key);
      });
    }

    if (props.showPrimitiveSections) {
      if (primitiveRoots.length === 0) {
        return null;
      }

      const activeRoot = treePath.findLast(isRootFolder) ?? primitiveRoots[0];

      return (
        <Fragment key={activeRoot.$id ?? String(activeRoot.name)}>
          {renderSidebarList(
            activeRoot.children,
            1,
            String(activeRoot.$id ?? activeRoot.name)
          )}
        </Fragment>
      );
    }

    const sectionRoot = treePath.findLast(isRootFolder);
    const sidebarItems = sectionRoot?.children ?? root.children;

    return (
      <Fragment key={sectionRoot?.$id ?? root.$id}>
        {renderSidebarList(
          sidebarItems,
          1,
          String(sectionRoot?.$id ?? root.$id ?? "tree")
        )}
      </Fragment>
    );
  }, [
    props.components,
    props.showPrimitiveSections,
    root,
    pathname,
    treePath,
    onNavigate,
    checkPageNew,
  ]);
}

export function SidebarLinkItem({
  item,
  onNavigate,
  ...props
}: {
  item: LinkItemType & { new?: boolean };
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const linkUrl = "url" in item ? item.url : undefined;
  const isNewFromRelease = useDocsPageNew(linkUrl);

  if (item.type === "menu") {
    return (
      <DocsShellNavGroup defaultOpen icon={item.icon} label={item.text}>
        {item.items.map((child) => (
          <SidebarLinkItem
            item={child}
            key={
              "url" in child && child.url
                ? `${String((item as { url?: string }).url ?? item.text)}-${child.url}`
                : `${String((item as { url?: string }).url ?? item.text)}-${String((child as { text?: string }).text)}`
            }
            onNavigate={onNavigate}
          />
        ))}
      </DocsShellNavGroup>
    );
  }

  if (item.type === "custom") {
    return <div {...props}>{item.children as ReactNode}</div>;
  }

  if ((item as { type?: string }).type === "separator") {
    const sep = item as unknown as { icon: ReactNode; name: string };
    return (
      <DocsShellSection
        {...props}
        className={cn("!mt-2", props.className)}
        label={<Separator icon={sep.icon} name={sep.name} />}
      >
        {null}
      </DocsShellSection>
    );
  }

  const active = getIsActive(pathname, item.url);

  return (
    <DocsShellNavItem
      className={props.className}
      external={item.external}
      href={item.url}
      isActive={active}
      isNew={isNewFromRelease || Boolean((item as { new?: boolean }).new)}
      label={item.text as string}
      onClick={item.external ? undefined : onNavigate}
    />
  );
}

export const DocsSidebar = (
  all: DocsLayoutProps & {
    releaseDatesByUrl?: Record<string, string>;
    primitivesUrl?: string;
  }
) => {
  const {
    footer: sidebarFooter,
    components: sidebarComponents,
    ...sidebarProps
  } = all.sidebar ?? {};
  const links = getLinks(all.links ?? [], all.githubUrl);
  const isMobile = useIsMobile();
  const { setOpen } = useSidebar();
  useDismissMobileSidebarOnOutside();

  const closeMobile = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const scrollViewportSelector = `[&_[${DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR}]]:!p-0`;
  const releaseDatesByUrl = all.releaseDatesByUrl ?? {};

  return (
    <DocsReleaseDatesProvider releaseDatesByUrl={releaseDatesByUrl}>
      <Sidebar
        className={cn(
          "min-h-0 overflow-hidden",
          "max-md:!w-[min(300px,calc(100vw-1.5rem))] max-md:!max-w-[min(300px,calc(100vw-1.5rem))]",
          scrollViewportSelector,
          sidebarProps.className
        )}
        collapsible={false}
        {...sidebarProps}
      >
        <DocsShell
          className="min-h-0 max-md:w-full max-md:max-w-full"
          defaultWidth={260}
          maxWidth={380}
          minWidth={180}
        >
          <DocsShellHeader className="flex items-center justify-between border-b px-4 py-3 md:hidden">
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
          </DocsShellHeader>

          <DocsShellContent
            className={cn(
              "min-h-0",
              "max-md:pt-2 [&_[data-radix-scroll-area-viewport]]:pb-4 md:[&_[data-radix-scroll-area-viewport]]:pb-14"
            )}
          >
            {links
              .filter((v) => v.type !== "icon")
              .map((item, i, list) => {
                let linkKey: string;
                if (item.type === "menu") {
                  linkKey = `menu-${item.text}`;
                } else if (item.type === "custom") {
                  linkKey = "custom-docs-link";
                } else if (item.url) {
                  linkKey = item.url;
                } else {
                  linkKey = `link-${item.text ?? "unknown"}-${i}`;
                }

                return (
                  <SidebarLinkItem
                    className={cn(i === list.length - 1 && "mb-1")}
                    item={item}
                    key={linkKey}
                    onNavigate={closeMobile}
                  />
                );
              })}

            <GuideBottomMenu
              onNavigate={closeMobile}
              primitivesUrl={all.primitivesUrl}
            />

            <div className="mt-4">
              <SidebarPageTree
                components={sidebarComponents}
                onNavigate={closeMobile}
                showPrimitiveSections
              />
            </div>
          </DocsShellContent>

          <DocsShellFooter>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="ms-auto flex items-center justify-end gap-1 md:hidden">
                {links
                  .filter((link) => link.type === "icon")
                  .map((link) => (
                    <BaseLinkItem
                      aria-label={link.label}
                      className={cn(
                        buttonVariants({ size: "icon", color: "ghost" }),
                        "text-fd-muted-foreground md:[&_svg]:size-4.5",
                        link.url ===
                          links.filter((l) => l.type === "icon").at(-1)?.url &&
                          "me-auto"
                      )}
                      item={link}
                      key={link.url}
                    >
                      {link.icon}
                    </BaseLinkItem>
                  ))}
                <ThemeSwitcher />
              </div>
            </div>
            {sidebarFooter ? <div className="mt-2">{sidebarFooter}</div> : null}
          </DocsShellFooter>
        </DocsShell>
      </Sidebar>
    </DocsReleaseDatesProvider>
  );
};
