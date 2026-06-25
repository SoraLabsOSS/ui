import XIcon from "@workspace/ui/components/icons/x-icon";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { AccountSidebar } from "@/components/account/sidebar";
import { ThemeSwitcher } from "@/components/animate/theme-switcher";
import { Nav } from "@/components/docs/nav";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { getReleaseDatesByUrl } from "@/lib/docs/get-release-dates-by-url";
import { source } from "@/lib/docs/source";

const DOCS_LAYOUT_PROPS: DocsLayoutProps = {
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

export default function BlogLayout({ children }: { children: ReactNode }) {
  const primitivesUrl = getFirstPrimitiveDocUrl();
  const releaseDatesByUrl = getReleaseDatesByUrl();

  return (
    <DocsLayout
      {...DOCS_LAYOUT_PROPS}
      containerProps={{
        className:
          "account-docs-layout [--fd-nav-height:3.5rem] md:[--fd-nav-height:4.25rem] md:[--fd-sidebar-width:0px] xl:[--fd-toc-width:260px]",
      }}
      nav={{
        component: <Nav primitivesUrl={primitivesUrl} />,
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
      {children}
    </DocsLayout>
  );
}
