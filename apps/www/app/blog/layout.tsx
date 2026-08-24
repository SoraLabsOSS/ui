import XIcon from "@workspace/ui/components/icons/x-icon";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { AccountSidebar } from "@/components/account/sidebar";
import { ThemeSwitcher } from "@/components/animate/theme-switcher";
import { BlogTocFooterGuard } from "@/components/blog/blog-toc-footer-guard";
import { Nav } from "@/components/docs/nav";
import { HomeFooter } from "@/components/home/home-footer";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { getReleaseDatesByUrl } from "@/lib/docs/get-release-dates-by-url";
import { source } from "@/lib/docs/source";
import { getLatestShippedRegistryItem } from "@/lib/registry/get-latest-shipped-registry-item";
import { GITHUB_PROFILE_URL, X_PROFILE_URL } from "@/lib/site";
import { getFirstUiDocUrl } from "@/lib/ui/get-first-ui-doc-url";

const DOCS_LAYOUT_PROPS: DocsLayoutProps = {
  tree: source.pageTree,
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

export default function BlogLayout({ children }: { children: ReactNode }) {
  const primitivesUrl = getFirstPrimitiveDocUrl();
  const uiUrl = getFirstUiDocUrl();
  const releaseDatesByUrl = getReleaseDatesByUrl();
  const latestShipped = getLatestShippedRegistryItem();

  return (
    <DocsLayout
      {...DOCS_LAYOUT_PROPS}
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
            {...DOCS_LAYOUT_PROPS}
          />
        ),
      }}
    >
      <div className="flex min-h-full flex-1 flex-col" data-blog-footer>
        <BlogTocFooterGuard />
        {children}
        <div className="relative z-20 bg-background" data-blog-site-footer>
          <HomeFooter latestShipped={latestShipped} showTopBorder={false} />
        </div>
      </div>
    </DocsLayout>
  );
}
