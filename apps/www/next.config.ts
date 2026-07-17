import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import "./env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import { buildDocRedirects } from "./lib/docs/build-doc-redirects";

const withMDX = createMDX();
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: [
    "@better-auth-ui/core",
    "@better-auth-ui/react",
    "@t3-oss/env-core",
    "@t3-oss/env-nextjs",
    "@workspace/auth-ui",
    "@workspace/db",
    "@workspace/ui",
  ],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "date-fns",
      "@workspace/ui",
    ],
    turbopackFileSystemCacheForBuild: true,
    turbopackRustReactCompiler: true,
  },
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: "ui.aceternity.com" },
      { hostname: "ui.paceui.com" },
      { hostname: "ph-files.imgix.net" },
      { hostname: "headlessui.com" },
      { hostname: "cdn.prod.website-files.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "plus.unsplash.com" },
      { hostname: "sora.axyl.io.vn", pathname: "/**", protocol: "https" },
      { hostname: "avatars.githubusercontent.com" },
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
    return buildDocRedirects(appRoot);
  },
};

export default withSentryConfig(withBundleAnalyzer(withMDX(nextConfig)), {
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
