import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true, // ✅ skip TypeScript type errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ skip ESLint errors during build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.codechef.com',
      },
    ],
  },
};

export default nextConfig;
