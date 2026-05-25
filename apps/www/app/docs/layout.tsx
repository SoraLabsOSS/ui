import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { DocsSidebar } from '@/components/docs/sidebar';
import { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { ThemeSwitcher } from '@/components/animate/theme-switcher';
import XIcon from '@workspace/ui/components/icons/x-icon';
import { Nav } from '@/components/docs/nav';

const DOCS_LAYOUT_PROPS: DocsLayoutProps = {
  tree: source.pageTree,

  githubUrl: 'https://github.com/axyl1410/sora',
  themeSwitch: {
    component: <ThemeSwitcher />,
  },
  ...baseOptions,
  links: [
    ...(baseOptions.links || []),
    {
      icon: <XIcon />,
      url: '',
      text: 'X',
      type: 'icon',
    },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...DOCS_LAYOUT_PROPS}
      containerProps={{
        className:
          'md:[--fd-nav-height:4.25rem] md:[--fd-sidebar-width:260px] lg:[--fd-sidebar-width:260px]',
      }}
      sidebar={{
        component: <DocsSidebar {...DOCS_LAYOUT_PROPS} />,
      }}
      nav={{
        component: <Nav />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
