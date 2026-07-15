import "./src/env";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@t3-oss/env-core", "@t3-oss/env-nextjs"],
  reactCompiler: true,
};

const withMDX = createMDX({
  options: {
    // Turbopack's MDX loader requires plugins as serializable import
    // specifiers rather than function references.
    rehypePlugins: [["rehype-slug"]],
  },
});

export default withMDX(nextConfig);
