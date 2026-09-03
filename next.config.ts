import type { NextConfig } from "next";

const configuredApiRoot = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";
const apiProxyTarget = configuredApiRoot || null;

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "header", key: "accept", value: "text/html.*" }],
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
