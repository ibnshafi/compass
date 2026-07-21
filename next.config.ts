import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is primarily for Docker deployments.
  // Vercel uses its own output format and ignores this setting.
  output: "standalone",

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
};

export default nextConfig;
