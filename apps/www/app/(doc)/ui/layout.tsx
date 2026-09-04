import XIcon from "@workspace/ui/components/icons/x-icon";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { ThemeSwitcher } from "@/components/animate/theme-switcher";
import { Nav } from "@/components/docs/nav";
import { DocsSidebar } from "@/components/docs/sidebar";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { GITHUB_PROFILE_URL, X_PROFILE_URL } from "@/lib/site";
import { getFirstUiDocUrl } from "@/lib/ui/get-first-ui-doc-url";
import { getUiReleaseDatesByUrl } from "@/lib/ui/get-release-dates-by-url";
import { uiSource } from "@/lib/ui/source";

const UI_LAYOUT_PROPS: DocsLayoutProps = {
  tree: uiSource.pageTree,
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

export default function Layout({ children }: { children: ReactNode }) {
  const releaseDatesByUrl = getUiReleaseDatesByUrl();
  const primitivesUrl = getFirstPrimitiveDocUrl();
  const uiUrl = getFirstUiDocUrl();

  return (
    <DocsLayout
      {...UI_LAYOUT_PROPS}
      containerProps={{
        className:
          "[--fd-nav-height:3.5rem] md:[--fd-nav-height:4.25rem] md:[--fd-sidebar-width:260px] lg:[--fd-sidebar-width:260px] xl:[--fd-toc-width:260px]",
      }}
      nav={{
        component: <Nav primitivesUrl={primitivesUrl} uiUrl={uiUrl} />,
      }}
      sidebar={{
        component: (
          <DocsSidebar
            primitivesUrl={primitivesUrl}
            releaseDatesByUrl={releaseDatesByUrl}
            uiUrl={uiUrl}
            {...UI_LAYOUT_PROPS}
          />
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
