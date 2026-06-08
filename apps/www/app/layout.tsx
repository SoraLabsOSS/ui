import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@workspace/ui/lib/utils";
import { Banner } from "@/components/banner";
import { Providers } from "@/components/providers";
import { BANNER_DISMISS_CLASS, BANNER_HEIGHT } from "@/lib/banner-config";
import { jsonLd } from "@/lib/json-ld";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  openGraph: {
    title: "Sora UI",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Sora UI",
    // images: [
    //   {
    //     url: "https://ui.soralabs.io.vn/og-image.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "Sora UI",
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@soralabs_io",
    title: "Sora UI",
    description: SITE_DESCRIPTION,
    // images: [
    //   {
    //     url: "https://ui.soralabs.io.vn/og-image.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "Sora UI",
    //   },
    // ],
  },
};

const outfit = Outfit({ subsets: ["latin"] });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html className={cn(outfit.className)} lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k=${JSON.stringify(BANNER_DISMISS_CLASS)};if(localStorage.getItem(k)==="true"){document.documentElement.classList.add(k);}else{document.documentElement.style.setProperty("--fd-banner-height",${JSON.stringify(BANNER_HEIGHT)});}})();`,
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
        <RootProvider>
          <NuqsAdapter>
            <Providers>
              <Banner
                rainbowColors={[
                  "rgba(255,100,0, 0.5)",
                  "rgba(255,100,0, 0.5)",
                  "transparent",
                  "rgba(255,100,0, 0.5)",
                  "transparent",
                  "rgba(255,100,0, 0.5)",
                  "transparent",
                ]}
                variant="rainbow"
              >
                Proudly part of the shadcn/ui registry ecosystem. More
                components coming soon.
              </Banner>
              {children}
            </Providers>
          </NuqsAdapter>
        </RootProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
