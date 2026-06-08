"use client";

import Link from "next/link";
import { Suspense } from "react";
import { HomeShell } from "@/components/home/home-shell";
import { IconLogo } from "@/components/icon-logo";
import { FooterArrowLink } from "./footer/footer-arrow-link";
import { FooterClock } from "./footer/footer-clock";
import { FooterCopyright } from "./footer/footer-copyright";
import { FooterDivider } from "./footer/footer-divider";
import { FooterNav } from "./footer/footer-nav";
import { FooterNewsletter } from "./footer/footer-newsletter";
import { FooterSocial } from "./footer/footer-social";

const LEGAL_LINKS = [
  { href: "/docs/license", label: "License" },
  { href: "https://github.com/axyl1410/sora", label: "GitHub", external: true },
] as const;

export function HomeFooter() {
  return (
    <footer className="relative border-foreground/10 border-t bg-background text-foreground">
      <HomeShell className="pt-6 pb-8 lg:pt-8 lg:pb-12">
        <div className="py-6">
          <div className="grid grid-cols-12 items-center gap-4">
            <div className="col-span-12 md:col-span-7">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-muted-foreground text-xs uppercase tracking-widest">
                <span
                  aria-hidden="true"
                  className="relative inline-flex size-3"
                >
                  <span className="absolute inset-0 animate-ping bg-accent-pro opacity-60" />
                  <span className="relative inline-block size-3 bg-accent-pro" />
                </span>
                <span>Just shipped:</span>
                <FooterArrowLink
                  className="text-foreground"
                  href="/docs/primitives/pixelated-image-reveal"
                >
                  Pixelated Image Reveal
                </FooterArrowLink>
                <span className="opacity-40">·</span>
                <span>New in registry</span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 md:justify-self-end">
              <FooterClock />
            </div>
          </div>
        </div>

        <FooterDivider />

        <div className="py-8 lg:py-16">
          <div className="grid grid-cols-12 gap-4 gap-y-16">
            <div className="col-span-12 flex flex-col gap-8 lg:col-span-5">
              <Link
                aria-label="Sora UI home"
                className="inline-block w-fit"
                href="/"
              >
                <IconLogo className="h-5 w-auto text-foreground" size="md" />
              </Link>

              <FooterNewsletter />
              <FooterSocial />
            </div>

            <FooterNav />
          </div>
        </div>

        <FooterDivider />

        <div className="py-6">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-muted-foreground text-xs uppercase tracking-widest">
              <Suspense fallback={<span>© Sora UI</span>}>
                <FooterCopyright />
              </Suspense>
              <span className="opacity-40">·</span>
              <span>Built by</span>
              <FooterArrowLink external href="https://github.com/axyl1410">
                Axyl
              </FooterArrowLink>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {LEGAL_LINKS.map((link) => (
                <FooterArrowLink
                  external={"external" in link ? link.external : false}
                  href={link.href}
                  key={link.label}
                >
                  {link.label}
                </FooterArrowLink>
              ))}
            </div>
          </div>
        </div>
      </HomeShell>
    </footer>
  );
}
