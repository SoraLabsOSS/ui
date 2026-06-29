import XIcon from "@workspace/ui/components/icons/x-icon";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { ThemeSwitcher } from "@/components/animate/theme-switcher";
import { DocsAiSearchChatBubble } from "@/components/docs/ai-search-chat-bubble";
import { Nav } from "@/components/docs/nav";
import { DocsSidebar } from "@/components/docs/sidebar";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { getReleaseDatesByUrl } from "@/lib/docs/get-release-dates-by-url";
import { source } from "@/lib/docs/source";
import { GITHUB_PROFILE_URL, X_PROFILE_URL } from "@/lib/site";

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

export default function Layout({ children }: { children: ReactNode }) {
  const releaseDatesByUrl = getReleaseDatesByUrl();
  const primitivesUrl = getFirstPrimitiveDocUrl();

  return (
    <DocsLayout
      {...DOCS_LAYOUT_PROPS}
      containerProps={{
        className:
          "[--fd-nav-height:3.5rem] md:[--fd-nav-height:4.25rem] md:[--fd-sidebar-width:260px] lg:[--fd-sidebar-width:260px] xl:[--fd-toc-width:260px]",
      }}
      nav={{
        component: <Nav primitivesUrl={primitivesUrl} />,
      }}
      sidebar={{
        component: (
          <DocsSidebar
            releaseDatesByUrl={releaseDatesByUrl}
            {...DOCS_LAYOUT_PROPS}
          />
        ),
      }}
    >
      {children}
      <DocsAiSearchChatBubble />
    </DocsLayout>
  );
}
