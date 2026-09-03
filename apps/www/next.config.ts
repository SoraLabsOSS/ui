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
    "@workspace/auth-ui/lib/auth-core",
    "@workspace/auth-ui/lib/auth-react",
    "@t3-oss/env-core",
    "@t3-oss/env-nextjs",
    "@workspace/auth-ui",
    "@workspace/db",
    "@workspace/ui",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "@workspace/ui"],
    turbopackFileSystemCacheForBuild: true,
    // Experimental native React Compiler path (Next 16.3+). Falls back to
    // babel-plugin-react-compiler if disabled; safe to try on Preview.
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
      { hostname: "cdn.soralabs.studio", pathname: "/**", protocol: "https" },
      { hostname: "avatars.githubusercontent.com" },
    ],
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      // Rewrites for top-level /motion and legacy /primitives to /docs/motion
      {
        source: "/motion",
        destination: "/docs/motion",
      },
      {
        source: "/motion/:path*",
        destination: "/docs/motion/:path*",
      },
      {
        source: "/primitives",
        destination: "/docs/motion",
      },
      {
        source: "/primitives/:path*",
        destination: "/docs/motion/:path*",
      },

      // Rewrites for legacy /components to /catalog
      {
        source: "/components",
        destination: "/catalog",
      },
      {
        source: "/components/:path*",
        destination: "/catalog/:path*",
      },

      // LLMs MDX / MD rewrites
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
      },
      {
        source: "/docs/:path*.md",
        destination: "/llms.mdx/:path*",
      },
      {
        source: "/motion/:path*.mdx",
        destination: "/llms.mdx/motion/:path*",
      },
      {
        source: "/motion/:path*.md",
        destination: "/llms.mdx/motion/:path*",
      },
      {
        source: "/primitives/:path*.mdx",
        destination: "/llms.mdx/motion/:path*",
      },
      {
        source: "/primitives/:path*.md",
        destination: "/llms.mdx/motion/:path*",
      },
      {
        source: "/catalog/:path*.mdx",
        destination: "/llms-catalog.mdx/:path*",
      },
      {
        source: "/catalog/:path*.md",
        destination: "/llms-catalog.mdx/:path*",
      },
      {
        source: "/components/:path*.mdx",
        destination: "/llms-catalog.mdx/:path*",
      },
      {
        source: "/components/:path*.md",
        destination: "/llms-catalog.mdx/:path*",
      },
      {
        source: "/ui/:path*.mdx",
        destination: "/llms-ui.mdx/:path*",
      },
      {
        source: "/ui/:path*.md",
        destination: "/llms-ui.mdx/:path*",
      },
      {
        source: "/ui.mdx",
        destination: "/llms-ui.mdx",
      },
      {
        source: "/ui.md",
        destination: "/llms-ui.mdx",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "ui.soralabs.io.vn" }],
        destination: "https://ui.soralabs.studio/",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "ui.soralabs.io.vn" }],
        destination: "https://ui.soralabs.studio/:path*",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/legal/privacy",
        permanent: true,
      },
      ...buildDocRedirects(appRoot),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // RFC 8288 Link headers so agents can discover the machine-
            // readable surface (llms.txt, sitemap) without parsing HTML.
            key: "Link",
            value: [
              '</llms.txt>; rel="describedby"; type="text/plain"',
              '</sitemap.xml>; rel="sitemap"; type="application/xml"',
            ].join(", "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
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
