"use client";

import { UserButton } from "@workspace/ui/components/auth/user/user-button";
import {
  MotionNavigationMenu,
  MotionNavigationMenuItem,
  MotionNavigationMenuLink,
  MotionNavigationMenuList,
} from "@workspace/ui/components/unlumen-ui/motion-navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { Navbar } from "fumadocs-ui/layouts/docs-client";
import { useSearchContext, useSidebar } from "fumadocs-ui/provider";
import { Bookmark, CommandIcon, Menu } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "../animate/theme-switcher";
import { IconLogo } from "../icon-logo";

const DOCS_GUIDE_URL = "/docs";

export interface NavProps {
  /** First primitive doc from Fumadocs root folders (meta.json root flag). */
  primitivesUrl: string;
}

const buildNavItems = (primitivesUrl: string) =>
  [
    { title: "Docs", url: DOCS_GUIDE_URL },
    { title: "Components", url: primitivesUrl },
  ] as const;

export const Nav = ({ primitivesUrl }: NavProps) => {
  const { setOpenSearch } = useSearchContext();
  const { setOpen } = useSidebar();
  const navItems = buildNavItems(primitivesUrl);

  return (
    <Navbar className="z-40! border-b-0 bg-background px-(--fd-layout-offset) md:h-17">
      <div className="mx-auto flex h-14 w-full max-w-(--fd-layout-width) items-center gap-3 px-3 md:h-17 md:px-5">
        <Link
          className={buttonVariants({
            color: "ghost",
            size: "icon-sm",
            className:
              "size-8! p-0! transition-colors duration-200 ease-in-out [&_svg]:size-7!",
          })}
          href="/"
        >
          <IconLogo size="sm" />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2 md:justify-between">
          <div className="hidden items-center gap-1 md:flex">
            <MotionNavigationMenu viewport={false}>
              <MotionNavigationMenuList className="gap-0 bg-transparent">
                {navItems.map((item) => (
                  <MotionNavigationMenuItem key={item.title} value={item.title}>
                    <MotionNavigationMenuLink
                      asChild
                      className={cn(
                        "h-8! justify-center px-3! py-0! font-normal! text-neutral-700 text-sm! transition-colors duration-200 ease-in-out hover:text-black dark:text-neutral-200 dark:hover:text-white",
                        "data-[active=true]:text-black dark:data-[active=true]:text-white"
                      )}
                    >
                      <Link href={item.url}>{item.title}</Link>
                    </MotionNavigationMenuLink>
                  </MotionNavigationMenuItem>
                ))}
              </MotionNavigationMenuList>
            </MotionNavigationMenu>
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-2 md:gap-3">
            <button
              className="flex h-8 w-48 items-center justify-between rounded-md bg-accent pr-1.5 pl-3 text-muted-foreground text-sm transition-colors duration-200 ease-in-out hover:bg-accent/70 lg:w-56 xl:w-64"
              onClick={() => setOpenSearch(true)}
              type="button"
            >
              <span className="font-normal">Search...</span>

              <div className="flex items-center gap-1">
                <kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background leading-none">
                  <CommandIcon className="size-2.5" />
                </kbd>
                <kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background">
                  <span className="pt-px text-[0.625rem] leading-none">K</span>
                </kbd>
              </div>
            </button>

            <UserButton
              align="end"
              links={[
                {
                  label: "Bookmark",
                  href: "/bookmark",
                  icon: <Bookmark />,
                  visibility: "authenticated",
                },
              ]}
              size="icon"
            />

            <ThemeSwitcher className="max-md:hidden" />

            <button
              aria-label="Open menu"
              className={cn(
                buttonVariants({
                  color: "ghost",
                  size: "icon-sm",
                  className:
                    "relative z-10 size-8! shrink-0 text-fd-muted-foreground md:hidden [&_svg]:size-5!",
                })
              )}
              onClick={() => setOpen((prev) => !prev)}
              type="button"
            >
              <Menu />
            </button>
          </div>
        </div>
      </div>
    </Navbar>
  );
};
