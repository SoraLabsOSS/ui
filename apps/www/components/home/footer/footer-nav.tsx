"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/sora-ui/disclosure/accordion";
import { cn } from "@workspace/ui/lib/utils";
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
      { href: "/pricing", label: "Pricing" },
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
      { href: "/components", label: "Components" },
      { href: "/docs/primitives", label: "All primitives" },
      // { href: "/docs/primitives/char-stagger-button", label: "Buttons" },
      // { href: "/docs/primitives/draw-underline-link", label: "Texts" },
      // { href: "/docs/primitives/pixelated-image-reveal", label: "Effects" },
      // { href: "/docs/primitives/accordion", label: "Disclosure" },
      // { href: "/docs/primitives/custom-cursor", label: "Cursor" },
      // { href: "/docs/primitives/dock-nav", label: "Navigation" },
    ],
  },
  {
    title: "Open Source",
    links: [
      // {
      //   href: "https://github.com/axyl1410/sora",
      //   label: "GitHub repo",
      //   external: true,
      // },
      // {
      //   href: "https://github.com/axyl1410/sora/issues",
      //   label: "Report an issue",
      //   external: true,
      // },
      { href: "/docs/license", label: "License" },
      { href: "/docs/installation", label: "Get started" },
    ],
  },
];

const footerAccordionTriggerClassName = cn(
  "gap-4 py-5 text-foreground",
  "[&>span:first-child]:font-mono [&>span:first-child]:font-normal [&>span:first-child]:text-xs [&>span:first-child]:uppercase [&>span:first-child]:tracking-widest",
  "[&_[data-anm-accordion-icon]]:size-3"
);

function FooterMobileAccordion({ sections }: { sections: FooterNavSection[] }) {
  return (
    <Accordion allowMultiple className="col-span-12 flex flex-col lg:hidden">
      {sections.map((section) => (
        <AccordionItem
          className="border-foreground/10 border-b last:border-b-0"
          key={section.title}
        >
          <AccordionTrigger className={footerAccordionTriggerClassName}>
            {section.title}
          </AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
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
