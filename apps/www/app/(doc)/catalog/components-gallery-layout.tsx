import XIcon from "@workspace/ui/components/icons/x-icon";
import type { PageTree } from "fumadocs-core/server";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { AccountSidebar } from "@/components/account-sidebar";
import { ComponentsShell } from "@/components/catalog/components-shell";
import { Nav } from "@/components/docs/nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GITHUB_PROFILE_URL, X_PROFILE_URL } from "@/lib/site";

const COMPONENTS_GALLERY_LAYOUT_PROPS: Omit<DocsLayoutProps, "tree"> = {
  githubUrl: GITHUB_PROFILE_URL,
  themeSwitch: {
    component: <ThemeSwitcher />,
  },
  ...baseOptions,
  links: [
    ...(baseOptions.links || []),
    {
      icon: <XIcon />,
      url: X_PROFILE_URL,
      text: "X",
      type: "icon",
    },
  ],
};

interface ComponentsGalleryLayoutProps {
  children: ReactNode;
  primitivesUrl: string;
  releaseDatesByUrl: Record<string, string>;
  tree: PageTree.Root;
  uiUrl: string;
}

/** Docs navbar + mobile nav drawer for `/components` index only. */
export function ComponentsGalleryLayout({
  children,
  primitivesUrl,
  releaseDatesByUrl,
  tree,
  uiUrl,
}: ComponentsGalleryLayoutProps) {
  return (
    <DocsLayout
      {...COMPONENTS_GALLERY_LAYOUT_PROPS}
      containerProps={{
        className:
          "account-docs-layout [--fd-nav-height:3.5rem] md:[--fd-nav-height:4.25rem] md:[--fd-sidebar-width:0px] xl:[--fd-toc-width:0px]",
      }}
      nav={{
        component: <Nav primitivesUrl={primitivesUrl} uiUrl={uiUrl} />,
      }}
      sidebar={{
        component: (
          <AccountSidebar
            componentsUrl={primitivesUrl}
            releaseDatesByUrl={releaseDatesByUrl}
            {...COMPONENTS_GALLERY_LAYOUT_PROPS}
          />
        ),
      }}
      tree={tree}
    >
      <ComponentsShell className="h-[calc(100dvh-var(--fd-banner-height)-var(--fd-nav-height))] overflow-y-auto">
        {children}
      </ComponentsShell>
    </DocsLayout>
  );
}
