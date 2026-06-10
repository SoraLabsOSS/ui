import "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@t3-oss/env-core", "@t3-oss/env-nextjs"],
  reactCompiler: true,
};

export default nextConfig;
