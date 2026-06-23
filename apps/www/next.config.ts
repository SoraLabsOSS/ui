import { withSentryConfig } from "@sentry/nextjs";
import "./env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import { buildDocRedirects } from "./lib/docs/build-doc-redirects";

const withMDX = createMDX();
const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: [
    "@t3-oss/env-core",
    "@t3-oss/env-nextjs",
    "@workspace/auth-ui",
    "@workspace/db",
    "@workspace/ui",
  ],
  experimental: {
    // globalNotFound: true,
  },
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        hostname: "ui.aceternity.com",
      },
      {
        hostname: "ui.paceui.com",
      },
      {
        hostname: "images.pexels.com",
      },
      {
        hostname: "ph-files.imgix.net",
      },
      {
        hostname: "headlessui.com",
      },
      {
        hostname: "30tools.com",
      },
      {
        hostname: "cdn.prod.website-files.com",
      },
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "plus.unsplash.com",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
      },
      {
        source: "/docs/:path*.md",
        destination: "/llms.mdx/:path*",
      },
      {
        source: "/components/:path*.mdx",
        destination: "/llms-components.mdx/:path*",
      },
      {
        source: "/components/:path*.md",
        destination: "/llms-components.mdx/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/docs/components/draw-underline-link",
        destination: "/components/draw-underline-link",
        permanent: true,
      },
      {
        source: "/docs/components/texts/text-reveal",
        destination: "/docs/primitives/text-reveal-blur",
        permanent: true,
      },
      {
        source: "/docs/primitives/text-reveal",
        destination: "/docs/primitives/text-reveal-blur",
        permanent: true,
      },
      {
        source: "/docs/primitives/scroll-text-reveal",
        destination: "/docs/primitives/text-reveal-mask",
        permanent: true,
      },
      {
        source: "/docs/components/avatar-group",
        destination: "/docs/components/animate/avatar-group",
        permanent: true,
      },
      {
        source: "/docs/components/code-editor",
        destination: "/docs/components/animate/code",
        permanent: true,
      },
      {
        source: "/docs/components/code-tabs",
        destination: "/docs/components/animate/code-tabs",
        permanent: true,
      },
      {
        source: "/docs/components/cursor",
        destination: "/docs/components/animate/cursor",
        permanent: true,
      },
      {
        source: "/docs/components/files",
        destination: "/docs/components/radix/files",
        permanent: true,
      },
      {
        source: "/docs/components/motion-grid",
        destination: "/docs/primitives/animate/motion-grid",
        permanent: true,
      },
      {
        source: "/docs/components/pinned-list",
        destination: "/docs/primitives/animate/pinned-list",
        permanent: true,
      },
      {
        source: "/docs/components/scroll-progress",
        destination: "/docs/primitives/animate/scroll-progress",
        permanent: true,
      },
      {
        source: "/docs/components/spring-element",
        destination: "/docs/primitives/animate/spring",
        permanent: true,
      },
      {
        source: "/docs/components/stars-scrolling-wheel",
        destination: "/docs/components/animate/github-stars-wheel",
        permanent: true,
      },
      {
        source: "/docs/components/tabs",
        destination: "/docs/components/animate/tabs",
        permanent: true,
      },
      {
        source: "/docs/components/tooltip",
        destination: "/docs/components/animate/tooltip",
        permanent: true,
      },
      {
        source: "/docs/radix/:path*",
        destination: "/docs/components/radix/:path*",
        permanent: true,
      },
      {
        source: "/docs/base/:path*",
        destination: "/docs/components/radix/:path*",
        permanent: true,
      },
      {
        source: "/docs/headless/:path*",
        destination: "/docs/components/radix/:path*",
        permanent: true,
      },
      {
        source: "/docs/texts/:path*",
        destination: "/docs/primitives/:path*",
        permanent: true,
      },
      {
        source: "/docs/buttons/:path*",
        destination: "/docs/primitives/:path*",
        permanent: true,
      },
      {
        source: "/docs/primitives/buttons/:path*",
        destination: "/docs/primitives/:path*",
        permanent: true,
      },
      {
        source: "/docs/backgrounds/:path*",
        destination: "/docs/components/backgrounds/:path*",
        permanent: true,
      },
      {
        source: "/docs/effects/motion-effect",
        destination: "/docs/primitives/effects/effect",
        permanent: true,
      },
      {
        source: "/docs/effects/motion-highlight",
        destination: "/docs/primitives/effects/highlight",
        permanent: true,
      },
      {
        source: "/docs/effects/:path*",
        destination: "/docs/primitives/effects/:path*",
        permanent: true,
      },
      {
        source: "/docs/ui-elements/:path*",
        destination: "/docs/components/community/:path*",
        permanent: true,
      },
      ...buildDocRedirects(appRoot),
    ];
  },
};

export default withSentryConfig(withMDX(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "axyl",

  project: "sora",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
