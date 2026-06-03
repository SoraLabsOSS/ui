'use client';

import { cn } from '@workspace/ui/lib/utils';
import { Sidebar } from 'fumadocs-ui/components/layout/sidebar';
import type { SidebarComponents } from 'fumadocs-ui/components/layout/sidebar';
import { HideIfEmpty } from 'fumadocs-core/hide-if-empty';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { BaseLinkItem } from 'fumadocs-ui/layouts/links';
import type { LinkItemType } from 'fumadocs-ui/layouts/links';
import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { Fragment, useMemo, type ReactNode } from 'react';
import { getLinks } from 'fumadocs-ui/layouts/shared';
import { ThemeSwitcher } from '../animate/theme-switcher';
import type { PageTree } from 'fumadocs-core/server';
import { useTreeContext, useTreePath, useSidebar } from 'fumadocs-ui/provider';
import { usePathname } from 'next/navigation';
import { isActive } from 'fumadocs-ui/utils/is-active';
import { Separator } from '@/lib/attach-separator';
import { TypeIcon } from 'lucide-react';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';
import { DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR } from './shell/scroll-active-nearest';
import {
  DocsShell,
  DocsShellContent,
  DocsShellFooter,
  DocsShellNavGroup,
  DocsShellNavItem,
  DocsShellSection,
} from './shell';
import { useDismissMobileSidebarOnOutside } from './use-dismiss-mobile-sidebar';

const MENU_ITEMS = [
  {
    name: 'Texts',
    type: 'separator',
    icon: <TypeIcon strokeWidth={3} />,
  },
  {
    text: 'Text Reveal',
    url: '/docs/texts/text-reveal',
  },
] as LinkItemType[];

const getIsActive = (pathname: string, href: string) => {
  return href !== undefined && isActive(href, pathname, false);
};

function pageTreeNodeKey(
  item: PageTree.Node,
  index: number,
  parentKey: string,
): string {
  if (item.type === 'separator') {
    return `${parentKey}/sep/${encodeURIComponent(String(item.name))}/${index}`;
  }
  if (item.type === 'folder') {
    return `${parentKey}/folder/${encodeURIComponent(String(item.name))}/${index}`;
  }
  const url = (item as { url?: string }).url;
  if (url) return url;
  return `${parentKey}/item/${index}`;
}

const DEFAULT_OPEN_LEVEL = 0;

function isRootFolder(
  item: PageTree.Node,
): item is PageTree.Folder & { root: true } {
  return item.type === 'folder' && Boolean((item as PageTree.Folder).root);
}

export function SidebarPageTree(props: {
  components?: Partial<SidebarComponents>;
  onNavigate?: () => void;
}) {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const treePath = useTreePath();
  const { onNavigate } = props;

  return useMemo(() => {
    const { Separator, Item, Folder } = props.components ?? {};
    const sectionRoot = treePath.findLast(isRootFolder);
    const sidebarItems = sectionRoot?.children ?? root.children;

    function renderSidebarList(
      items: PageTree.Node[],
      level: number,
      parentKey: string,
    ): ReactNode[] {
      return items.flatMap((item, i) => {
        const key = pageTreeNodeKey(item, i, parentKey);
        if (item.type === 'separator') {
          if (
            level === 1 &&
            sectionRoot &&
            pathname.startsWith('/docs/icons') &&
            i === 0
          ) {
            return [];
          }
          if (Separator) return <Separator key={key} item={item} />;
          return (
            <DocsShellSection
              key={key}
              label={
                <span className="inline-flex items-center gap-2">
                  {item.icon}
                  {item.name}
                </span>
              }
              className={cn(i === 0 ? 'mt-1' : 'mt-4')}
            >
              {null}
            </DocsShellSection>
          );
        }

        if (item.type === 'folder') {
          const indexUrl = item.index?.url;
          const folderChildren = indexUrl
            ? item.children.filter(
                (child) => child.type !== 'page' || child.url !== indexUrl,
              )
            : item.children;
          const children = renderSidebarList(
            folderChildren,
            level + 1,
            `${parentKey}/${key}`,
          );
          if (Folder)
            return (
              <Folder key={key} item={item} level={level}>
                {children}
              </Folder>
            );
          const defaultOpen =
            (item.defaultOpen ?? DEFAULT_OPEN_LEVEL >= level) ||
            treePath.includes(item);
          const folderIndex = item.index;
          const showIndexLink =
            folderIndex != null &&
            !item.children.some(
              (child) => child.type === 'page' && child.url === folderIndex.url,
            );
          return (
            <DocsShellNavGroup
              key={key}
              label={item.name}
              icon={item.icon}
              defaultOpen={defaultOpen}
            >
              {showIndexLink ? (
                <DocsShellNavItem
                  href={folderIndex.url}
                  label={folderIndex.name ?? item.name}
                  isActive={getIsActive(pathname, folderIndex.url)}
                  onClick={onNavigate}
                />
              ) : null}
              {children}
            </DocsShellNavGroup>
          );
        }

        if (Item) return <Item key={key} item={item} />;

        const url =
          (item as { index?: { url: string } }).index?.url ??
          (item as { url: string }).url;
        const active = getIsActive(pathname, url);

        return (
          <DocsShellNavItem
            key={key}
            href={url}
            label={item.name as string}
            isActive={active}
            isNew={Boolean((item as { new?: boolean }).new)}
            onClick={onNavigate}
          />
        );
      });
    }

    return (
      <Fragment key={sectionRoot?.$id ?? root.$id}>
        {renderSidebarList(
          sidebarItems,
          1,
          String(sectionRoot?.$id ?? root.$id ?? 'tree'),
        )}
      </Fragment>
    );
  }, [props.components, root, pathname, treePath, onNavigate]);
}

