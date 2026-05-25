'use client';

import { Navbar } from 'fumadocs-ui/layouts/docs-client';
import Link from 'next/link';
import React from 'react';
import { IconLogo } from '../icon-logo';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@workspace/ui/lib/utils';
import { CommandIcon, Menu } from 'lucide-react';
import { useSearchContext, useSidebar } from 'fumadocs-ui/provider';
import { ThemeSwitcher } from '../animate/theme-switcher';
import XIcon from '@workspace/ui/components/icons/x-icon';

const GithubLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-label="GitHub"
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
  </svg>
);

export const NAV_ITEMS = [
  {
    title: 'Docs',
    url: '/docs',
  },
  {
    title: 'Components',
    url: '/docs/components',
  },
];

const NavItem = ({ title, url }: { title: string; url: string }) => {
  return (
    <Link
      href={url}
      className={buttonVariants({
        color: 'ghost',
        size: 'sm',
        className: cn(
          '!h-8 !px-3 !text-sm !font-normal text-neutral-700 transition-colors duration-200 ease-in-out hover:text-black dark:text-neutral-200 dark:hover:text-white',
        ),
      })}
    >
      {title}
    </Link>
  );
};

export const Nav = () => {
  const { setOpenSearch } = useSearchContext();
  const { open, setOpen } = useSidebar();

  return (
    <Navbar className="bg-background left-1/2 flex h-14 w-full max-w-[1670px] -translate-x-1/2 items-center gap-3 border-b-0 px-3 md:h-17 md:px-5">
      <Link
        href="/"
        className={buttonVariants({
          color: 'ghost',
          size: 'icon-sm',
          className:
            '!size-8 !p-0 transition-colors duration-200 ease-in-out [&_svg]:!size-5 md:[&_svg]:!size-4.5',
        })}
      >
        <IconLogo size="sm" />
      </Link>

      <div className="flex flex-1 items-center justify-end gap-2 md:justify-between">
        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.title} title={item.title} url={item.url} />
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            className="bg-accent hover:bg-accent/70 text-muted-foreground flex h-8 w-48 items-center justify-between rounded-md pr-1.5 pl-3 text-sm transition-colors duration-200 ease-in-out lg:w-56 xl:w-64"
            onClick={() => setOpenSearch(true)}
          >
            <span className="font-normal">Search...</span>

            <div className="flex items-center gap-1">
              <kbd className="bg-background flex size-5 items-center justify-center rounded-[4px] border leading-none">
                <CommandIcon className="size-2.5" />
              </kbd>
              <kbd className="bg-background flex size-5 items-center justify-center rounded-[4px] border">
                <span className="pt-px text-[0.625rem] leading-none">K</span>
              </kbd>
            </div>
          </button>

          <div className="flex items-center gap-1 max-md:hidden">
            <a
              href="https://github.com/imskyleen/animate-ui"
              rel="noreferrer noopener"
              target="_blank"
              className="hover:bg-fd-accent hover:text-fd-accent-foreground text-fd-muted-foreground inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5"
              data-active="false"
            >
              <GithubLogo />
            </a>

            <a
              href="https://x.com/animate_ui"
              rel="noreferrer noopener"
              target="_blank"
              className="hover:bg-fd-accent hover:text-fd-accent-foreground text-fd-muted-foreground inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5"
              data-active="false"
            >
              <XIcon />
            </a>
          </div>

          <ThemeSwitcher className="max-md:hidden" />

          <button
            className={cn(
              buttonVariants({
                color: 'ghost',
                size: 'icon-sm',
                className:
                  'text-fd-muted-foreground !size-8 md:hidden [&_svg]:!size-5',
              }),
            )}
            onClick={() => setOpen((prev) => !prev)}
          >
            <Menu />
          </button>
        </div>
      </div>
    </Navbar>
  );
};
