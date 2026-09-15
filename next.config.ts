import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  /* the share-card routes read their fonts from disk at request time */
  outputFileTracingIncludes: {
    "/r/[id]/*": ["./components/share/fonts/**"],
  },
};

export default nextConfig;
