import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "store.psg.fr",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
