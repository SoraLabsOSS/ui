import "./src/env";
import createMDX from "@next/mdx";

const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@t3-oss/env-core", "@t3-oss/env-nextjs"],
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForBuild: true,
    // Experimental native React Compiler path (Next 16.3+).
    turbopackRustReactCompiler: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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

const withMDX = createMDX({
  options: {
    // Turbopack's MDX loader requires plugins as serializable import
    // specifiers rather than function references.
    rehypePlugins: [["rehype-slug"]],
  },
});

export default withMDX(nextConfig);
