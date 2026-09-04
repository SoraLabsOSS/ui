import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import "./globals.css";
import { Toaster } from "@workspace/ui/components/ui/sonner";
import { cn } from "@workspace/ui/lib/utils";
import { MotionConfig } from "motion/react";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { DeferredAnalytics } from "@/components/analytics-deferred";
import { CommandPaletteGroupsProvider } from "@/components/command-palette/command-palette-groups-provider";
import { CommandPaletteSearchDialog } from "@/components/command-palette/command-palette-search-dialog";
import { ConditionalBanner } from "@/components/conditional-banner";
import { GlobalCursorToggle } from "@/components/global-cursor-toggle";
import { QueryClientRootProvider } from "@/components/query-client-root-provider";
import { getCommandPaletteGroups } from "@/lib/command-palette/get-command-palette-items";
import { jsonLd } from "@/lib/json-ld";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";
import {
  getMetadataBaseUrl,
  getPageAlternates,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/site";

const defaultOgImages = getOgMetadataImages([], "Sora UI");
const defaultTwitterImages = getTwitterMetadataImages([]);

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBaseUrl()),
  title: {
    template: "%s - Sora UI",
    default: "Sora UI – Animated React Components for shadcn/ui",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Sora UI",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Motion",
    "GSAP",
    "Animated UI components",
    "UI library",
    "shadcn CLI",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  authors: [
    {
      name: "Axyl",
      url: "https://github.com/axyl1410",
    },
  ],
  publisher: "Sora UI",
  alternates: getPageAlternates("/"),
  openGraph: {
    title: "Sora UI",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Sora UI",
    images: defaultOgImages,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@soralabs_io",
    title: "Sora UI",
    description: SITE_DESCRIPTION,
    images: defaultTwitterImages,
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const commandGroups = getCommandPaletteGroups();

  const app = (
    <RootProvider search={{ SearchDialog: CommandPaletteSearchDialog }}>
      {children}
    </RootProvider>
  );

  return (
    <html className="sf-pro-display" lang="en" suppressHydrationWarning>
      <head>
        <link
          as="font"
          crossOrigin="anonymous"
          href="/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYREGULAR.woff2"
          rel="preload"
          type="font/woff2"
        />
        <link
          as="font"
          crossOrigin="anonymous"
          href="/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYMEDIUM.woff2"
          rel="preload"
          type="font/woff2"
        />
        <link
          as="font"
          crossOrigin="anonymous"
          href="/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYBOLD.woff2"
          rel="preload"
          type="font/woff2"
        />
        <Script suppressHydrationWarning type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </Script>
      </head>

      <body
        className={cn(
          "flex min-h-screen flex-col"
          // Allows to make more attractive video recordings
          // 'screenshot-mode',
        )}
      >
        <NextTopLoader
          color="#fb460d"
          crawl={false}
          height={0}
          shadow={false}
          showAtBottom={true}
          showSpinner={true}
          template='<div class="bar" role="bar" style="display:none"></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
          zIndex={2_147_483_647}
        />
        <ConditionalBanner id="auth-maintenance-banner" variant="rainbow">
          Authentication is temporarily unavailable while we optimize our
          infrastructure.
        </ConditionalBanner>
        <MotionConfig reducedMotion="user">
          <GlobalCursorToggle />
          <CommandPaletteGroupsProvider groups={commandGroups}>
            <NuqsAdapter>
              <QueryClientRootProvider>
                {app}
                <Toaster />
              </QueryClientRootProvider>
            </NuqsAdapter>
          </CommandPaletteGroupsProvider>
        </MotionConfig>
        <DeferredAnalytics />
      </body>
    </html>
  );
}
