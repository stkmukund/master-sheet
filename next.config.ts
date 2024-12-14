import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/:path*', // Matches any route starting from '/'
        destination: '/api/:path*', // Rewrites to the corresponding /api/ endpoint
      },
    ];
  },
};

export default nextConfig;
