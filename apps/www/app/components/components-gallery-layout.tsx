import XIcon from "@workspace/ui/components/icons/x-icon";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { ThemeSwitcher } from "@/components/animate/theme-switcher";
import { ComponentPageCatalogShell } from "@/components/catalog/component-page-catalog-shell";
import { ComponentsShell } from "@/components/catalog/components-shell";
import { Nav } from "@/components/docs/nav";
import { source } from "@/lib/docs/source";
import type { ComponentGalleryItem } from "@/lib/registry/types";

const COMPONENTS_GALLERY_LAYOUT_PROPS: DocsLayoutProps = {
  tree: source.pageTree,
  githubUrl: "https://github.com/axyl1410/sora",
  themeSwitch: {
    component: <ThemeSwitcher />,
  },
  ...baseOptions,
  links: [
    ...(baseOptions.links || []),
    {
      icon: <XIcon />,
      url: "",
      text: "X",
      type: "icon",
    },
  ],
};

interface ComponentsGalleryLayoutProps {
  children: ReactNode;
  navItems: ComponentGalleryItem[];
  primitivesUrl: string;
}

/** Docs navbar + catalog shell for `/components` index only. */
export function ComponentsGalleryLayout({
  children,
  navItems,
  primitivesUrl,
}: ComponentsGalleryLayoutProps) {
  return (
    <DocsLayout
      {...COMPONENTS_GALLERY_LAYOUT_PROPS}
      containerProps={{
        className:
          "sf-pro-display [--fd-nav-height:3.5rem] md:[--fd-nav-height:4.25rem]",
      }}
      nav={{
        component: <Nav primitivesUrl={primitivesUrl} />,
      }}
      sidebar={{ enabled: false }}
    >
      <ComponentsShell className="h-[calc(100dvh-var(--fd-banner-height)-var(--fd-nav-height))] overflow-y-auto">
        <ComponentPageCatalogShell navItems={navItems}>
          {children}
        </ComponentPageCatalogShell>
      </ComponentsShell>
    </DocsLayout>
  );
}