export function SidebarLinkItem({
  item,
  onNavigate,
  ...props
}: {
  item: LinkItemType;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  if (item.type === 'menu')
    return (
      <DocsShellNavGroup label={item.text} icon={item.icon} defaultOpen>
        {item.items.map((child) => (
          <SidebarLinkItem
            key={
              'url' in child && child.url
                ? `${String((item as { url?: string }).url ?? item.text)}-${child.url}`
                : `${String((item as { url?: string }).url ?? item.text)}-${String((child as { text?: string }).text)}`
            }
            item={child}
            onNavigate={onNavigate}
          />
        ))}
      </DocsShellNavGroup>
    );

  if (item.type === 'custom') {
    return <div {...props}>{item.children as ReactNode}</div>;
  }

  if ((item as { type?: string }).type === 'separator') {
    const sep = item as unknown as { icon: ReactNode; name: string };
    return (
      <DocsShellSection
        {...props}
        className={cn('!mt-2', props.className)}
        label={<Separator icon={sep.icon} name={sep.name} />}
      >
        {null}
      </DocsShellSection>
    );
  }

  const active = getIsActive(pathname, item.url);

  return (
    <DocsShellNavItem
      href={item.url}
      label={item.text as string}
      isActive={active}
      className={props.className}
      onClick={item.external ? undefined : onNavigate}
    />
  );
}

export const DocsSidebar = (all: DocsLayoutProps) => {
  const {
    footer: sidebarFooter,
    components: sidebarComponents,
    ...sidebarProps
  } = all.sidebar ?? {};
  const pathname = usePathname();
  const links = getLinks(all.links ?? [], all.githubUrl);
  const isComponentDocs =
    pathname.startsWith('/docs/components') ||
    pathname.startsWith('/docs/texts');
  const isMenu = !isComponentDocs;
  const isMobile = useIsMobile();
  const { setOpen } = useSidebar();
  useDismissMobileSidebarOnOutside();

  const closeMobile = () => {
    if (isMobile) setOpen(false);
  };

  const scrollViewportSelector = `[&_[${DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR}]]:!p-0`;

  return (
    <Sidebar
      collapsible={false}
      className={cn(
        'border-border min-h-0 overflow-hidden border-r',
        'max-md:!w-[min(300px,calc(100vw-1.5rem))] max-md:!max-w-[min(300px,calc(100vw-1.5rem))]',
        scrollViewportSelector,
        sidebarProps.className,
      )}
      {...sidebarProps}
    >
      <DocsShell
        className="min-h-0 max-md:w-full max-md:max-w-full"
        defaultWidth={260}
        minWidth={180}
        maxWidth={380}
      >
        <DocsShellContent
          className={cn(
            'min-h-0',
            'max-md:pt-2 [&_[data-radix-scroll-area-viewport]]:pb-4 md:[&_[data-radix-scroll-area-viewport]]:pb-14',
          )}
        >
          {links
            .filter((v) => v.type !== 'icon')
            .map((item, i, list) => {
              const linkKey =
                item.type === 'menu'
                  ? `menu-${item.text}`
                  : item.type === 'custom'
                    ? 'custom-docs-link'
                    : item.url
                      ? item.url
                      : `link-${item.text ?? 'unknown'}-${i}`;

              return (
                <SidebarLinkItem
                  key={linkKey}
                  item={item}
                  onNavigate={closeMobile}
                  className={cn(i === list.length - 1 && 'mb-3')}
                />
              );
            })}

          {isMenu ? (
            <div>
              {MENU_ITEMS.map((item, i) => (
                <SidebarLinkItem
                  key={
                    'url' in item && item.url
                      ? item.url
                      : `nav-${(item as { name?: string }).name ?? 'sep'}`
                  }
                  item={item as LinkItemType}
                  onNavigate={closeMobile}
                  className={cn(
                    i === 0 && 'mt-4',
                    i === MENU_ITEMS.length - 1 && 'mb-3',
                  )}
                />
              ))}
            </div>
          ) : (
            <SidebarPageTree
              components={sidebarComponents}
              onNavigate={closeMobile}
            />
          )}
        </DocsShellContent>

        <DocsShellFooter>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="ms-auto flex items-center justify-end gap-1 md:hidden">
              {links
                .filter((link) => link.type === 'icon')
                .map((link) => (
                  <BaseLinkItem
                    key={link.url}
                    item={link}
                    className={cn(
                      buttonVariants({ size: 'icon', color: 'ghost' }),
                      'text-fd-muted-foreground md:[&_svg]:size-4.5',
                      link.url ===
                        links.filter((l) => l.type === 'icon').at(-1)?.url &&
                        'me-auto',
                    )}
                    aria-label={link.label}
                  >
                    {link.icon}
                  </BaseLinkItem>
                ))}
              <ThemeSwitcher />
            </div>
          </div>
          <HideIfEmpty>
            <div className="mt-2 empty:hidden data-[empty=true]:hidden">
              {sidebarFooter}
            </div>
          </HideIfEmpty>
        </DocsShellFooter>
      </DocsShell>
    </Sidebar>
  );
};
