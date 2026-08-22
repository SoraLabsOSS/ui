"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/sora-ui/disclosure/accordion";
import { cn } from "@workspace/ui/lib/utils";
import {
  COMMUNITY_DISCUSSIONS_URL,
  COMMUNITY_ISSUES_URL,
  COMMUNITY_REPO_URL,
  CONTACT_EMAIL,
  GITHUB_REPO_URL,
} from "@/lib/site";
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
      { href: "/blog", label: "Blog" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/pricing", label: "Pricing" },
      { href: "/#faq", label: "FAQs" },
    ],
  },
  {
    title: "Library",
    links: [
      { href: "/ui", label: "UI Kit" },
      { href: "/docs/motion", label: "Motion" },
      { href: "/catalog", label: "Catalog" },
      { href: "/docs/icons", label: "Icons" },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        href: GITHUB_REPO_URL,
        label: "GitHub",
        external: true,
      },
      {
        href: COMMUNITY_REPO_URL,
        label: "Community repo",
        external: true,
      },
      {
        href: COMMUNITY_ISSUES_URL,
        label: "Report an issue",
        external: true,
      },
      {
        href: COMMUNITY_DISCUSSIONS_URL,
        label: "Discussions",
        external: true,
      },
      {
        href: `mailto:${CONTACT_EMAIL}`,
        label: "Contact",
        external: true,
      },
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
