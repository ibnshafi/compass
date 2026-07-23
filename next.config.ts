import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // LingoQL uses Railpack/Nixpacks which auto-detect Next.js build
  // Standalone output is not needed when deploying on LingoQL
  output: process.env.LINGOQL_DEPLOY === "true" ? undefined : "standalone",

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Enable detailed logging in development
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // Asset prefix for LingoQL CDN
  assetPrefix: process.env.LINGOQL_ASSET_PREFIX || undefined,
};

export default nextConfig;
