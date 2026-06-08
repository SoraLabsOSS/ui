"use client";

import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { FooterArrowLink } from "./footer-arrow-link";

interface FooterNavLink {
  external?: boolean;
  href: string;
  label: string;
}

interface FooterNavSection {
  links: FooterNavLink[];
  title: string;
}

const FOOTER_NAV: FooterNavSection[] = [
  {
    title: "Platform",
    links: [
      { href: "/#who-its-for", label: "How it works" },
      { href: "/docs", label: "Documentation" },
      { href: "/docs/installation", label: "Installation" },
      {
        href: "https://github.com/axyl1410/sora/releases",
        label: "Changelog",
        external: true,
      },
      { href: "/#faq", label: "FAQs" },
    ],
  },
  {
    title: "Library",
    links: [
      { href: "/docs/primitives", label: "All primitives" },
      { href: "/docs/primitives/char-stagger-button", label: "Buttons" },
      { href: "/docs/primitives/draw-underline-link", label: "Texts" },
      { href: "/docs/primitives/pixelated-image-reveal", label: "Effects" },
      { href: "/docs/primitives/accordion", label: "Disclosure" },
      { href: "/docs/primitives/custom-cursor", label: "Cursor" },
      { href: "/docs/primitives/dock-nav", label: "Navigation" },
    ],
  },
  {
    title: "Open Source",
    links: [
      {
        href: "https://github.com/axyl1410/sora",
        label: "GitHub repo",
        external: true,
      },
      {
        href: "https://github.com/axyl1410/sora/issues",
        label: "Report an issue",
        external: true,
      },
      { href: "/docs/license", label: "License" },
      { href: "/docs/installation", label: "Get started" },
    ],
  },
];

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 1V15"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.5"
      />
      <path
        d="M1 8H15"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function FooterMobileAccordion({ sections }: { sections: FooterNavSection[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col lg:hidden">
      {sections.map((section, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            className="border-foreground/10 border-b last:border-b-0"
            key={section.title}
          >
            <button
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left text-foreground transition-colors duration-300"
              onClick={() => {
                setOpenIndex(isOpen ? null : index);
              }}
              type="button"
            >
              <span className="font-mono text-xs uppercase tracking-widest">
                {section.title}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
              >
                <PlusIcon className="h-3 w-3 shrink-0" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                  exit={{ height: 0, opacity: 0 }}
                  initial={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <ul className="flex flex-col gap-3 pb-5">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <FooterArrowLink
                          className="text-base"
                          external={link.external}
                          href={link.href}
                          textClassName="normal-case tracking-normal"
                        >
                          {link.label}
                        </FooterArrowLink>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function FooterDesktopNav({
  section,
  className,
}: {
  section: FooterNavSection;
  className?: string;
}) {
  return (
    <nav aria-label={section.title} className={className}>
      <p className="mb-6 font-mono text-muted-foreground text-xs uppercase tracking-widest">
        {section.title}
      </p>
      <ul className="flex flex-col gap-3">
        {section.links.map((link) => (
          <li key={link.label}>
            <FooterArrowLink
              className="text-base"
              external={link.external}
              href={link.href}
              textClassName="normal-case tracking-normal"
            >
              {link.label}
            </FooterArrowLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function FooterNav() {
  return (
    <>
      <FooterMobileAccordion sections={FOOTER_NAV} />

      {FOOTER_NAV.map((section, index) => (
        <FooterDesktopNav
          className={cn(
            "hidden lg:col-span-2 lg:block",
            index === 0 && "lg:col-start-7"
          )}
          key={section.title}
          section={section}
        />
      ))}
    </>
  );
}
