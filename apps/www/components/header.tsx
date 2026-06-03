"use client";

import XIcon from "@workspace/ui/components/icons/x-icon";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { motion } from "motion/react";
import { Logo } from "@/components/logo";
import { ThemeSwitcher } from "./animate/theme-switcher";

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

const LOGO_WRAPPER_VARIANTS = {
  center: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  topLeft: {
    top: 0,
    left: 0,
    right: 0,
    bottom: "auto",
    height: "auto",
  },
};

export const Header = ({ transition }: { transition: boolean }) => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      animate={transition ? "topLeft" : "center"}
      className="absolute z-40 flex items-center justify-center"
      initial="center"
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      variants={LOGO_WRAPPER_VARIANTS}
    >
      <div className="relative size-full max-w-7xl">
        {transition ? (
          <motion.div
            animate={{
              top: 32,
            }}
            className="absolute left-5 z-110"
            layoutId="logo"
          >
            <Logo size="sm" />
          </motion.div>
        ) : (
          <motion.div
            className="absolute top-1/2 left-1/2 z-110 -translate-x-1/2 -translate-y-1/2"
            layoutId="logo"
          >
            <Logo draw size={isMobile ? "lg" : "xl"} />
          </motion.div>
        )}

        <motion.div
          animate={
            transition
              ? {
                  top: 28,
                  right: 20,
                  opacity: 1,
                }
              : {
                  top: 28,
                  right: -43,
                  opacity: 0,
                }
          }
          className="absolute z-110 flex items-center gap-x-4"
          initial={{
            top: 28,
            right: -43,
            opacity: 0,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        >
          <div className="xs:flex hidden items-center gap-x-1">
            <a
              className="inline-flex items-center justify-center rounded-md p-1.5 font-medium text-fd-muted-foreground text-sm transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 sm:mt-1 [&_svg]:size-5 sm:[&_svg]:size-5.5"
              data-active="false"
              href="https://github.com/axyl1410/sora"
              rel="noreferrer noopener"
              target="_blank"
            >
              <GithubLogo className="size-6" />
            </a>
            <a
              className="inline-flex items-center justify-center rounded-md p-1.5 font-medium text-fd-muted-foreground text-sm transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 sm:mt-1 [&_svg]:size-5 sm:[&_svg]:size-5.5"
              data-active="false"
              href="/"
              rel="noreferrer noopener"
              target="_blank"
            >
              <XIcon />
            </a>
          </div>

          <ThemeSwitcher className="mt-1 xs:mt-0 sm:mt-1" />
        </motion.div>
      </div>
    </motion.div>
  );
};
