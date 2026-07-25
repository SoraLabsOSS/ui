import { prefetchSession } from "@better-auth-ui/react/server";
import { dehydrate } from "@tanstack/react-query";
import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import "./globals.css";
import { cn } from "@workspace/ui/lib/utils";
import { MotionConfig } from "motion/react";
import { DeferredAnalytics } from "@/components/analytics-deferred";
import { CommandPaletteGroupsProvider } from "@/components/command-palette/command-palette-groups-provider";
import { CommandPaletteSearchDialog } from "@/components/command-palette/command-palette-search-dialog";
import { GlobalCursorToggle } from "@/components/global-cursor-toggle";
import { Providers } from "@/components/providers";
import { SiteBanner } from "@/components/site-banner";
import { auth } from "@/lib/auth";
import {
  getBannerLayoutScript,
  SITE_BANNER_ENABLED,
} from "@/lib/banner-config";
import { getCommandPaletteGroups } from "@/lib/command-palette/get-command-palette-items";
import { jsonLd } from "@/lib/json-ld";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";
import { getQueryClient } from "@/lib/query-client";
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
    default: "Sora UI - Motion-first UI for React",
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

export default async function Layout({ children }: { children: ReactNode }) {
  const commandGroups = getCommandPaletteGroups();
  const bannerLayoutScript = getBannerLayoutScript();

  const queryClient = getQueryClient();
  await prefetchSession(queryClient, auth, { headers: await headers() });
  const dehydratedState = dehydrate(queryClient);

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
        <script
          dangerouslySetInnerHTML={{
            __html: bannerLayoutScript,
          }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      </head>

      <body
        className={cn(
          "flex min-h-screen flex-col"
          // Allows to make more attractive video recordings
          // 'screenshot-mode',
        )}
      >
        <MotionConfig reducedMotion="user">
          <GlobalCursorToggle />
          <CommandPaletteGroupsProvider groups={commandGroups}>
            <NuqsAdapter>
              <Providers dehydratedState={dehydratedState}>
                <RootProvider
                  search={{ SearchDialog: CommandPaletteSearchDialog }}
                >
                  {SITE_BANNER_ENABLED ? <SiteBanner /> : null}
                  {children}
                </RootProvider>
              </Providers>
            </NuqsAdapter>
          </CommandPaletteGroupsProvider>
        </MotionConfig>
        <DeferredAnalytics />
      </body>
    </html>
  );
}
