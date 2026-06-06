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
import { jsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  metadataBase: new URL("https://ui.soralabs.io.vn"),
  title: {
    template: "%s - Sora UI",
    default: "Sora UI - Animated React Components",
  },
  description:
    "Fully animated, open-source component distribution built with React, TypeScript, Tailwind CSS, Motion and Shadcn CLI. Browse a list of components you can install, modify, and use in your projects.",
  keywords: [
    "Sora UI",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Framer Motion",
    "Open-source components",
    "Animated UI components",
    "UI library",
  ],
  icons: [
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/apple-touch-icon.png",
    },
  ],
  authors: [
    {
      name: "Axyl",
      url: "https://github.com/axyl1410",
    },
  ],
  publisher: "Sora UI",
  openGraph: {
    title: "Sora UI",
    description:
      "Fully animated, open-source component distribution built with React, TypeScript, Tailwind CSS, Motion and Shadcn CLI. Browse a list of components you can install, modify, and use in your projects.",
    url: "https://ui.soralabs.io.vn",
    siteName: "Sora UI",
    images: [
      {
        url: "https://ui.soralabs.io.vn/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sora UI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@animate_ui",
    title: "Sora UI",
    description:
      "Fully animated, open-source component distribution built with React, TypeScript, Tailwind CSS, Motion and Shadcn CLI. Browse a list of components you can install, modify, and use in your projects.",
    images: [
      {
        url: "https://ui.soralabs.io.vn/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sora UI",
      },
    ],
  },
};

const outfit = Outfit({ subsets: ["latin"] });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html className={cn(outfit.className)} lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
        <link href="https://ui.soralabs.io.vn" rel="canonical" />
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
                Sora is in active beta. Data resets may occur during this
                development phase.
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
