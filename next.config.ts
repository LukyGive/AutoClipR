import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net"
      }
    ]
  },
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
