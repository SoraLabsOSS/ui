import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, Suspense } from "react";

import "./globals.css";
import { Toaster } from "@workspace/ui/components/ui/sonner";
import { cn } from "@workspace/ui/lib/utils";
import { MotionConfig } from "motion/react";
import { DeferredAnalytics } from "@/components/analytics-deferred";
import { CommandPaletteGroupsProvider } from "@/components/command-palette/command-palette-groups-provider";
import { CommandPaletteSearchDialog } from "@/components/command-palette/command-palette-search-dialog";
import { ConditionalBanner } from "@/components/conditional-banner";
import { GlobalCursorToggle } from "@/components/global-cursor-toggle";
import { PageTransitionProvider } from "@/components/page-transition/page-transition-provider";
import { QueryClientRootProvider } from "@/components/query-client-root-provider";
import { isAuthEnabled } from "@/env";
import { getCommandPaletteGroups } from "@/lib/command-palette/get-command-palette-items";
import { fontSfPro } from "@/lib/fonts";
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
    site: "@axyl1410",
    creator: "@axyl1410",
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
    <html
      className={cn(fontSfPro.variable, "font-sans")}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script injection
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
        {!isAuthEnabled() && (
          <Suspense fallback={null}>
            <ConditionalBanner id="auth-maintenance-banner" variant="rainbow">
              Authentication is temporarily unavailable while we optimize our
              infrastructure.
            </ConditionalBanner>
          </Suspense>
        )}
        <MotionConfig reducedMotion="user">
          <GlobalCursorToggle />
          <CommandPaletteGroupsProvider groups={commandGroups}>
            <NuqsAdapter>
              <QueryClientRootProvider>
                <PageTransitionProvider>
                  {app}
                  <Toaster />
                </PageTransitionProvider>
              </QueryClientRootProvider>
            </NuqsAdapter>
          </CommandPaletteGroupsProvider>
        </MotionConfig>
        <DeferredAnalytics />
      </body>
    </html>
  );
}
