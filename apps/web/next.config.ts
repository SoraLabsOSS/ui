import "./src/env";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@t3-oss/env-core", "@t3-oss/env-nextjs"],
  reactCompiler: true,
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
