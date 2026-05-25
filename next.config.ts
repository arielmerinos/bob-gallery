import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-0c15ab9d193243d2a625e93487ca34e3.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
