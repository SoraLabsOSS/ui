"use client";

import { UserButton } from "@workspace/auth-ui/components/auth/user/user-button";
import { ProgressiveBlur } from "@workspace/ui/components/ui/progressive-blur";
import { cn } from "@workspace/ui/lib/utils";
import { Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import { HomeShell } from "@/components/home/home-shell";
import { IconLogo } from "@/components/icon-logo";
import { ThemeSwitcher } from "./animate/theme-switcher";

const headerIconButtonClassName =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-md font-medium text-fd-muted-foreground text-sm transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-6";

const headerThemeToggleSlotClassName =
  "ms-1 inline-flex size-9 shrink-0 items-center justify-center px-0.5 sm:ms-1.5 sm:px-1";

const GithubLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-label="GitHub"
    fill="currentColor"
    role="img"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export const Header = () => (
  <header className="fixed inset-x-0 top-(--fd-banner-height) z-30 h-16 overflow-visible">
    <ProgressiveBlur
      backgroundColor="var(--background)"
      // height="calc(4rem + 1rem)"
      maskFadeStart="40%"
      position="top"
    />
    <HomeShell contentClassName="relative z-10 flex h-16 items-center justify-between gap-3">
      <motion.div
        className="flex min-w-0 items-center gap-1.5 sm:gap-2"
        layoutId="logo"
      >
        <IconLogo className="size-6 shrink-0 sm:size-7" size="sm" />
        <span className="truncate font-semibold text-foreground text-lg leading-none tracking-tight sm:text-xl md:text-2xl">
          Sora UI
        </span>
      </motion.div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <CommandPaletteTrigger
          className={headerIconButtonClassName}
          variant="icon"
        />

        <a
          className={cn(headerIconButtonClassName, "xs:flex hidden")}
          data-active="false"
          href="https://github.com/axyl1410/sora"
          rel="noreferrer noopener"
          target="_blank"
        >
          <GithubLogo />
        </a>

        <UserButton
          align="end"
          className="inline-flex size-9 items-center justify-center rounded-full **:data-[slot=avatar]:size-6"
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

        <div className={headerThemeToggleSlotClassName}>
          <ThemeSwitcher className="h-6 w-10" />
        </div>
      </div>
    </HomeShell>
  </header>
);
